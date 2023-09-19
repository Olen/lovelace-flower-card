import { CSSResult, HTMLTemplateResult, LitElement, customElement, html, property } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html'
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { style } from './styles';
import { DisplayedAttribute, DisplayedAttributes, FlowerCardConfig, HomeAssistantEntity, Icons, Limits, PlantInfo, UOM, UOMT } from './types/flower-card-types';
import * as packageJson from '../package.json';
import { renderBattery } from './utils/attributes';
import { CARD_NAME, default_show_bars, missingImage } from './utils/constants';

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
/* eslint-enable @typescript-eslint/no-explicit-any */

@customElement(CARD_NAME)
export default class FlowerCard extends LitElement {
    @property() _hass?: HomeAssistant;
    @property() config?: FlowerCardConfig;

    private stateObj: HomeAssistantEntity | undefined;
    private plantinfo: PlantInfo;

    set hass(hass: HomeAssistant) {
        this._hass = hass;
        this.stateObj = this.config?.entity ? hass.states[this.config.entity] : undefined;

        // if (!this.prev_fetch) {
        //     this.prev_fetch = 0;
        // }
        // // Only fetch once every second at max.  HA is flooeded with websocket requests
        // if (Date.now() > this.prev_fetch + 1000) {
        //     this.prev_fetch = Date.now();
        //     this.get_data(hass).then(() => {
        //         this.requestUpdate();
        //     });
        // }
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

        const icons: Icons = {};
        const uom: UOM = {};
        const uomt: UOMT = {};
        const limits: Record<string, Limits> = {};
        const curr: Record<string, number> = {};
        const sensors: Record<string, string> = {};
        const displayed: DisplayedAttributes = {};
        const monitored = this.config.show_bars || default_show_bars;

        if (this.plantinfo && this.plantinfo.result) {
            const result = this.plantinfo.result;
            for (const elem of monitored) {
                if (result[elem]) {
                    const { max, min, current, icon, sensor, unit_of_measurement } = result[elem];
                    limits[`max_${elem}`] = { max, min };
                    curr[elem] = current;
                    icons[elem] = icon;
                    sensors[elem] = sensor;
                    uomt[elem] = unit_of_measurement;
                    uom[elem] = unit_of_measurement;
                    if (elem === "dli") {
                        uomt["dli"] = "mol/d⋅m²";
                        uom["dli"] = '<math style="display: inline-grid;" xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mfrac><mrow><mn>mol</mn></mrow><mrow><mn>d</mn><mn>⋅</mn><msup><mn>m</mn><mn>2</mn></msup></mrow></mfrac></mrow></math>';
                    }
                    displayed[elem] = { current, limits: limits[`max_${elem}`], icon, sensor, unit_of_measurement };
                }
            }
        }

        const attribute = (attr: DisplayedAttribute) => {
            const { max, min } = attr.limits;
            const unit = attr.unit_of_measurement;
            const unitTooltip = attr.unit_of_measurement;
            const icon = attr.icon || "mdi:help-circle-outline";
            const val = attr.current || 0;
            const aval = !isNaN(val);
            const pct = 100 * Math.max(0, Math.min(1, (val - min) / (max - min)));
            const toolTipText = aval ? `${attr}: ${val} ${unitTooltip}<br>(${min} ~ ${max} ${unitTooltip})` : this._hass.localize('state.default.unavailable');

            return html`
                <div class="attribute tooltip" @click="${() => this.moreInfo(attr.sensor)}">
                    <div class="tip" style="text-align:center;">${unsafeHTML(toolTipText)}</div>
                    <ha-icon .icon="${icon}"></ha-icon>
                    <div class="meter red">
                        <span class="${aval ? (val < min || val > max ? "bad" : "good") : "unavailable"}" style="width: 100%;"></span>
                    </div>
                    <div class="meter green">
                        <span class="${aval ? (val > max ? "bad" : "good") : "unavailable"}" style="width:${aval ? pct : "0"}%;"></span>
                    </div>
                    <div class="meter red">
                        <span class="bad" style="width:${aval ? (val > max ? 100 : 0) : "0"}%;"></span>
                    </div>
                    <span class="header"><span class="value">${val}</span>&nbsp;<span class="unit">${unsafeHTML(unit)}</span></span>
                </div>
            `;
        };

        return html`
            <ha-card>
            <div class="header" @click="${() =>
                        this.moreInfo(this.stateObj.entity_id)}">
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
            <div class="attributes">
                ${displayed[0] == undefined ? void 0 : attribute(displayed[0])}
                ${displayed[1] == undefined ? void 0 : attribute(displayed[1])}
            </div>
            <div class="attributes">
                ${displayed[2] == undefined ? void 0 : attribute(displayed[2])}
                ${displayed[3] == undefined ? void 0 : attribute(displayed[3])}
            </div>
            <div class="attributes">
                ${displayed[4] == undefined ? void 0 : attribute(displayed[4])}
                ${displayed[5] == undefined ? void 0 : attribute(displayed[5])}
            </div>
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

    moreInfo(entityId = this.config?.entity): void {
        fireEvent(
            this,
            'hass-more-info',
            { entityId },
            { bubbles: false, composed: true }
        );
    }

    getCardSize(): number {
        return 5;
    }

    static get styles(): CSSResult {
        return style;
    }
}