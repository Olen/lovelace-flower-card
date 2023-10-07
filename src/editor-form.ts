import { HomeAssistant, fireEvent } from "custom-card-helpers";
import { LitElement, TemplateResult, css, html, property } from "lit-element";
import { FlowerCardConfig } from "./types/flower-card-types";

export class EditorForm extends LitElement {
    @property({ attribute: false }) _hass?: HomeAssistant;
    @property({ attribute: false }) _config?: FlowerCardConfig;

    setConfig(config: FlowerCardConfig) {
        this._config = config;
    }

    set hass(hass: HomeAssistant) {
        this._hass = hass;
    }

    renderForm(controls: FormControl[]) {
        return html`
        <div class="card-config">
            ${controls.map(control => this.renderControl(control))}
        </div>
        `;
    }     

    renderControl(control: FormControl): TemplateResult {
        switch (control.type) {
            case FormControlType.Dropdown:
                return this.renderDropdown(control.label, control.configValue, control.items);
            case FormControlType.Radio:
                return this.renderRadio(control.label, control.configValue, control.items);
            case FormControlType.Checkbox:
                return this.renderCheckboxes(control.label, control.configValue, control.items);
        }
    }

    private _valueChanged(ev: ValueChangedEvent): void {
        if (!this._config || !this._hass) {
            return;
        }
        const target = ev.target;
        const detail = ev.detail;

        if (target.tagName === "HA-CHECKBOX") {
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

    getEntitiesByDomain(domain: string): DropdownOption[] {
        return Object.keys(this._hass.states)
            .filter((eid: string) => eid.substr(0, eid.indexOf(".")) === domain)
            .map((item) => this.formatList(item, this._hass));
    }

    getEntitiesByDeviceClass(domain: string, device_class: string): DropdownOption[] {
        return Object.keys(this._hass.states)
            .filter((eid: string) => eid.substr(0, eid.indexOf(".")) === domain && this._hass.states[eid].attributes.device_class === device_class)
            .map((item) => this.formatList(item, this._hass));
    }

    formatList = (entity: string, hass: HomeAssistant): DropdownOption => ({
        label: hass.states[entity].attributes.friendly_name,
        value: entity
    });

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

export interface DropdownOption {
    label: string;
    value: string;
}

export interface ValueChangedEvent {
    detail: {
        value: {
            itemValue: string;
            parentElement: {
                configValue: string;
            };
        }
    };
    target: {
        value: string;
        configValue: string;
        checked?: boolean;
        tagName?: string;
    };
    
}

export interface FormControl {
    label: string;
    configValue: string;
    type: FormControlType;
    items?: DropdownOption[];
}

export enum FormControlType {
    Dropdown = "dropdown",
    Checkbox = "checkbox",
    Radio = "radio"
}