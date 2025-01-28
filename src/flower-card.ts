import { CSSResult, HTMLTemplateResult, LitElement, html } from 'lit';
import {customElement, property } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { style } from './styles';
import { DisplayType, FlowerCardConfig, HomeAssistantEntity, PlantInfo } from './types/flower-card-types';
import * as packageJson from '../package.json';
import { renderAttributes, renderBattery } from './utils/attributes';
import { CARD_EDITOR_NAME, CARD_NAME, default_show_info, missingImage } from './utils/constants';
import { moreInfo } from './utils/utils';

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

    plantinfo: PlantInfo;
    set hass(hass: HomeAssistant) {
        this._hass = hass;
        this.stateObj = this.config?.entity ? hass.states[this.config.entity] : undefined;

        if (!this.previousFetchDate) {
            this.previousFetchDate = 0;
        }
        // Only fetch once every second at max.  HA is flooeded with websocket requests
        if (Date.now() > this.previousFetchDate + 1000) {
            this.previousFetchDate = Date.now();
            this.get_data(hass).then(() => {
                this.requestUpdate();
            });
        }
    }

    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./editor");
        return document.createElement(CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    static getStubConfig(ha: HomeAssistant) {
        // There must be an easier way to do this
        const isPlant = (entity: HomeAssistantEntity | unknown): entity is HomeAssistantEntity => {
            if (typeof entity == 'object' && 'entity_id' in entity && typeof entity.entity_id == 'string' && entity.entity_id.indexOf('plant.') === 0) {
                return !!entity;
            }
        }
        let supportedEntities: Array<any> = [];
        try {
            supportedEntities = Object.values(ha.states).filter(isPlant);
                // (entity) => entity.entity_id.indexOf('plant.') === 0
            // );
        }
        catch(e) {
            console.info(`Unable to get ha-data: ${e}`);
        }
        const entity = supportedEntities.length > 0 ? supportedEntities[0].entity_id : 'plant.my_plant';

        return {
            entity: entity,
            battery_sensor: "sensor.myflower_battery",
            show_info: default_show_info
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
        const headerCssClass = this.config.display_type === DisplayType.Compact ? "header-compact" : "header";
        const haCardCssClass = this.config.display_type === DisplayType.Compact ? "" : "card-margin-top";

        return html`
            <ha-card class="${haCardCssClass}">
            <div class="${headerCssClass}" @click="${() =>
                moreInfo(this, this.stateObj.entity_id)}">
                <img src="${this.stateObj.attributes.entity_picture
                ? this.stateObj.attributes.entity_picture
                : missingImage
            }">
                <span id="name"> ${this.stateObj.attributes.friendly_name
            } <ha-icon .icon="mdi:${this.stateObj.state.toLowerCase() == "problem"
                ? "alert-circle-outline"
                : ""
            }"></ha-icon>
                </span>
                <span id="battery">${renderBattery(this)}</span>
                <span id="species">${species} </span>
            </div>
            <div class="divider"></div>
            ${renderAttributes(this)}
            ${(() => {
                if (!this.config?.show_info?.includes('notes')) {
                    return '';
                }
                if (!('notes' in this.stateObj.attributes)) {
                    return html`<div class="divider"></div><div class="notes notes-empty">Plant has no notes, add one in the device's configuration. Edit this card and uncheck "Notes" if you want to hide this.</div>`;
                }
                if (this.stateObj.attributes.notes === null || this.stateObj.attributes.notes.trim() === '') {
                    return html`<div class="divider"></div><div class="notes notes-empty">Plant has no notes, add one in the device's configuration. Edit this card and uncheck "Notes" if you want to hide this.</div>`;
                }
                return html`<div class="divider"></div><div class="notes">${this.stateObj.attributes.notes}</div>`;
            })()}
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
