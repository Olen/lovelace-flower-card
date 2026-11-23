import { CSSResult, HTMLTemplateResult, LitElement, html, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { careButtonStyle } from './care/styles';
import { agendaStyle } from './care/agenda-styles';
import {
    careStatusText,
    completeCareRow,
    ConfirmDoneDialog,
    MidnightRefresh,
    pressCareDone,
    snoozeCareRow,
    TodoSubscriptions,
} from './care/controller';
import { buildCareRows, careDatesFromStates, CareInfo, CareRow, CareType } from './care/model';
import {
    agendaCareTypes,
    agendaSummary,
    agendaTasks,
    AgendaGroup,
    AgendaTask,
    bulkWaterTasks,
    DEFAULT_DAYS,
    GroupBy,
    groupByArea,
    groupByDue,
    plantArea,
    plantsInScope,
    PlantRows,
    Registry,
    validateAgendaOptions,
} from './care/agenda';
import { FlowerCareAgendaConfig } from './types/flower-card-types';
import { AGENDA_CARD_NAME, careRowIcons } from './utils/constants';
import { localize, localizeWith } from './localize/localize';
import { entityDisplayName, getConfigFormLanguage, moreInfo, resolveEntityPicture } from './utils/utils';

const CARD_LABEL = 'Flower care agenda';
const FETCH_INTERVAL_MS = 60000;
const CARE_TYPES: CareType[] = ['water', 'fertilize', 'repot', 'prune'];
const SNOOZE_CHOICES: { days: number; label: string }[] = [
    { days: 1, label: 'care_snooze_1d' },
    { days: 3, label: 'care_snooze_3d' },
    { days: 7, label: 'care_snooze_1w' },
];

interface PlantInfoReply {
    result: Record<string, unknown>;
}

export function validateAgendaConfig(config: Partial<FlowerCareAgendaConfig>): FlowerCareAgendaConfig {
    validateAgendaOptions(config);
    return config as FlowerCareAgendaConfig;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
(window as any).customCards = (window as any).customCards || [];
const alreadyListed = (window as any).customCards.some((card: { type: string }) => card.type === AGENDA_CARD_NAME);
if (!alreadyListed) {
    (window as any).customCards.push({
        type: AGENDA_CARD_NAME,
        name: localize({ language: getConfigFormLanguage() }, 'agenda_card_name'),
        preview: true,
        description: 'Care tasks of all plants in an area, sorted by due date, for https://github.com/Olen/homeassistant-plant',
    });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default class FlowerCareAgenda extends LitElement {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @state() _hass?: any;
    @state() config?: FlowerCareAgendaConfig;
    @state() private filterArea: string | null = null;
    @state() private filterCare: CareType | null = null;
    @state() private showLater = false;
    @state() private snoozeMenu: string | null = null;

    // undefined until plant/get_info has answered; null when plant sends no care block
    private careByPlant = new Map<string, CareInfo | null>();
    private lastFetch = new Map<string, number>();
    private pictureSource = new Map<string, string | undefined>();
    private pictureUrl = new Map<string, string | undefined>();
    private todo = new TodoSubscriptions(CARD_LABEL, () => this.requestUpdate());
    private dialog = new ConfirmDoneDialog(this);
    private plants: string[] = [];

    constructor() {
        super();
        new MidnightRefresh(this);
    }

    set hass(hass: HomeAssistant) {
        this._hass = hass;
        if (!this.config) {
            return;
        }
        this.plants = plantsInScope(Object.keys(hass.states), this.registry(), this.config);
        const now = Date.now();
        for (const plant of this.plants) {
            if (now > (this.lastFetch.get(plant) ?? 0) + FETCH_INTERVAL_MS) {
                this.lastFetch.set(plant, now);
                this.fetchCare(plant);
            }
            this.trackPicture(plant);
        }
        this.syncTodo();
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.syncTodo();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.todo.close();
    }

    private registry(): Registry {
        return {
            entities: this._hass.entities ?? {},
            devices: this._hass.devices ?? {},
            areas: this._hass.areas ?? {},
        };
    }

    private async fetchCare(plant: string): Promise<void> {
        let reply: PlantInfoReply;
        try {
            reply = await this._hass.callWS({ type: 'plant/get_info', entity_id: plant });
        } catch (err) {
            console.warn(`${CARD_LABEL}: Failed to fetch data for ${plant}:`, err);
            return;
        }
        this.careByPlant.set(plant, (reply.result.care as CareInfo | undefined) ?? null);
        this.syncTodo();
        this.requestUpdate();
    }

    private syncTodo(): void {
        if (!this.isConnected || !this._hass) {
            return;
        }
        const lists = new Set<string>();
        for (const plant of this.plants) {
            const list = this.careByPlant.get(plant)?.todo_list;
            if (list) {
                lists.add(list);
            }
        }
        this.todo.sync(this._hass, lists);
    }

    private trackPicture(plant: string): void {
        const source = this._hass.states[plant]?.attributes.entity_picture;
        if (this.pictureSource.has(plant) && this.pictureSource.get(plant) === source) {
            return;
        }
        this.pictureSource.set(plant, source);
        resolveEntityPicture(this._hass, source, (url) => {
            this.pictureUrl.set(plant, url);
            this.requestUpdate();
        });
    }

    static getConfigForm() {
        const language = getConfigFormLanguage();
        const careOptions = CARE_TYPES.map((careType) => ({
            value: { water: 'care_watering', fertilize: 'care_fertilization', repot: 'care_repotting', prune: 'care_pruning' }[careType],
            label: localize({ language }, `care_row_${careType}`),
        }));
        return {
            schema: [
                { name: 'title', selector: { text: {} } },
                {
                    type: 'expandable',
                    name: '',
                    title: localize({ language }, 'settings_scope'),
                    schema: [
                        { name: 'area', selector: { area: {} } },
                        { name: 'floor', selector: { floor: {} } },
                        { name: 'label', selector: { label: {} } },
                        { name: 'exclude_label', selector: { label: {} } },
                    ],
                },
                {
                    type: 'expandable',
                    name: '',
                    title: localize({ language }, 'settings_appearance'),
                    schema: [
                        {
                            name: 'group_by',
                            selector: {
                                select: {
                                    options: [
                                        { value: 'due', label: localize({ language }, 'settings_group_by_due') },
                                        { value: 'area', label: localize({ language }, 'settings_group_by_area') },
                                    ],
                                },
                            },
                        },
                        { name: 'days', selector: { number: { min: 1, max: 60, mode: 'box' } } },
                        { name: 'show_care', selector: { select: { multiple: true, options: careOptions } } },
                        { name: 'show_predictions', selector: { boolean: {} } },
                        { name: 'show_filters', selector: { boolean: {} } },
                    ],
                },
            ],
            computeLabel: (schema: { name: string }) => {
                const labels: Record<string, string> = {
                    title: localize({ language }, 'settings_title'),
                    area: localize({ language }, 'settings_area'),
                    floor: localize({ language }, 'settings_floor'),
                    label: localize({ language }, 'settings_label'),
                    exclude_label: localize({ language }, 'settings_exclude_label'),
                    group_by: localize({ language }, 'settings_group_by'),
                    days: localize({ language }, 'settings_days'),
                    show_care: localize({ language }, 'settings_show_care_info'),
                    show_predictions: localize({ language }, 'settings_show_predictions'),
                    show_filters: localize({ language }, 'settings_show_filters'),
                };
                return labels[schema.name] || schema.name;
            },
        };
    }

    static getStubConfig() {
        return { group_by: 'due', days: DEFAULT_DAYS };
    }

    setConfig(config: FlowerCareAgendaConfig): void {
        this.config = validateAgendaConfig(config);
        this.lastFetch.clear();
    }

    getCardSize(): number {
        return 6;
    }

    getGridOptions() {
        return { columns: 12, min_columns: 6, rows: 'auto' };
    }

    private horizon(): number {
        return this.config?.days ?? DEFAULT_DAYS;
    }

    private groupBy(): GroupBy {
        return this.config?.group_by ?? 'due';
    }

    private areaName(areaId: string | null): string {
        if (areaId === null || areaId === '') {
            return localize(this._hass, 'agenda_no_area');
        }
        return this._hass.areas?.[areaId]?.name ?? areaId;
    }

    private cardTitle(): string {
        if (this.config?.title) {
            return this.config.title;
        }
        if (this.config?.area) {
            return this.areaName(this.config.area);
        }
        if (this.config?.floor) {
            return this._hass.floors?.[this.config.floor]?.name ?? this.config.floor;
        }
        return localize(this._hass, 'agenda_title_default');
    }

    private plantRows(now: Date): PlantRows[] {
        const registry = this.registry();
        const result: PlantRows[] = [];
        for (const plant of this.plants) {
            const stateObj = this._hass.states[plant];
            if (!stateObj || !this.careByPlant.has(plant)) {
                continue;
            }
            const care = this.careByPlant.get(plant) ?? null;
            const list = care?.todo_list ?? null;
            const dates = careDatesFromStates(care, this._hass.states);
            const rows = buildCareRows({
                plantEntityId: plant,
                attributes: stateObj.attributes,
                care,
                items: list === null ? [] : this.todo.items(list),
                lastDone: dates.lastDone,
                nextWatering: dates.nextWatering,
                readings: {},
            }, now);
            result.push({ plant, name: entityDisplayName(this._hass, stateObj), area: plantArea(plant, registry), rows });
        }
        return result;
    }

    private listOf(task: AgendaTask): string {
        const list = this.careByPlant.get(task.plant)?.todo_list;
        if (!list) {
            throw new Error(`No to-do list for ${task.plant}`);
        }
        return list;
    }

    private isSensorTask(task: AgendaTask): boolean {
        const care = this.careByPlant.get(task.plant);
        return care?.modes[task.row.key as CareType] === 'sensor' && task.row.status.kind !== 'prediction';
    }

    private waterAll(tasks: AgendaTask[]): void {
        for (const task of tasks) {
            completeCareRow(this._hass, this.listOf(task), task.row, CARD_LABEL);
        }
    }

    private snooze(task: AgendaTask, days: number): void {
        snoozeCareRow(this._hass, this.listOf(task), task.row, days, CARD_LABEL);
        this.snoozeMenu = null;
    }

    private toggleFilterArea(area: string): void {
        this.filterArea = this.filterArea === area ? null : area;
    }

    private toggleFilterCare(careType: CareType): void {
        this.filterCare = this.filterCare === careType ? null : careType;
    }

    private renderThumb(task: AgendaTask): HTMLTemplateResult {
        const url = this.pictureUrl.get(task.plant);
        const open = () => moreInfo(this, task.plant);
        if (url) {
            return html`<img class="agenda-thumb" src="${url}" alt="" @click="${open}">`;
        }
        return html`<div class="agenda-thumb placeholder" @click="${open}"><ha-icon .icon="${'mdi:flower'}"></ha-icon></div>`;
    }

    private renderWhen(task: AgendaTask, now: Date): HTMLTemplateResult {
        const showArea = !this.config?.area && this.groupBy() !== 'area';
        const prediction = task.row.status.kind === 'prediction';
        return html`
            <div class="agenda-when">
                <span class="${prediction ? 'predicted' : ''}">${careStatusText(this._hass, task.row, now)}</span>
                ${this.isSensorTask(task) ? html`<span class="agenda-tag">${localize(this._hass, 'agenda_sensor')}</span>` : nothing}
                ${showArea ? html`<span>· ${this.areaName(task.area)}</span>` : nothing}
            </div>`;
    }

    private renderActions(task: AgendaTask, key: string): HTMLTemplateResult {
        const row: CareRow = task.row;
        return html`
            <span class="agenda-actions">
                ${row.snooze === null ? nothing : html`
                    <button class="agenda-icon-button" title="${localize(this._hass, 'care_snooze')}"
                        @click="${() => { this.snoozeMenu = this.snoozeMenu === key ? null : key; }}">
                        <ha-icon .icon="${'mdi:alarm-snooze'}"></ha-icon>
                    </button>`}
                ${row.done === null ? nothing : html`
                    <button class="care-button ${row.done.emphasis}"
                        @click="${() => pressCareDone(this._hass, this.dialog, this.listOf(task), row, CARD_LABEL)}">
                        ${localize(this._hass, 'care_done')}
                    </button>`}
            </span>`;
    }

    private renderTask(task: AgendaTask, now: Date): HTMLTemplateResult {
        const key = `${task.plant}:${task.row.key}`;
        return html`
            <div class="agenda-item">
                <div class="agenda-row ${task.row.alert ? 'alert' : ''}">
                    ${this.renderThumb(task)}
                    <div class="agenda-text" @click="${() => moreInfo(this, task.plant)}">
                        <div class="agenda-what">
                            <ha-icon .icon="${careRowIcons[task.row.key]}"></ha-icon>
                            <span class="agenda-plant">${task.name}</span>
                            <span>· ${localize(this._hass, `care_row_${task.row.key}`)}</span>
                        </div>
                        ${this.renderWhen(task, now)}
                    </div>
                    ${this.renderActions(task, key)}
                </div>
                ${this.snoozeMenu === key ? html`
                    <div class="agenda-snooze-menu">
                        ${SNOOZE_CHOICES.map((choice) => html`
                            <button class="care-button outlined" @click="${() => this.snooze(task, choice.days)}">
                                +${localize(this._hass, choice.label)}
                            </button>`)}
                    </div>` : nothing}
            </div>`;
    }

    private renderBulk(group: AgendaGroup): HTMLTemplateResult | typeof nothing {
        const bulk = bulkWaterTasks(group.tasks);
        const eligible = this.groupBy() === 'area' || group.key === 'today' || group.key === 'overdue';
        if (!eligible || bulk.length < 2) {
            return nothing;
        }
        return html`
            <button class="care-button outlined small" @click="${() => this.waterAll(bulk)}">
                ${localizeWith(this._hass, 'agenda_water_all', { n: bulk.length })}
            </button>`;
    }

    private groupLabel(group: AgendaGroup): string {
        if (this.groupBy() === 'area') {
            return this.areaName(group.key);
        }
        return localize(this._hass, `agenda_group_${group.key}`);
    }

    private renderGroup(group: AgendaGroup, now: Date): HTMLTemplateResult {
        return html`
            <div class="agenda-group">
                <div class="agenda-group-head ${group.key === 'overdue' ? 'overdue' : ''}">
                    <span>${this.groupLabel(group)}</span>
                    <span class="agenda-count">${group.tasks.length}</span>
                    <span class="agenda-spacer"></span>
                    ${this.renderBulk(group)}
                </div>
                <div class="agenda-rows">${group.tasks.map((task) => this.renderTask(task, now))}</div>
            </div>`;
    }

    private renderFilters(tasks: AgendaTask[]): HTMLTemplateResult | typeof nothing {
        if (!this.config?.show_filters) {
            return nothing;
        }
        const areas = [...new Set(tasks.map((task) => task.area ?? ''))].sort((a, b) => this.areaName(a).localeCompare(this.areaName(b)));
        const careTypes = CARE_TYPES.filter((careType) => tasks.some((task) => task.row.key === careType));
        return html`
            <div class="agenda-chips">
                ${areas.length > 1 ? areas.map((area) => html`
                    <button class="agenda-chip" aria-pressed="${this.filterArea === area}" @click="${() => this.toggleFilterArea(area)}">
                        ${this.areaName(area)}
                    </button>`) : nothing}
                ${careTypes.map((careType) => html`
                    <button class="agenda-chip" aria-pressed="${this.filterCare === careType}" @click="${() => this.toggleFilterCare(careType)}">
                        <ha-icon .icon="${careRowIcons[careType]}"></ha-icon>${localize(this._hass, `care_row_${careType}`)}
                    </button>`)}
            </div>`;
    }

    private filtered(tasks: AgendaTask[]): AgendaTask[] {
        return tasks.filter((task) => {
            if (this.filterArea !== null && (task.area ?? '') !== this.filterArea) {
                return false;
            }
            if (this.filterCare !== null && task.row.key !== this.filterCare) {
                return false;
            }
            return true;
        });
    }

    private renderSummary(tasks: AgendaTask[]): HTMLTemplateResult {
        const summary = agendaSummary(tasks, this.horizon());
        return html`
            <span class="agenda-summary">
                ${localizeWith(this._hass, 'agenda_summary', { n: summary.todo })}
                ${summary.overdue > 0 ? html` · <b>${localizeWith(this._hass, 'agenda_summary_overdue', { n: summary.overdue })}</b>` : nothing}
            </span>`;
    }

    render(): HTMLTemplateResult {
        if (!this.config || !this._hass) return html``;
        const now = new Date();
        const all = agendaTasks(this.plantRows(now), agendaCareTypes(this.config.show_care), this.config.show_predictions ?? true, now);
        const tasks = this.filtered(all);
        const horizon = this.showLater ? Number.MAX_SAFE_INTEGER : this.horizon();
        const grouped = this.groupBy() === 'area'
            ? groupByArea(tasks, horizon, (areaId) => this.areaName(areaId))
            : groupByDue(tasks, horizon);

        return html`
            <ha-card>
                <h1 class="card-header">
                    <span class="name">${this.cardTitle()}</span>
                    ${this.renderSummary(tasks)}
                </h1>
                ${this.renderFilters(all)}
                <div class="agenda-body">
                    ${grouped.groups.map((group) => this.renderGroup(group, now))}
                </div>
                ${grouped.groups.length === 0 ? html`
                    <div class="agenda-empty">
                        <ha-icon .icon="${'mdi:leaf'}"></ha-icon>
                        <div>${localizeWith(this._hass, 'agenda_empty', { n: this.horizon() })}</div>
                    </div>` : nothing}
                ${grouped.later.length > 0 ? html`
                    <div class="agenda-later">
                        ${localizeWith(this._hass, 'agenda_later', { n: grouped.later.length })} ·
                        <button @click="${() => { this.showLater = true; }}">${localize(this._hass, 'agenda_show')}</button>
                    </div>` : nothing}
            </ha-card>
            ${this.dialog.render(this._hass)}
        `;
    }

    static get styles(): CSSResult[] {
        return [careButtonStyle, agendaStyle];
    }
}

// Plant serves its own copy, so another copy may already have defined the card
if (!customElements.get(AGENDA_CARD_NAME)) {
    customElements.define(AGENDA_CARD_NAME, FlowerCareAgenda);
}
