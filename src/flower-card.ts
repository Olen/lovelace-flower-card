import { CSSResult, HTMLTemplateResult, LitElement, customElement, html, property } from 'lit-element';
import { HomeAssistant } from 'custom-card-helpers';
import { style } from './styles';
import { DisplayType, FlowerCardConfig, HomeAssistantEntity, PlantInfo } from './types/flower-card-types';
import * as packageJson from '../package.json';
import { renderAttributes, renderBattery } from './utils/attributes';
import { CARD_NAME, missingImage } from './utils/constants';
import { moreInfo } from './utils/utils';

console.info(
    `%c MINI-FLOWER-CARD %c ${packageJson.version}`,
    'color: cyan; background: black; font-weight: bold;',
    'color: darkblue; background: white; font-weight: bold;'
);

/* eslint-disable @typescript-eslint/no-explicit-any */
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: CARD_NAME,
    name: 'Mini Flower card',
    preview: true,
    description: 'Custom flower card for https://github.com/Olen/homeassistant-plant',
});
/* eslint-enable @typescript-eslint/no-explicit-any */

@customElement(CARD_NAME)
export default class FlowerCard extends LitElement {
    @property() _hass?: HomeAssistant;
    @property() config?: FlowerCardConfig;

    private stateObj: HomeAssistantEntity | undefined;
    private plantinfo: PlantInfo;
    private previousFetchDate: number;

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

        return html`
            <ha-card>
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
                <span id="battery">${renderBattery(this.config, this._hass)}</span>
                <span id="species">${species} </span>
            </div>
            <div class="divider"></div>
            ${renderAttributes(this, this.plantinfo, this.config, this._hass)}
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