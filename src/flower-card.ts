import { CSSResult, HTMLTemplateResult, LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { style } from './styles';
import { DisplayType, EntitySuggestion, ExtraBadge, FlowerCardConfig, HomeAssistantEntity, PlantInfo } from './types/flower-card-types';
import * as packageJson from '../package.json';
import { CARE_DIALOG_DEFAULT_TITLE, computeCareDialogState, renderAttributes, renderBattery, renderCareInfo, renderCareItems, renderExtraBadges, selectCareInfo } from './utils/attributes';
import { CARD_NAME, default_show_bars, getCareFields, getPlantAttributes, missingImage } from './utils/constants';
import { getHassLanguage, getTranslation } from './utils/translations';
import { isMediaSourceUrl, moreInfo, resolveMediaSource, shouldEnableImageLightbox } from './utils/utils';

console.info(
    `%c FLOWER-CARD %c ${packageJson.version}`,
    'color: cyan; background: black; font-weight: bold;',
    'color: darkblue; background: white; font-weight: bold;'
);

const getConfigFormLanguage = (): string => {
    if (typeof document === 'undefined') return 'en';
    return document.documentElement?.lang || 'en';
};

// Suggests flower-card in Home Assistant's card picker when a plant entity is
// selected (HA 2026.6+). Returns null for any non-plant entity so the card only
// appears where it makes sense. `hass` is part of HA's API contract but unused
// here, since the domain is derivable from the entity id alone.
export const getEntitySuggestion = (hass: HomeAssistant, entityId: string): EntitySuggestion[] | null => {
    if (entityId.split('.')[0] !== 'plant') {
        return null;
    }
    return [
        { label: 'Full', config: { type: `custom:${CARD_NAME}`, entity: entityId } },
        { label: 'Compact', config: { type: `custom:${CARD_NAME}`, entity: entityId, display_type: DisplayType.Compact } },
    ];
};

/* eslint-disable @typescript-eslint/no-explicit-any */
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: CARD_NAME,
    name: 'Flower card',
    preview: true,
    description: 'Custom flower card for https://github.com/Olen/homeassistant-plant',
    getEntitySuggestion,
});
/* eslint-disable @typescript-eslint/no-explicit-any */

@customElement(CARD_NAME)
export default class FlowerCard extends LitElement {
    @property() _hass?: any;
    @property() config?: FlowerCardConfig;
    @state() private _careDialogOpen = false;
    @state() private _careDialogFields: string[] = [];
    @state() private _careDialogTitle = CARE_DIALOG_DEFAULT_TITLE;
    @state() private _imageDialogOpen = false;

    private stateObj: HomeAssistantEntity | undefined;
    private previousFetchDate = 0;
    private _lastEntityPicture: string | undefined;
    private _resolvedImageUrl: string | undefined;

    plantinfo: PlantInfo = { result: {} };
    set hass(hass: HomeAssistant) {
        this._hass = hass;
        this.stateObj = this.config?.entity ? hass.states[this.config.entity] : undefined;

        // Check if entity_picture changed and needs resolution
        const entityPicture = this.stateObj?.attributes.entity_picture;
        if (entityPicture !== this._lastEntityPicture) {
            this._lastEntityPicture = entityPicture;
            this._resolveEntityPicture(hass, entityPicture);
        }

        // Only fetch once every second at max. HA is flooded with websocket requests
        if (Date.now() > this.previousFetchDate + 1000) {
            this.previousFetchDate = Date.now();
            this.get_data(hass).then(() => {
                this.requestUpdate();
            });
        }
    }

