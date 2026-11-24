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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Hass = any;

/** Live items of a set of to-do lists, one subscription per list. */
export class TodoSubscriptions {
    private subscriptions = new Map<string, Promise<UnsubscribeFunc>>();
    private itemsByList = new Map<string, TodoItem[]>();
    private cardName: string;
    private onChange: () => void;

    constructor(cardName: string, onChange: () => void) {
        this.cardName = cardName;
        this.onChange = onChange;
    }

    items(list: string): TodoItem[] {
        return this.itemsByList.get(list) ?? [];
    }

    /** Subscribes to the lists in `wanted` and drops every other subscription. */
    sync(hass: Hass, wanted: Set<string>): void {
        for (const list of [...this.subscriptions.keys()]) {
            if (!wanted.has(list)) {
                this.drop(list);
            }
        }
        for (const list of wanted) {
            if (!this.subscriptions.has(list)) {
                this.subscribe(hass, list);
            }
        }
    }

    close(): void {
        for (const list of [...this.subscriptions.keys()]) {
            this.drop(list);
        }
    }

    private subscribe(hass: Hass, list: string): void {
        const subscription = hass.connection.subscribeMessage(
            (message: TodoSubscriptionMessage) => {
                // Messages for a list we have just left can still arrive before the unsubscribe lands
                if (this.subscriptions.has(list)) {
                    this.itemsByList.set(list, message.items);
                    this.onChange();
                }
            },
            { type: 'todo/item/subscribe', entity_id: list },
        ) as Promise<UnsubscribeFunc>;
        subscription.catch((err: unknown) => {
            console.warn(`${this.cardName}: Failed to subscribe to ${list}:`, err);
        });
        this.subscriptions.set(list, subscription);
    }

    private drop(list: string): void {
        const subscription = this.subscriptions.get(list);
        this.subscriptions.delete(list);
        this.itemsByList.delete(list);
        // A failed subscription has already been reported; there is nothing to undo
        subscription?.then((unsubscribe) => unsubscribe(), () => undefined);
    }
}

/** Re-renders the host just after midnight, so "today" moves. */
export class MidnightRefresh implements ReactiveController {
    private host: ReactiveControllerHost;
    private timer: ReturnType<typeof setTimeout> | undefined;

    constructor(host: ReactiveControllerHost) {
        this.host = host;
        host.addController(this);
    }

    hostConnected(): void {
        this.arm();
    }

    hostDisconnected(): void {
        clearTimeout(this.timer);
        this.timer = undefined;
    }

    private arm(): void {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.host.requestUpdate();
            this.arm();
        }, msUntilMidnight(new Date()));
    }
}

/** The "not due yet, mark as done?" dialog. */
export class ConfirmDoneDialog {
    private host: ReactiveControllerHost;
    private text = '';
    private onConfirm: (() => void) | null = null;

    constructor(host: ReactiveControllerHost) {
        this.host = host;
    }

    ask(text: string, onConfirm: () => void): void {
        this.text = text;
        this.onConfirm = onConfirm;
        this.host.requestUpdate();
    }

    close(): void {
        // Also called from render(), where an update request for a closed dialog would loop
        if (this.onConfirm === null) {
            return;
        }
        this.onConfirm = null;
        this.host.requestUpdate();
    }

    render(hass: Hass): HTMLTemplateResult {
        if (this.onConfirm === null) {
            return html``;
        }
        return html`
            <ha-dialog open @closed="${() => this.close()}">
                <div>${this.text}</div>
                <div class="care-confirm-actions">
                    <button class="care-button outlined" @click="${() => this.close()}">
                        ${localize(hass, 'care_cancel')}
                    </button>
                    <button class="care-button solid" @click="${() => this.confirm()}">
                        ${localize(hass, 'care_confirm_done')}
                    </button>
                </div>
            </ha-dialog>
        `;
    }

    private confirm(): void {
        const onConfirm = this.onConfirm;
        if (onConfirm === null) {
            throw new Error('No action to confirm');
        }
        onConfirm();
        this.close();
    }
}

