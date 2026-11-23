import { CSSResult, HTMLTemplateResult, LitElement, html, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { UnsubscribeFunc } from 'home-assistant-js-websocket';
import { style } from './styles';
import { careStyle } from './care/styles';
import {
    buildCareRows,
    careDatesFromStates,
    CareInfo,
    CareRow,
    doneConfirmation,
    careHeaderDisplayType,
    formatCareDate,
    initiallyExpanded,
    msUntilMidnight,
    Readings,
    readingsFromPlantInfo,
    RowKey,
    rowKeysFromShowCare,
    snoozedDue,
    statusLabel,
    TodoItem,
} from './care/model';
import { CARE_DISPLAY_TYPES, EntitySuggestion, ExtraBadge, FlowerCareCardConfig, HomeAssistantEntity } from './types/flower-card-types';
import { computeCareDialogState, renderBattery, renderCareDialog, renderExtraBadges } from './utils/attributes';
import { CARE_CARD_NAME, careRowIcons, getCareAreaFields } from './utils/constants';
import { getHassLanguage, localize, localizeWith } from './localize/localize';
import { renderImageDialog, renderPlantHeader } from './utils/header';
import { entityDisplayName, getConfigFormLanguage, getHaVersion, moreInfo, nameSelector, resolveEntityPicture, shouldEnableImageLightbox } from './utils/utils';

const ALL_ROW_KEYS: RowKey[] = ['water', 'fertilize', 'repot', 'prune', 'light', 'soil'];
const CARE_ROW_KEYS: RowKey[] = ['water', 'fertilize', 'repot', 'prune'];
const SNOOZE_CHOICES: { days: number; label: string }[] = [
    { days: 1, label: 'care_snooze_1d' },
    { days: 3, label: 'care_snooze_3d' },
    { days: 7, label: 'care_snooze_1w' },
];

interface PlantCareInfoReply {
    result: Record<string, unknown> & { care?: CareInfo };
}

interface TodoSubscriptionMessage {
    items: TodoItem[];
}

export function validateCareCardConfig(config: Partial<FlowerCareCardConfig>): FlowerCareCardConfig {
    if (!config.entity) {
        throw new Error("You need to define an entity");
    }
    rowKeysFromShowCare(config.show_care);
    if (config.display_type !== undefined && !CARE_DISPLAY_TYPES.includes(config.display_type)) {
        throw new Error(`Unknown display_type "${config.display_type}"; use one of: ${CARE_DISPLAY_TYPES.join(', ')}`);
    }
    return config as FlowerCareCardConfig;
}

export const getCareCardEntitySuggestion = (hass: HomeAssistant, entityId: string): EntitySuggestion<FlowerCareCardConfig>[] | null => {
    if (entityId.split('.')[0] !== 'plant') {
        return null;
    }
    return [
        { label: 'Full', config: { type: `custom:${CARE_CARD_NAME}`, entity: entityId, display_type: 'full' } },
        { label: 'Folded', config: { type: `custom:${CARE_CARD_NAME}`, entity: entityId, display_type: 'folded' } },
        { label: 'Compact', config: { type: `custom:${CARE_CARD_NAME}`, entity: entityId, display_type: 'compact' } },
    ];
};

/* eslint-disable @typescript-eslint/no-explicit-any */
(window as any).customCards = (window as any).customCards || [];
const alreadyListed = (window as any).customCards.some((card: { type: string }) => card.type === CARE_CARD_NAME);
if (!alreadyListed) {
    (window as any).customCards.push({
        type: CARE_CARD_NAME,
        name: localize({ language: getConfigFormLanguage() }, 'care_card_name'),
        preview: true,
        description: 'Care tasks for a plant from https://github.com/Olen/homeassistant-plant',
        getEntitySuggestion: getCareCardEntitySuggestion,
    });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default class FlowerCareCard extends LitElement {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @state() _hass?: any;
    @state() config?: FlowerCareCardConfig;
    // undefined until plant/get_info has answered; null when plant sends no care block
    @state() private care: CareInfo | null | undefined = undefined;
    @state() private items: TodoItem[] = [];
    @state() private readings: Readings = {};
    @state() private expanded: Set<RowKey> = new Set();
    @state() private _snoozeMenuRow: RowKey | null = null;
    @state() private _confirmDialogOpen = false;
    @state() private _confirmRow: CareRow | null = null;
    @state() private _confirmText = '';
    @state() private _careDialogOpen = false;
    @state() private _imageDialogOpen = false;
    @state() private _careDialogFields: string[] = [];
    @state() private _careDialogTitle = '';

    private stateObj: HomeAssistantEntity | undefined;
    private previousFetchDate = 0;
    private _lastEntityPicture: string | undefined;
    private _resolvedImageUrl: string | undefined;
    private _subscribedList: string | null = null;
    private _unsubscribeTodo: Promise<UnsubscribeFunc> | null = null;
    private _midnightTimer: ReturnType<typeof setTimeout> | undefined;

    set hass(hass: HomeAssistant) {
        this._hass = hass;
        this.stateObj = this.config?.entity ? hass.states[this.config.entity] as HomeAssistantEntity : undefined;

        const entityPicture = this.stateObj?.attributes.entity_picture;
        if (entityPicture !== this._lastEntityPicture) {
            this._lastEntityPicture = entityPicture;
            this._resolveEntityPicture(hass, entityPicture);
        }

        // Only fetch once every second at max. HA is flooded with websocket requests
        if (Date.now() > this.previousFetchDate + 1000) {
            this.previousFetchDate = Date.now();
            this.fetchCare(hass);
        }
    }

    private _resolveEntityPicture(hass: HomeAssistant, entityPicture: string | undefined): void {
        resolveEntityPicture(hass, entityPicture, (url) => {
            this._resolvedImageUrl = url;
            this.requestUpdate();
        });
    }

    private async fetchCare(hass: HomeAssistant): Promise<void> {
        let reply: PlantCareInfoReply;
        try {
            reply = await hass.callWS<PlantCareInfoReply>({
                type: "plant/get_info",
                entity_id: this.config?.entity,
            });
        } catch (err) {
            console.warn(`Flower care card: Failed to fetch data for ${this.config?.entity}:`, err);
            return;
        }
        this.care = reply.result.care ?? null;
        this.readings = readingsFromPlantInfo(reply.result);
        this.syncTodoSubscription();
    }

    private syncTodoSubscription(): void {
        if (!this.isConnected || this.care === undefined) {
            return;
        }
        const wanted = this.care === null ? null : this.care.todo_list;
        if (wanted === this._subscribedList) {
            return;
        }
        this.unsubscribeTodo();
        this.items = [];
        this._subscribedList = wanted;
        if (wanted === null) {
            return;
        }
        const subscription = this._hass.connection.subscribeMessage(
            (message: TodoSubscriptionMessage) => {
                // Messages for a list we have just left can still arrive before the unsubscribe lands
                if (this._subscribedList === wanted) {
                    this.items = message.items;
                }
            },
            { type: 'todo/item/subscribe', entity_id: wanted },
        ) as Promise<UnsubscribeFunc>;
        subscription.catch((err: unknown) => {
            console.warn(`Flower care card: Failed to subscribe to ${wanted}:`, err);
        });
        this._unsubscribeTodo = subscription;
    }

    private unsubscribeTodo(): void {
        const subscription = this._unsubscribeTodo;
        this._unsubscribeTodo = null;
        this._subscribedList = null;
        if (subscription === null) {
            return;
        }
        // A failed subscription has already been reported; there is nothing to undo
        subscription.then((unsubscribe) => unsubscribe(), () => undefined);
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.armMidnightTimer();
        this.syncTodoSubscription();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        clearTimeout(this._midnightTimer);
        this._midnightTimer = undefined;
        this.unsubscribeTodo();
    }

    private armMidnightTimer(): void {
        clearTimeout(this._midnightTimer);
        this._midnightTimer = setTimeout(() => {
            this.requestUpdate();
            this.armMidnightTimer();
        }, msUntilMidnight(new Date()));
    }

    static getConfigForm() {
        const language = getConfigFormLanguage();
        return {
            schema: [
                {
                    name: "entity",
                    required: true,
                    selector: { entity: { domain: "plant" } }
                },
                nameSelector(getHaVersion()),
                {
                    name: "battery_sensor",
                    selector: { entity: { domain: "sensor", device_class: "battery" } }
                },
                {
                    type: "expandable",
                    name: "",
                    title: localize({ language }, 'settings_care_info'),
                    schema: [
                        {
                            name: "show_care",
                            selector: {
                                select: {
                                    multiple: true,
                                    options: getCareAreaFields(language)
                                }
                            }
                        }
                    ]
                },
                {
                    type: "expandable",
                    name: "",
                    title: localize({ language }, 'settings_appearance'),
                    schema: [
                        {
                            name: "display_type",
                            selector: {
                                select: {
                                    options: [
                                        { value: "full", label: localize({ language }, 'settings_full') },
                                        { value: "folded", label: localize({ language }, 'settings_folded') },
                                        { value: "compact", label: localize({ language }, 'settings_compact') }
                                    ]
                                }
                            }
                        },
                        {
                            name: "hide_species",
                            selector: { boolean: {} }
                        },
                        {
                            name: "hide_image",
                            selector: { boolean: {} }
                        }
                    ]
                }
            ],
            computeLabel: (schema: { name: string }) => {
                const labels: Record<string, string> = {
                    entity: localize({ language }, 'settings_entity'),
                    name: localize({ language }, 'settings_display_name'),
                    display_type: localize({ language }, 'settings_display_type'),
                    battery_sensor: localize({ language }, 'settings_battery_sensor'),
                    show_care: localize({ language }, 'settings_show_care_info'),
                    hide_species: localize({ language }, 'settings_hide_species'),
                    hide_image: localize({ language }, 'settings_hide_image'),
                };
                return labels[schema.name] || schema.name;
            }
        };
    }

    static getStubConfig(ha: HomeAssistant) {
        const plantId = Object.keys(ha.states).find((entityId) => entityId.startsWith('plant.'));
        return {
            entity: plantId ?? 'plant.my_plant',
            display_type: 'full',
        };
    }

    setConfig(config: FlowerCareCardConfig): void {
        this.config = validateCareCardConfig(config);
        this.expanded = initiallyExpanded(this.config.display_type) ? new Set(ALL_ROW_KEYS) : new Set();
    }

    getCardSize(): number {
        return 6;
    }

    getGridOptions() {
        return { columns: 6, min_columns: 4, rows: 'auto' };
    }

    private toggleRow(key: RowKey): void {
        const expanded = new Set(this.expanded);
        if (expanded.has(key)) {
            expanded.delete(key);
        } else {
            expanded.add(key);
        }
        this.expanded = expanded;
    }

    private toggleSnoozeMenu(key: RowKey): void {
        this._snoozeMenuRow = this._snoozeMenuRow === key ? null : key;
    }

    private snooze(row: CareRow, days: number): void {
        const snooze = row.snooze;
        if (snooze === null || !this.care?.todo_list) {
            throw new Error(`Cannot snooze the ${row.key} row`);
        }
        const dueDate = snoozedDue(snooze.due, days, new Date());
        for (const uid of snooze.uids) {
            this._hass.callService('todo', 'update_item', { item: uid, due_date: dueDate }, { entity_id: this.care.todo_list })
                .catch((err: unknown) => console.warn(`Flower care card: Failed to snooze ${row.key} for ${this.config?.entity}:`, err));
        }
        this._snoozeMenuRow = null;
    }

    private pressDone(row: CareRow): void {
        const confirmation = doneConfirmation(row);
        if (confirmation === null) {
            this.completeRow(row);
            return;
        }
        this.openConfirmDialog(row, confirmation.date);
    }

    private completeRow(row: CareRow): void {
        const done = row.done;
        if (done === null || !this.care?.todo_list) {
            throw new Error(`Cannot complete the ${row.key} row`);
        }
        for (const uid of done.uids) {
            this._hass.callService('todo', 'update_item', { item: uid, status: 'completed' }, { entity_id: this.care.todo_list })
                .catch((err: unknown) => console.warn(`Flower care card: Failed to mark ${row.key} as done for ${this.config?.entity}:`, err));
        }
    }

    openCareDialog(badge: ExtraBadge): void {
        const { open, fields, title } = computeCareDialogState(badge, getHassLanguage(this._hass));
        this._careDialogFields = fields;
        this._careDialogTitle = title;
        this._careDialogOpen = open;
    }

    private _closeCareDialog(): void {
        this._careDialogOpen = false;
    }

    private renderCareDialog(): HTMLTemplateResult {
        const attributes = this.stateObj?.attributes;
        return renderCareDialog(this._hass, attributes, this._careDialogFields, this._careDialogTitle, () => this._closeCareDialog());
    }

    openImageDialog(): void {
        this._imageDialogOpen = true;
    }

    private _closeImageDialog(): void {
        this._imageDialogOpen = false;
    }

    private renderImageDialog(): HTMLTemplateResult {
        const displayName = this.stateObj ? entityDisplayName(this._hass, this.stateObj, this.config?.name) : '';
        return renderImageDialog(this._resolvedImageUrl, displayName, () => this._closeImageDialog());
    }

    openConfirmDialog(row: CareRow, date: string | null): void {
        this._confirmRow = row;
        if (date === null) {
            this._confirmText = localize(this._hass, 'care_confirm_early_undated');
        } else {
            this._confirmText = localizeWith(this._hass, 'care_confirm_early', { date: formatCareDate(date, getHassLanguage(this._hass)) });
        }
        this._confirmDialogOpen = true;
    }

    private _closeConfirmDialog(): void {
        this._confirmDialogOpen = false;
        this._confirmRow = null;
    }

    private confirmDone(): void {
        const row = this._confirmRow;
        if (row === null) {
            throw new Error('No row to confirm');
        }
        this.completeRow(row);
        this._closeConfirmDialog();
    }

    private renderConfirmDialog(): HTMLTemplateResult {
        return html`
            <ha-dialog open @closed="${() => this._closeConfirmDialog()}">
                <div>${this._confirmText}</div>
                <div class="care-confirm-actions">
                    <button class="care-button outlined" @click="${() => this._closeConfirmDialog()}">
                        ${localize(this._hass, 'care_cancel')}
                    </button>
                    <button class="care-button solid" @click="${() => this.confirmDone()}">
                        ${localize(this._hass, 'care_confirm_done')}
                    </button>
                </div>
            </ha-dialog>
        `;
    }

    private statusText(row: CareRow, now: Date): string {
        const label = statusLabel(row.status, now);
        if (label === null) {
            return '';
        }
        const values: Record<string, string | number> = {};
        if (label.n !== undefined) {
            values.n = label.n;
        }
        if (label.date !== undefined) {
            values.date = formatCareDate(label.date, getHassLanguage(this._hass));
        }
        return localizeWith(this._hass, label.key, values);
    }

    private renderSubLine(row: CareRow): HTMLTemplateResult | typeof nothing {
        if (!CARE_ROW_KEYS.includes(row.key)) {
            return nothing;
        }
        const parts: string[] = this.readingParts(row);
        if (row.lastDone === null) {
            parts.push(localize(this._hass, 'care_not_recorded'));
        } else {
            parts.push(localizeWith(this._hass, 'care_last', { date: formatCareDate(row.lastDone, getHassLanguage(this._hass)) }));
        }
        if (row.intervalDays !== null) {
            parts.push(localizeWith(this._hass, 'care_every', { n: row.intervalDays }));
        }
        return html`<div class="care-row-sub">${parts.join(' · ')}</div>`;
    }

    private readingParts(row: CareRow): string[] {
        const reading = row.reading;
        if (reading === null) {
            return [];
        }
        const key = row.key === 'water' ? 'care_reading_moisture' : 'care_reading_conductivity';
        return [
            localizeWith(this._hass, key, { value: reading.value, unit: reading.unit }),
            localizeWith(this._hass, 'care_reading_min', { min: `${reading.min} ${reading.unit}` }),
        ];
    }

    private renderMoistureBar(row: CareRow): HTMLTemplateResult | typeof nothing {
        if (row.key !== 'water' || row.reading === null || row.reading.barFraction === null) {
            return nothing;
        }
        return html`<div class="care-progress"><div class="moisture" style="width: ${row.reading.barFraction * 100}%"></div></div>`;
    }

    private renderProgress(row: CareRow): HTMLTemplateResult | typeof nothing {
        if (row.progress === null) {
            return nothing;
        }
        const overdue = row.status.kind === 'overdue' ? 'overdue' : '';
        return html`<div class="care-progress"><div class="${overdue}" style="width: ${row.progress * 100}%"></div></div>`;
    }

    private renderSnoozeButton(row: CareRow): HTMLTemplateResult | typeof nothing {
        if (row.snooze === null) {
            return nothing;
        }
        return html`
            <button class="care-icon-button" title="${localize(this._hass, 'care_snooze')}"
                @click="${(e: Event) => { e.stopPropagation(); this.toggleSnoozeMenu(row.key); }}">
                <ha-icon .icon="${'mdi:alarm-snooze'}"></ha-icon>
            </button>`;
    }

    private renderSnoozeMenu(row: CareRow): HTMLTemplateResult | typeof nothing {
        if (row.snooze === null || this._snoozeMenuRow !== row.key) {
            return nothing;
        }
        return html`
            <div class="care-snooze-menu">
                ${SNOOZE_CHOICES.map((choice) => html`
                    <button class="care-button outlined" @click="${() => this.snooze(row, choice.days)}">
                        +${localize(this._hass, choice.label)}
                    </button>`)}
            </div>`;
    }

    private renderDoneButton(row: CareRow): HTMLTemplateResult | typeof nothing {
        if (row.done === null) {
            return nothing;
        }
        return html`
            <button class="care-button ${row.done.emphasis}"
                @click="${(e: Event) => { e.stopPropagation(); this.pressDone(row); }}">
                ${localize(this._hass, 'care_done')}
            </button>`;
    }

    private renderRow(row: CareRow, now: Date): HTMLTemplateResult {
        const expanded = this.expanded.has(row.key);
        return html`
            <div class="care-row care-row-${row.key} ${row.alert ? 'alert' : ''} ${expanded ? '' : 'folded'}">
                <div class="care-row-head" @click="${() => this.toggleRow(row.key)}">
                    <ha-icon .icon="${careRowIcons[row.key]}"></ha-icon>
                    <span class="care-row-title">${localize(this._hass, `care_row_${row.key}`)}</span>
                    <span class="care-row-status">${this.statusText(row, now)}</span>
                    <span class="care-row-actions">
                        ${this.renderSnoozeButton(row)}
                        ${this.renderDoneButton(row)}
                    </span>
                </div>
                ${this.renderSnoozeMenu(row)}
                ${expanded ? html`
                    ${this.renderMoistureBar(row)}
                    ${this.renderProgress(row)}
                    ${this.renderSubLine(row)}
                    ${row.texts.map((text) => html`<div class="care-text">${text}</div>`)}
                ` : nothing}
            </div>`;
    }

    private renderHint(care: CareInfo | null): HTMLTemplateResult | typeof nothing {
        if (care === null) {
            return html`<div class="care-hint">${localize(this._hass, 'care_needs_plant')}</div>`;
        }
        if (care.todo_list === null) {
            return html`<div class="care-hint">${localize(this._hass, 'care_no_list')}</div>`;
        }
        return nothing;
    }

    private renderBody(stateObj: HomeAssistantEntity): HTMLTemplateResult | typeof nothing {
        const care = this.care;
        if (care === undefined) {
            return nothing;
        }
        const now = new Date();
        const dates = careDatesFromStates(care, this._hass.states);
        const allRows = buildCareRows({
            plantEntityId: stateObj.entity_id,
            attributes: stateObj.attributes,
            care,
            items: this.items,
            lastDone: dates.lastDone,
            nextWatering: dates.nextWatering,
            readings: this.readings,
        }, now);
        const shown = rowKeysFromShowCare(this.config?.show_care);
        const rows = allRows.filter((row) => shown.has(row.key));
        return html`
            <div class="care-body">
                <div class="care-rows">
                    ${rows.map((row) => this.renderRow(row, now))}
                    ${this.renderHint(care)}
                </div>
            </div>`;
    }

    render(): HTMLTemplateResult {
        if (!this.config || !this._hass) return html``;

        if (!this.stateObj) {
            this._confirmDialogOpen = false;
            this._careDialogOpen = false;
            this._imageDialogOpen = false;
            return html`
                <hui-warning>
                Entity not available: ${this.config.entity}
                </hui-warning>
              `;
        }
        const stateObj = this.stateObj;
        const hideSpecies = this.config.hide_species ?? false;
        const hideImage = this.config.hide_image ?? false;
        const haCardCssClass = (careHeaderDisplayType(this.config.display_type) === 'compact' || hideImage) ? "" : "card-margin-top";

        return html`
            <ha-card class="${haCardCssClass}">
            ${renderPlantHeader({
                hass: this._hass,
                stateObj,
                displayType: careHeaderDisplayType(this.config.display_type),
                hideImage,
                hideSpecies,
                name: this.config.name,
                imageUrl: this._resolvedImageUrl,
                badges: html`${renderExtraBadges(this)}${renderBattery(this)}`,
                imageLightbox: shouldEnableImageLightbox(hideImage, this._resolvedImageUrl),
                onImageClick: () => this.openImageDialog(),
                onClick: () => moreInfo(this, stateObj.entity_id),
            })}
            <div class="divider"></div>
            ${this.renderBody(stateObj)}
            </ha-card>
            ${this._confirmDialogOpen ? this.renderConfirmDialog() : html``}
            ${this._careDialogOpen ? this.renderCareDialog() : html``}
            ${this._imageDialogOpen ? this.renderImageDialog() : html``}
            `;
    }

    static get styles(): CSSResult[] {
        return [style, careStyle];
    }
}

// Plant serves its own copy, so another copy may already have defined the card
if (!customElements.get(CARE_CARD_NAME)) {
    customElements.define(CARE_CARD_NAME, FlowerCareCard);
}
