import { LitElement, customElement, html, property } from "lit-element";
import { DisplayType, FlowerCardConfig } from "./types/flower-card-types";
import { HomeAssistant } from "custom-card-helpers";
import { default_show_bars } from "./utils/constants";

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

    private _valueChanged(ev: CustomEvent): void {
        if (!this._config || !this._hass) {
            return;
        }

        const _config = { ...this._config };
        _config.entity = ev.detail.value.entity;
        _config.battery_sensor = ev.detail.value.battery_sensor;
        _config.show_bars = ev.detail.value.show_bars;

        this._config = _config;

        const event = new CustomEvent('config-changed', {
            detail: { config: _config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
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

        return html`
      <ha-form
        .hass=${this._hass}
        .data=${this._config}
        .schema=${[
                {
                    name: 'display_type',
                    selector: {
                        select: {
                            mode: 'list',
                            options: [
                                { label: 'Full', value: DisplayType.Full },
                                { label: 'Compact', value: DisplayType.Compact },
                            ],
                        },
                    },
                },
                { name: 'entity', selector: { entity: { domain: 'plant' } } },
                { name: 'battery_sensor', selector: { entity: { device_class: 'battery' } } },
                {
                    name: 'show_bars',
                    selector: {
                        select: {
                            multiple: true,
                            mode: 'list',
                            options: [
                                { label: 'Moisture', value: 'moisture' },
                                { label: 'Conductivity', value: 'conductivity' },
                                { label: 'Temperature', value: 'temperature' },
                                { label: 'Illuminance', value: 'illuminance' },
                                { label: 'Humidity', value: 'humidity' },
                                { label: 'Daily Light Integral', value: 'dli' },
                            ],
                        },
                    },
                },
            ]}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
    }
}