export function careStatusText(hass: Hass, row: CareRow, now: Date): string {
    const label = statusLabel(row.status, now);
    if (label === null) {
        return '';
    }
    const values: Record<string, string | number> = {};
    if (label.n !== undefined) {
        values.n = label.n;
    }
    if (label.date !== undefined) {
        values.date = formatCareDate(label.date, getHassLanguage(hass));
    }
    return localizeWith(hass, label.key, values);
}

/** Completes the row's open items, asking first when the task is not due yet. */
export function pressCareDone(hass: Hass, dialog: ConfirmDoneDialog, list: string, row: CareRow, cardName: string): void {
    const confirmation = doneConfirmation(row);
    if (confirmation === null) {
        completeCareRow(hass, list, row, cardName);
        return;
    }
    let text: string;
    if (confirmation.date === null) {
        text = localize(hass, 'care_confirm_early_undated');
    } else {
        text = localizeWith(hass, 'care_confirm_early', { date: formatCareDate(confirmation.date, getHassLanguage(hass)) });
    }
    dialog.ask(text, () => completeCareRow(hass, list, row, cardName));
}

export function completeCareRow(hass: Hass, list: string, row: CareRow, cardName: string): void {
    if (row.done === null) {
        throw new Error(`Cannot complete the ${row.key} row`);
    }
    for (const uid of row.done.uids) {
        hass.callService('todo', 'update_item', { item: uid, status: 'completed' }, { entity_id: list })
            .catch((err: unknown) => console.warn(`${cardName}: Failed to mark ${row.key} as done:`, err));
    }
}

export function snoozeCareRow(hass: Hass, list: string, row: CareRow, days: number, cardName: string): void {
    const snooze = row.snooze;
    if (snooze === null) {
        throw new Error(`Cannot snooze the ${row.key} row`);
    }
    const dueDate = snoozedDue(snooze.due, days, new Date());
    for (const uid of snooze.uids) {
        hass.callService('todo', 'update_item', { item: uid, due_date: dueDate }, { entity_id: list })
            .catch((err: unknown) => console.warn(`${cardName}: Failed to snooze ${row.key}:`, err));
    }
}

/** Care state for one plant: the care block, its to-do items, Done, snooze and the early-Done dialog. */
export class CareTasksController implements ReactiveController {
    hass?: Hass;
    // undefined until plant/get_info has answered; null when plant sends no care block
    care: CareInfo | null | undefined = undefined;
    readings: Readings = {};

    private host: CareHost;
    private cardName: string;
    private todo: TodoSubscriptions;
    private dialog: ConfirmDoneDialog;

    constructor(host: CareHost, cardName: string) {
        this.host = host;
        this.cardName = cardName;
        this.todo = new TodoSubscriptions(cardName, () => host.requestUpdate());
        this.dialog = new ConfirmDoneDialog(host);
        new MidnightRefresh(host);
        host.addController(this);
    }

    hostConnected(): void {
        this.syncTodoSubscription();
    }

    hostDisconnected(): void {
        this.todo.close();
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
        const list = care?.todo_list ?? null;
        return buildCareRows({
            plantEntityId: stateObj.entity_id,
            attributes: stateObj.attributes,
            care,
            items: list === null ? [] : this.todo.items(list),
            lastDone: dates.lastDone,
            nextWatering: dates.nextWatering,
            readings: this.readings,
        }, now);
    }

    statusText(row: CareRow, now: Date): string {
        return careStatusText(this.hass, row, now);
    }

    pressDone(row: CareRow): void {
        pressCareDone(this.hass, this.dialog, this.list(row), row, this.cardName);
    }

    snooze(row: CareRow, days: number): void {
        snoozeCareRow(this.hass, this.list(row), row, days, this.cardName);
    }

    closeDialogs(): void {
        this.dialog.close();
    }

    renderConfirmDialog(): HTMLTemplateResult {
        return this.dialog.render(this.hass);
    }

    private list(row: CareRow): string {
        const list = this.care?.todo_list;
        if (!list) {
            throw new Error(`No to-do list for the ${row.key} row`);
        }
        return list;
    }

    private syncTodoSubscription(): void {
        if (!this.host.isConnected || this.care === undefined || !this.hass) {
            return;
        }
        const list = this.care?.todo_list ?? null;
        this.todo.sync(this.hass, list === null ? new Set() : new Set([list]));
    }
}
