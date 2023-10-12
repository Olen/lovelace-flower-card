import { HomeAssistant } from "custom-card-helpers";
import { DisplayType, DisplayedAttribute, DisplayedAttributes, FlowerCardConfig, Icons, Limits, UOM, UOMT } from "../types/flower-card-types";
import { TemplateResult, html } from "lit-element";
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { default_show_bars } from "./constants";
import { moreInfo } from "./utils";
import FlowerCard from "../flower-card";

export const renderBattery = (config: FlowerCardConfig, hass: HomeAssistant) => {
    if(!config.battery_sensor) return html``;

    const battery_sensor = hass.states[config.battery_sensor];
    if(!battery_sensor) return html``;

    const state = parseInt(battery_sensor.state);

    const levels = [
        { threshold: 90, icon: "mdi:battery", color: "green" },
        { threshold: 80, icon: "mdi:battery-90", color: "green" },
        { threshold: 70, icon: "mdi:battery-80", color: "green" },
        { threshold: 60, icon: "mdi:battery-70", color: "green" },
        { threshold: 50, icon: "mdi:battery-60", color: "green" },
        { threshold: 40, icon: "mdi:battery-50", color: "green" },
        { threshold: 30, icon: "mdi:battery-40", color: "orange" },
        { threshold: 20, icon: "mdi:battery-30", color: "orange" },
        { threshold: 10, icon: "mdi:battery-20", color: "red" },
        { threshold: 0, icon: "mdi:battery-10", color: "red" },
        { threshold: -Infinity, icon: "mdi:battery-alert-variant-outline", color: "red" },
    ];

    const { icon, color } = levels.find(({ threshold }) => state > threshold) ||  { icon: "mdi:battery-alert-variant-outline", color: "red" };

    return html`
        <div class="battery tooltip">
            <div class="tip" style="text-align:center;">${state}%</div>
            <ha-icon .icon="${icon}" style="color: ${color}"></ha-icon>
        </div>
    `;
}
export const renderAttributes = (card: FlowerCard): TemplateResult[] => {
    const icons: Icons = {};
    const uom: UOM = {};
    const uomt: UOMT = {};
    const limits: Record<string, Limits> = {};
    const curr: Record<string, number> = {};
    const sensors: Record<string, string> = {};
    const displayed: DisplayedAttributes = {};
    const monitored = card.config.show_bars || default_show_bars;

    if (card.plantinfo && card.plantinfo.result) {
        const result = card.plantinfo.result;
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
                displayed[elem] = { name: elem, current, limits: limits[`max_${elem}`], icon, sensor, unit_of_measurement };
            }
        }
    }

    return renderAttributeChunks(card, displayed);
}

export const renderAttribute = (card: FlowerCard, attr: DisplayedAttribute) => {
    const { max, min } = attr.limits;
    const unitTooltip = attr.unit_of_measurement;
    const icon = attr.icon || "mdi:help-circle-outline";
    const val = attr.current || 0;
    const aval = !isNaN(val);
    const pct = 100 * Math.max(0, Math.min(1, (val - min) / (max - min)));
    const toolTipText = aval ? `${attr.name}: ${val} ${unitTooltip}<br>(${min} ~ ${max} ${unitTooltip})` : card._hass.localize('state.default.unavailable');
    const label = attr.name === 'dli' ? '<math style="display: inline-grid;" xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mfrac><mrow><mn>mol</mn></mrow><mrow><mn>d</mn><mn>⋅</mn><msup><mn>m</mn><mn>2</mn></msup></mrow></mfrac></mrow></math>' : unitTooltip
    const attributeCssClass = `attribute tooltip ${card.config.display_type === DisplayType.Compact ? 'width-100' : ''}`;

    return html`
        <div class="${attributeCssClass}" @click="${() => moreInfo(card, attr.sensor)}">
            <div class="tip" style="text-align:center;">${unsafeHTML(toolTipText)}</div>
            <ha-icon .icon="${icon}"></ha-icon>
            <div class="meter red">
                <span class="${
                    aval ? (val < min || val > max ? "bad" : "good") : "unavailable"
                }" style="width: 100%;"></span>
            </div>
            <div class="meter green">
                <span class="${
                    aval ? (val > max ? "bad" : "good") : "unavailable"
                }" style="width:${aval ? pct : "0"}%;"></span>
            </div>
            <div class="meter red">
                <span class="bad" style="width:${
                    aval ? (val > max ? 100 : 0) : "0"
                }%;"></span>
            </div>
            ${card.config.display_type === DisplayType.Compact ? '': html`<div class="header"><span class="value">${val}</span>&nbsp;<span class='unit'>${unsafeHTML(label)}</span></div>`}
        </div>
    `;
};

export const getChunkedDisplayed = (displayed: DisplayedAttributes, attributesPerRow: number) => {
    return Object.values(displayed).reduce((acc, curr, i) => {
      const index = Math.floor(i / attributesPerRow);
      if (!acc[index]) {
        acc[index] = [];
      }
      acc[index].push(curr);
      return acc;
    }, []);
}

export const renderAttributeChunks = (card: FlowerCard, displayed: DisplayedAttributes): TemplateResult[] => {
    const chunkedDisplayed = getChunkedDisplayed(displayed, card.config.display_type === DisplayType.Compact ? 1 : 2);
    const attributeCssClass = `attributes ${card.config.display_type === DisplayType.Compact ? 'width-100' : ''}`;

    return chunkedDisplayed.map((chunk) => {
      return html`<div class="${attributeCssClass}">${chunk.map((item: DisplayedAttribute) => {
        return item ? html`${renderAttribute(card, item)}` : '';
      })}</div>`;
    }).flat();
  }

