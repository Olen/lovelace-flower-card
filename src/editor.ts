import { customElement, html } from "lit-element";
import { DisplayType } from "./types/flower-card-types";
import { default_show_bars, plantAttributes } from "./utils/constants";
import { EditorForm, FormControlType } from "./editor-form";

@customElement('flower-card-editor')
export class FlowerCardEditor extends EditorForm {

    render() {
        if (!this._hass || !this._config) {
            return html``;
        }

        if (!Object.prototype.hasOwnProperty.call(this._config, 'show_bars')) {
            // Enable all bars by default
            this._config.show_bars = default_show_bars;
        }

        const plantsList = this.getEntitiesByDomain('plant');
        const batteryList = this.getEntitiesByDeviceClass("sensor", "battery");

        return this.renderForm([
            { label: "Display Type", configValue: "display_type", type: FormControlType.Radio, items: [
                { label: 'Full', value: DisplayType.Full },
                { label: 'Compact', value: DisplayType.Compact },
            ]},
            { label: "Entity", configValue: "entity", type: FormControlType.Dropdown, items: plantsList },
            { label: "Battery Sensor", configValue: "battery_sensor", type: FormControlType.Dropdown, items: batteryList },
            { label: "Show Bars", configValue: "show_bars", type: FormControlType.Checkbox, items: plantAttributes },
        ]);
    }    
}