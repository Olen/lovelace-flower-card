import { HTMLTemplateResult, ReactiveController, ReactiveControllerHost, html } from 'lit';
import { UnsubscribeFunc } from 'home-assistant-js-websocket';
import {
    buildCareRows,
    careDatesFromStates,
    CareInfo,
    CareRow,
    doneConfirmation,
    formatCareDate,
    msUntilMidnight,
    Readings,
    readingsFromPlantInfo,
    snoozedDue,
    statusLabel,
    TodoItem,
} from './model';
import { HomeAssistantEntity } from '../types/flower-card-types';
import { getHassLanguage, localize, localizeWith } from '../localize/localize';

interface TodoSubscriptionMessage {
    items: TodoItem[];
}

type CareHost = ReactiveControllerHost & HTMLElement;

/** Care state for one plant: the care block, its to-do items, Done, snooze and the early-Done dialog. */
export class CareTasksController implements ReactiveController {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hass?: any;
    // undefined until plant/get_info has answered; null when plant sends no care block
    care: CareInfo | null | undefined = undefined;
    items: TodoItem[] = [];
    readings: Readings = {};

    private host: CareHost;
    private cardName: string;
    private subscribedList: string | null = null;
    private unsubscribe: Promise<UnsubscribeFunc> | null = null;
    private midnightTimer: ReturnType<typeof setTimeout> | undefined;
    private confirmRow: CareRow | null = null;
    private confirmText = '';

    constructor(host: CareHost, cardName: string) {
        this.host = host;
        this.cardName = cardName;
        host.addController(this);
    }

    hostConnected(): void {
        this.armMidnightTimer();
        this.syncTodoSubscription();
    }

    hostDisconnected(): void {
        clearTimeout(this.midnightTimer);
        this.midnightTimer = undefined;
        this.unsubscribeTodo();
    }

    /** Takes a `plant/get_info` result. */
    setPlantInfo(result: Record<string, unknown>): void {
        this.care = (result.care as CareInfo | undefined) ?? null;
        this.readings = readingsFromPlantInfo(result);
        this.syncTodoSubscription();
        this.host.requestUpdate();
    }

    rows(stateObj: HomeAssistantEntity, now: Date): CareRow[] {
        const care = this.care ?? null;
        const dates = careDatesFromStates(care, this.hass.states);
        return buildCareRows({
            plantEntityId: stateObj.entity_id,
            attributes: stateObj.attributes,
            care,
            items: this.items,
            lastDone: dates.lastDone,
            nextWatering: dates.nextWatering,
            readings: this.readings,
        }, now);
    }

    statusText(row: CareRow, now: Date): string {
        const label = statusLabel(row.status, now);
        if (label === null) {
            return '';
        }
        const values: Record<string, string | number> = {};
        if (label.n !== undefined) {
            values.n = label.n;
        }
        if (label.date !== undefined) {
            values.date = formatCareDate(label.date, getHassLanguage(this.hass));
        }
        return localizeWith(this.hass, label.key, values);
    }

    pressDone(row: CareRow): void {
        const confirmation = doneConfirmation(row);
        if (confirmation === null) {
            this.complete(row);
            return;
        }
        this.confirmRow = row;
        if (confirmation.date === null) {
            this.confirmText = localize(this.hass, 'care_confirm_early_undated');
        } else {
            const date = formatCareDate(confirmation.date, getHassLanguage(this.hass));
            this.confirmText = localizeWith(this.hass, 'care_confirm_early', { date });
        }
        this.host.requestUpdate();
    }

    snooze(row: CareRow, days: number): void {
        const snooze = row.snooze;
        const list = this.care?.todo_list;
        if (snooze === null || !list) {
            throw new Error(`Cannot snooze the ${row.key} row`);
        }
        const dueDate = snoozedDue(snooze.due, days, new Date());
        for (const uid of snooze.uids) {
            this.hass.callService('todo', 'update_item', { item: uid, due_date: dueDate }, { entity_id: list })
                .catch((err: unknown) => console.warn(`${this.cardName}: Failed to snooze ${row.key}:`, err));
        }
    }

    closeDialogs(): void {
        this.confirmRow = null;
    }

    renderConfirmDialog(): HTMLTemplateResult {
        if (this.confirmRow === null) {
            return html``;
        }
        return html`
            <ha-dialog open @closed="${() => this.cancelConfirm()}">
                <div>${this.confirmText}</div>
                <div class="care-confirm-actions">
                    <button class="care-button outlined" @click="${() => this.cancelConfirm()}">
                        ${localize(this.hass, 'care_cancel')}
                    </button>
                    <button class="care-button solid" @click="${() => this.confirmDone()}">
                        ${localize(this.hass, 'care_confirm_done')}
                    </button>
                </div>
            </ha-dialog>
        `;
    }

    private cancelConfirm(): void {
        this.confirmRow = null;
        this.host.requestUpdate();
    }

    private confirmDone(): void {
        const row = this.confirmRow;
        if (row === null) {
            throw new Error('No row to confirm');
        }
        this.complete(row);
        this.cancelConfirm();
    }

    private complete(row: CareRow): void {
        const done = row.done;
        const list = this.care?.todo_list;
        if (done === null || !list) {
            throw new Error(`Cannot complete the ${row.key} row`);
        }
        for (const uid of done.uids) {
            this.hass.callService('todo', 'update_item', { item: uid, status: 'completed' }, { entity_id: list })
                .catch((err: unknown) => console.warn(`${this.cardName}: Failed to mark ${row.key} as done:`, err));
        }
    }

    private syncTodoSubscription(): void {
        if (!this.host.isConnected || this.care === undefined || !this.hass) {
            return;
        }
        const wanted = this.care === null ? null : this.care.todo_list;
        if (wanted === this.subscribedList) {
            return;
        }
        this.unsubscribeTodo();
        this.items = [];
        this.subscribedList = wanted;
        if (wanted === null) {
            return;
        }
        const subscription = this.hass.connection.subscribeMessage(
            (message: TodoSubscriptionMessage) => {
                // Messages for a list we have just left can still arrive before the unsubscribe lands
                if (this.subscribedList === wanted) {
                    this.items = message.items;
                    this.host.requestUpdate();
                }
            },
            { type: 'todo/item/subscribe', entity_id: wanted },
        ) as Promise<UnsubscribeFunc>;
        subscription.catch((err: unknown) => {
            console.warn(`${this.cardName}: Failed to subscribe to ${wanted}:`, err);
        });
        this.unsubscribe = subscription;
    }

    private unsubscribeTodo(): void {
        const subscription = this.unsubscribe;
        this.unsubscribe = null;
        this.subscribedList = null;
        if (subscription === null) {
            return;
        }
        // A failed subscription has already been reported; there is nothing to undo
        subscription.then((unsubscribe) => unsubscribe(), () => undefined);
    }

    private armMidnightTimer(): void {
        clearTimeout(this.midnightTimer);
        this.midnightTimer = setTimeout(() => {
            this.host.requestUpdate();
            this.armMidnightTimer();
        }, msUntilMidnight(new Date()));
    }
}
