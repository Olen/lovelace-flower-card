import { html } from 'lit';
import { customElement } from "lit/decorators.js";
import { DisplayType } from "./types/flower-card-types";
import { default_show_bars, plantAttributes } from "./utils/constants";
import EditorForm from "@marcokreeft/ha-editor-formbuilder";
import { FormControlType } from "@marcokreeft/ha-editor-formbuilder/dist/interfaces";
import { getEntitiesByDomain } from "@marcokreeft/ha-editor-formbuilder/dist/utils/entities";
import { getEntitiesByDeviceClass } from "@marcokreeft/ha-editor-formbuilder/dist/utils/entities";

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

        const plantsList = getEntitiesByDomain(this._hass, 'plant');
        const batteryList = getEntitiesByDeviceClass(this._hass, "sensor", "battery");

        return this.renderForm([
            { controls: [{ label: "Display Type", configValue: "display_type", type: FormControlType.Radio, items: [
                { label: 'Full', value: DisplayType.Full },
                { label: 'Compact', value: DisplayType.Compact },
            ] }] },
            { controls: [{ label: "Entity", configValue: "entity", type: FormControlType.Dropdown, items: plantsList }] },
            { controls: [{ label: "Battery Sensor", configValue: "battery_sensor", type: FormControlType.Dropdown, items: batteryList }] },
            { controls: [{ label: "Show Bars", configValue: "show_bars", type: FormControlType.Checkboxes, items: plantAttributes }] }
        ]);
    }    
}
