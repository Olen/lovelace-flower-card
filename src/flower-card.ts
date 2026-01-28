import { CSSResult, HTMLTemplateResult, LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { style } from './styles';
import { DisplayType, FlowerCardConfig, HomeAssistantEntity, PlantInfo } from './types/flower-card-types';
import * as packageJson from '../package.json';
import { renderAttributes, renderBattery, renderExtraBadges } from './utils/attributes';
import { CARD_NAME, default_show_bars, missingImage, plantAttributes } from './utils/constants';
import { isMediaSourceUrl, moreInfo, resolveMediaSource } from './utils/utils';

console.info(
    `%c FLOWER-CARD %c ${packageJson.version}`,
    'color: cyan; background: black; font-weight: bold;',
    'color: darkblue; background: white; font-weight: bold;'
);

/* eslint-disable @typescript-eslint/no-explicit-any */
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: CARD_NAME,
    name: 'Flower card',
    preview: true,
    description: 'Custom flower card for https://github.com/Olen/homeassistant-plant',
});
/* eslint-disable @typescript-eslint/no-explicit-any */

@customElement(CARD_NAME)
export default class FlowerCard extends LitElement {
    @property() _hass?: any;
    @property() config?: FlowerCardConfig;

    private stateObj: HomeAssistantEntity | undefined;
    private previousFetchDate: number;
    private _lastEntityPicture: string | undefined;
    private _resolvedImageUrl: string | undefined;

    plantinfo: PlantInfo;
    set hass(hass: HomeAssistant) {
        this._hass = hass;
        this.stateObj = this.config?.entity ? hass.states[this.config.entity] : undefined;

        // Check if entity_picture changed and needs resolution
        const entityPicture = this.stateObj?.attributes.entity_picture;
        if (entityPicture !== this._lastEntityPicture) {
            this._lastEntityPicture = entityPicture;
            this._resolveEntityPicture(hass, entityPicture);
        }

        if (!this.previousFetchDate) {
            this.previousFetchDate = 0;
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
                    title: "Bars",
                    schema: [
                        {
                            name: "show_bars",
                            selector: {
                                select: {
                                    multiple: true,
                                    options: plantAttributes
                                }
                            }
                        }
                    ]
                },
                {
                    type: "expandable",
                    name: "",
                    title: "Appearance",
                    schema: [
                        {
                            name: "display_type",
                            selector: {
                                select: {
                                    options: [
                                        { value: "full", label: "Full" },
                                        { value: "compact", label: "Compact" }
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
                    entity: "Entity",
                    name: "Display Name",
                    display_type: "Display Type",
                    battery_sensor: "Battery Sensor",
                    show_bars: "Show Bars",
                    hide_species: "Hide Species",
                    hide_image: "Hide Image",
                    hide_units: "Hide Units"
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

    render(): HTMLTemplateResult {
        if (!this.config || !this._hass) return html``;

        if (!this.stateObj) {
            return html`
                <hui-warning>
                Entity not available: ${this.config.entity}
                </hui-warning>
              `;
        }

        const species = this.stateObj.attributes.species;
        const displayName = this.config.name || this.stateObj.attributes.friendly_name;
        const hideSpecies = this.config.hide_species ?? false;
        const hideImage = this.config.hide_image ?? false;
        const headerCssClass = this.config.display_type === DisplayType.Compact ? "header-compact" : "header";
        const haCardCssClass = (this.config.display_type === DisplayType.Compact || hideImage) ? "" : "card-margin-top";
        const noImageClass = hideImage ? " no-image" : "";

        return html`
            <ha-card class="${haCardCssClass}">
            <div class="${headerCssClass}${noImageClass}" @click="${() =>
                moreInfo(this, this.stateObj.entity_id)}">
                ${!hideImage ? html`<img src="${this._resolvedImageUrl || missingImage}">` : ''}
                <span id="name"> ${displayName} <ha-icon .icon="mdi:${this.stateObj.state.toLowerCase() == "problem"
                ? "alert-circle-outline"
                : ""
            }"></ha-icon>
                </span>
                <span id="battery">${renderExtraBadges(this)}${renderBattery(this)}</span>
                ${!hideSpecies ? html`<span id="species">${species}</span>` : ''}
            </div>
            <div class="divider"></div>
            ${renderAttributes(this)}
            </ha-card>
            `;
    }

    async get_data(hass: HomeAssistant): Promise<void> {
        try {
            this.plantinfo = await hass.callWS({
                type: "plant/get_info",
                entity_id: this.config?.entity,
            });
        } catch (err) {
            this.plantinfo = { result: {} };
        }
    }

    getCardSize(): number {
        return 5;
    }

    static get styles(): CSSResult {
        return style;
    }
}
