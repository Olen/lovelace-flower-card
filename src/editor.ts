import { LitElement, css, customElement, html, property } from "lit-element";
import { DisplayType, DropdownOption, FlowerCardConfig, ValueChangedEvent } from "./types/flower-card-types";
import { HomeAssistant, fireEvent } from "custom-card-helpers";
import { default_show_bars, plantAttributes } from "./utils/constants";
import { formatList } from "./utils/utils";

@customElement('flower-card-editor')
export class FlowerCardEditor extends LitElement {
    @property({ attribute: false }) _hass?: HomeAssistant;
    @property({ attribute: false }) private _config?: FlowerCardConfig;

    setConfig(config: FlowerCardConfig) {
        this._config = config;
    }

    set hass(hass: HomeAssistant) {
        this._hass = hass;
    }   

    private _valueChanged(ev: ValueChangedEvent): void {
        if (!this._config || !this._hass) {
            return;
        }
        const target = ev.target;
        const detail = ev.detail;

        if(target.tagName === "HA-CHECKBOX") {
            // Add or remove the value from the array
            const index = this._config[target.configValue].indexOf(target.value);
            if (target.checked && index < 0) {
                this._config[target.configValue] = [...this._config[target.configValue], target.value];
            } else if (!target.checked && index > -1) {
                this._config[target.configValue] = [...this._config[target.configValue].slice(0, index), ...this._config[target.configValue].slice(index + 1)];
            }
        }

        else if (target.configValue) {
            this._config = {
                ...this._config,
                [target.configValue]: target.checked !== undefined || !detail.value ? target.value || target.checked : target.checked || detail.value,
            }
        }
        fireEvent(this, "config-changed", {
            config: this._config
        });
    }

    private _computeLabel(name: string): string {
        return this._hass?.localize(`component.plant.${name}`) || name;
    }

    render() {
        if (!this._hass || !this._config) {
            return html``;
        }

        if (!Object.prototype.hasOwnProperty.call(this._config, 'show_bars')) {
            // Enable all bars by default
            this._config.show_bars = default_show_bars;
        }

        const plantsList = Object.keys(this._hass.states).filter(
            (eid: string) => eid.substr(0, eid.indexOf(".")) === "plant"
        ).map(item => formatList(item, this._hass));

        const batteryList = Object.keys(this._hass.states).filter(
            (eid: string) => eid.substr(0, eid.indexOf(".")) === "sensor" && this._hass.states[eid].attributes.device_class === "battery"
        ).map(item => formatList(item, this._hass));

        return html`
                <div class="card-config">
                    ${this.renderRadio("Display Type", "display_type", [
                        { label: 'Full', value: DisplayType.Full },
                        { label: 'Compact', value: DisplayType.Compact },
                    ])}
                    ${this.renderDropdown("Entity", "entity", plantsList)}
                    ${this.renderDropdown("Battery Sensor", "battery_sensor", batteryList)}
                    ${this.renderCheckboxes("Show Bars", "show_bars", plantAttributes)}
                </div>
            `;
    }

    renderDropdown = (label: string, configValue: string, items: DropdownOption[]) => {
        return html`            
            <div class="form-row">
                <ha-combo-box
                    label="${label}"
                    .value="${this._config[configValue]}"
                    .configValue="${configValue}"
                    .items="${items}"
                    @value-changed="${this._valueChanged}"
                    @change=${this._valueChanged}
                ></ha-combo-box>
            </div>
          `;
    }

    renderRadio = (label: string, configValue: string, items: DropdownOption[]) => {
        return html`
            <div class="form-row">
                <label>${label}</label>
                ${items.map(item => {
                    return html`
                        <div class="form-control">
                            <ha-radio
                                id="${configValue}_${item.value}"
                                name="${configValue}"
                                .checked="${this._config[configValue] === item.value}"
                                .configValue="${configValue}"
                                .value="${item.value}"
                                @change="${this._valueChanged}"
                            >
                            </ha-radio>
                            <label for="${configValue}_${item.value}">${item.label}</label>
                        </div>
                        `;
                })}
            </div>
          `;
    }

    renderCheckboxes = (label: string, configValue: string, items: DropdownOption[]) => {
        return html`            
            <div class="form-row">
                <label>${label}</label>
                ${items.map(item => {
                    return html`
                        <div class="form-control">
                            <ha-checkbox
                                id="${configValue}_${item.value}"
                                name="${configValue}[]"
                                .checked="${this._config[configValue].indexOf(item.value) > -1}"
                                .configValue="${configValue}"
                                .value="${item.value}"
                                @change="${this._valueChanged}"
                            >
                            </ha-checkbox>
                            <label for="${configValue}_${item.value}">${item.label}</label>
                        </div>
                        `;
                })}
            </div>
          `;
    }

    static get styles() {
        return css`
        .form-row {
            margin-bottom: 10px;
        }
        .form-control {
            display: flex;
            align-items: center;
        }
        `;
    }
}