    private async _resolveEntityPicture(hass: HomeAssistant, entityPicture: string | undefined): Promise<void> {
        if (!entityPicture) {
            this._resolvedImageUrl = undefined;
            return;
        }

        if (isMediaSourceUrl(entityPicture)) {
            this._resolvedImageUrl = await resolveMediaSource(hass, entityPicture);
            this.requestUpdate();
        } else {
            this._resolvedImageUrl = entityPicture;
        }
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
                {
                    name: "name",
                    selector: { text: {} }
                },
                {
                    name: "battery_sensor",
                    selector: { entity: { domain: "sensor", device_class: "battery" } }
                },
                {
                    type: "expandable",
                    name: "",
                    title: getTranslation('settings_bars', language),
                    schema: [
                        {
                            name: "show_bars",
                            selector: {
                                select: {
                                    multiple: true,
                                    options: getPlantAttributes(language)
                                }
                            }
                        }
                    ]
                },
                {
                    type: "expandable",
                    name: "",
                    title: getTranslation('settings_care_info', language),
                    schema: [
                        {
                            name: "show_care",
                            selector: {
                                select: {
                                    multiple: true,
                                    options: getCareFields(language)
                                }
                            }
                        }
                    ]
                },
                {
                    type: "expandable",
                    name: "",
                    title: getTranslation('settings_appearance', language),
                    schema: [
                        {
                            name: "display_type",
                            selector: {
                                select: {
                                    options: [
                                        { value: "full", label: getTranslation('settings_full', language) },
                                        { value: "compact", label: getTranslation('settings_compact', language) }
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
                        },
                        {
                            name: "hide_units",
                            selector: { boolean: {} }
                        }
                    ]
                }
            ],
            computeLabel: (schema: { name: string }) => {
                const labels: Record<string, string> = {
                    entity: getTranslation('settings_entity', language),
                    name: getTranslation('settings_display_name', language),
                    display_type: getTranslation('settings_display_type', language),
                    battery_sensor: getTranslation('settings_battery_sensor', language),
                    show_bars: getTranslation('settings_show_bars', language),
                    show_care: getTranslation('settings_show_care_info', language),
                    hide_species: getTranslation('settings_hide_species', language),
                    hide_image: getTranslation('settings_hide_image', language),
                    hide_units: getTranslation('settings_hide_units', language)
                };
                return labels[schema.name] || schema.name;
            }
        };
    }

    static getStubConfig(ha: HomeAssistant) {
        const isPlant = (entity: unknown): entity is HomeAssistantEntity => {
            return typeof entity === 'object' && entity !== null &&
                'entity_id' in entity &&
                typeof (entity as HomeAssistantEntity).entity_id === 'string' &&
                (entity as HomeAssistantEntity).entity_id.startsWith('plant.');
        };
        let supportedEntities: HomeAssistantEntity[] = [];
        try {
            supportedEntities = Object.values(ha.states).filter(isPlant);
        }
        catch (e) {
            console.info(`Unable to get ha-data: ${e}`);
        }
        const entity = supportedEntities.length > 0 ? supportedEntities[0].entity_id : 'plant.my_plant';

        return {
            entity: entity,
            battery_sensor: "sensor.myflower_battery",
            show_bars: default_show_bars
        }
    }

    setConfig(config: FlowerCardConfig): void {
        if (!config.entity) {
            throw new Error("You need to define an entity");
        }

        this.config = config;
    }

    openCareDialog(badge: ExtraBadge): void {
        const { open, fields, title } = computeCareDialogState(badge);
        this._careDialogFields = fields;
        this._careDialogTitle = title;
        this._careDialogOpen = open;
    }

    private _closeCareDialog(): void {
        this._careDialogOpen = false;
    }

    private renderCareDialog(): HTMLTemplateResult {
        const entity = this.config?.entity;
        const attributes = entity ? this._hass?.states[entity]?.attributes : undefined;
        const language = getHassLanguage(this._hass);
        const entries = selectCareInfo(attributes, this._careDialogFields, language);
        return html`
            <ha-dialog open heading="${this._careDialogTitle || getTranslation('care', language)}" @closed="${() => this._closeCareDialog()}">
                ${entries.length > 0
                    ? html`<div class="care-info care-info--dialog">${renderCareItems(entries)}</div>`
                    : html`<div class="care-info-empty">${getTranslation('no_care_info', language)}</div>`}
            </ha-dialog>
        `;
    }

    openImageDialog(): void {
        this._imageDialogOpen = true;
    }

    private _closeImageDialog(): void {
        this._imageDialogOpen = false;
    }

    private renderImageDialog(): HTMLTemplateResult {
        const displayName = this.config?.name || this.stateObj?.attributes.friendly_name || '';
        return html`
            <ha-dialog open @closed="${() => this._closeImageDialog()}">
                <div class="image-dialog">
                    <img src="${this._resolvedImageUrl}" alt="${displayName}">
                    ${displayName ? html`<div class="image-dialog-caption">${displayName}</div>` : ''}
                </div>
            </ha-dialog>
        `;
    }

    render(): HTMLTemplateResult {
        if (!this.config || !this._hass) return html``;

        if (!this.stateObj) {
            this._careDialogOpen = false;
            this._imageDialogOpen = false;
            return html`
                <hui-warning>
                Entity not available: ${this.config.entity}
                </hui-warning>
              `;
        }
        const stateObj = this.stateObj;

        const species = stateObj.attributes.species;
        const displayName = this.config.name || stateObj.attributes.friendly_name;
        const hideSpecies = this.config.hide_species ?? false;
        const hideImage = this.config.hide_image ?? false;
        const imageLightbox = shouldEnableImageLightbox(hideImage, this._resolvedImageUrl);
        const headerCssClass = this.config.display_type === DisplayType.Compact ? "header-compact" : "header";
        const haCardCssClass = (this.config.display_type === DisplayType.Compact || hideImage) ? "" : "card-margin-top";
        const noImageClass = hideImage ? " no-image" : "";

        return html`
            <ha-card class="${haCardCssClass}">
            <div class="${headerCssClass}${noImageClass}" @click="${() =>
                moreInfo(this, stateObj.entity_id)}">
                ${!hideImage ? html`<img
                    src="${this._resolvedImageUrl || missingImage}"
                    class="${imageLightbox ? 'has-lightbox' : ''}"
                    @click="${(e: Event) => {
                        if (!imageLightbox) return;
                        e.stopPropagation();
                        this.openImageDialog();
                    }}">` : ''}
                <span id="name"> ${displayName} <ha-icon .icon="mdi:${stateObj.state.toLowerCase() == "problem"
                ? "alert-circle-outline"
                : ""
            }"></ha-icon>
                </span>
                <span id="battery">${renderExtraBadges(this)}${renderBattery(this)}</span>
                ${!hideSpecies ? html`<span id="species">${species}</span>` : ''}
            </div>
            <div class="divider"></div>
            ${renderAttributes(this)}
            ${renderCareInfo(this)}
            </ha-card>
            ${this._careDialogOpen ? this.renderCareDialog() : html``}
            ${this._imageDialogOpen ? this.renderImageDialog() : html``}
            `;
    }

    async get_data(hass: HomeAssistant): Promise<void> {
        try {
            this.plantinfo = await hass.callWS({
                type: "plant/get_info",
                entity_id: this.config?.entity,
            });
        } catch (err) {
            console.warn(`Flower card: Failed to fetch data for ${this.config?.entity}:`, err);
            if (!this.plantinfo || !this.plantinfo.result || Object.keys(this.plantinfo.result).length === 0) {
                this.plantinfo = { result: {} };
            }
        }
    }

    getCardSize(): number {
        return 5;
    }

    static get styles(): CSSResult {
        return style;
    }
}
