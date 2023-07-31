import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@3.0.1/lit-element.js?module";
import {unsafeHTML} from 'https://unpkg.com/lit-html@latest/directives/unsafe-html.js?module';


export const fireEvent = (node, type, detail) => {
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: true,
    cancelable: false,
    composed: true
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

const default_show_bars = [
  "moisture",
  "conductivity",
  "temperature",
  "illuminance",
  "humidity",
  "dli",
];

class FlowerCard extends LitElement {

  static getConfigElement() {
    return document.createElement("flower-card-editor");
  }

  static getStubConfig(ha) {
    const supportedEntities = Object.values(ha.states).filter(
      (entity) => entity.entity_id.indexOf('plant.') === 0
    );
    const entity = supportedEntities.length > 0 ? supportedEntities[0].entity_id : 'plant.my_plant';

    return {
      entity: entity,
      battery_sensor: "sensor.myflower_battery",
      show_bars: default_show_bars
    }
  }

  // The user supplied configuration. Throw an exception and Home Assistant
  // will render an error card.
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = config;
  }
  set hass(hass) {
    this._hass = hass;
    this.stateObj = hass.states[this.config.entity];
    if (!this.prev_fetch) {
      this.prev_fetch = 0;
    }
    // Only fetch once every second at max.  HA is flooeded with websocket requests
    if (Date.now() > this.prev_fetch + 1000) {
      this.prev_fetch = Date.now();
      this.get_data(hass).then(() => {
        this.requestUpdate();
      });
    }
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 5;
  }

  // Use websocket to get plant-data
  async get_data(hass) {
    try {
      this.plantinfo = await hass.callWS({
        type: "plant/get_info",
        entity_id: this.config.entity,
      });
    } catch (err) {}
  }

  moreInfo(entityId = this.config.entity) {
    fireEvent(
      this,
      'hass-more-info',
      {
        entityId,
      },
      {
        bubbles: false,
        composed: true,
      }
    );
  }

  static get styles() {
    return css`
    ha-card {
      margin-top: 32px;
    }
    .attributes {
      white-space: nowrap;
      padding: 8px;
    }
    .attribute ha-icon {
      vertical-align: middle;
      display: inline-grid;
    }
    .attribute {
      display: inline-block;
      width: 50%;
      vertical-align: middle;
      white-space: nowrap;
      
    }
    #battery {
      float: right;
      margin-right: 16px;
      margin-top: -15px;
    }
    .header {
      padding-top: 8px;
      height: 72px;
    }
    .attribute .header {
      height: auto;
    }
    .header > img {
      border-radius: 50%;
      width: 88px;
      height: 88px;
      object-fit: cover;
      margin-left: 16px;
      margin-right: 16px;
      margin-top: -32px;
      float: left;
      box-shadow: var( --ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2) );
    }
    .header > #name {
      font-weight: bold;
      width: 100%;
      margin-top: 16px;
      text-transform: capitalize;
      display: block;
    }
    #name ha-icon {
        color: rgb(240, 163, 163);
    }
    .header > #species {
      text-transform: capitalize;
      color: #8c96a5;
      display: block;
    }
    .meter {
      height: 8px;
      background-color: #f1f1f1;
      border-radius: 2px;
      display: inline-grid;
      overflow: hidden;
    }
    .meter.red {
      width: 5%;
    }
    .meter.green {
      width: 40%;
    }
    .meter > span {
      grid-row: 1;
      grid-column: 1;
      height: 100%;
    }
    .meter > .good {
      background-color: rgba(43,194,83,1);
    }
    .meter > .bad {
      background-color: rgba(240,163,163);
    }
    .meter > .unavailable {
      background-color: rgba(158,158,158,1);
    }
    .divider {
      height: 1px;
      background-color: #727272;
      opacity: 0.25;
      margin-left: 8px;
      margin-right: 8px;
    }
    .tooltip {
      position: relative;
    }
    .tooltip .tip {
      opacity: 0;
      visibility: hidden;
      position: absolute;
      padding: 6px 10px;
      top: 3.3em;
      left: 50%;
      -webkit-transform: translateX(-50%) translateY(-180%);
              transform: translateX(-50%) translateY(-180%);
      background: grey;
      color: white;
      white-space: nowrap;
      z-index: 2;
      border-radius: 2px;
      transition: opacity 0.2s cubic-bezier(0.64, 0.09, 0.08, 1), -webkit-transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1);
      transition: opacity 0.2s cubic-bezier(0.64, 0.09, 0.08, 1), transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1);
      transition: opacity 0.2s cubic-bezier(0.64, 0.09, 0.08, 1), transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1), -webkit-transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1);
    }
    .battery.tooltip .tip {
      top: 2em;
    }
    .tooltip:hover .tip, .tooltip:active .tip {
      display: block;
      opacity: 1;
      visibility: visible;
      -webkit-transform: translateX(-50%) translateY(-200%);
              transform: translateX(-50%) translateY(-200%);
    }
    @media (max-width: 600px) {
      .header > .unit {
        display: none;
      }
    }
    `;
  }

  render() {
    if (
      !this.config ||
      !this._hass
    ) {
      // console.log(this.config);
      // console.log(this.stateObj);
      // console.log(this._hass);
      return null;
    }
    // console.log(this.config);
    // console.log(this._hass);
    // const stateObj = this.hass.states[this.config.entity];
    if (!this.stateObj) {
      return html`
          <hui-warning>
          Entity not available: ${this.config.entity}
          </hui-warning>
        `;
    }
    const species = this.stateObj.attributes.species;
    var icons = {};
    var uom = {};
    var uomt = {};
    var limits = {};
    var curr = {};
    var sensors = {};
    var displayed = [];
    var monitored = this.config.show_bars || default_show_bars;
    const battery_sensor = this.config.battery_sensor || null;

    if (this.plantinfo && this.plantinfo["result"]) {
      const result = this.plantinfo["result"];
      for (var i = 0; i < monitored.length; i++) {
        let elem = monitored[i];
        if (result[elem]) {
          limits["max_" + elem] = result[elem].max;
          limits["min_" + elem] = result[elem].min;
          curr[elem] = result[elem].current;
          icons[elem] = result[elem].icon;
          sensors[elem] = result[elem].sensor;
          uomt[elem] = result[elem].unit_of_measurement;
          uom[elem] = result[elem].unit_of_measurement;
          if (elem == "dli") {
            uomt["dli"] = "mol/d⋅m²";
            uom["dli"] = '<math style="display: inline-grid;" xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mfrac><mrow><mn>mol</mn></mrow><mrow><mn>d</mn><mn>⋅</mn><msup><mn>m</mn><mn>2</mn></msup></mrow></mfrac></mrow></math>';
          }
          displayed.push(elem);
        }
      }
    }
    const attribute = (attr) => {
      const min = parseFloat(limits["min_" + attr]);
      const max = parseFloat(limits["max_" + attr]);
      const unit = uom[attr];
      // console.log(html`${unsafeHTML(unit)}`);
      const unitTooltip = uomt[attr];
      const icon = icons[attr] || "mdi:help-circle-outline";
      var val = parseFloat(curr[attr]);
      if (isNaN(val)) {
        var aval = false;
        var pct = 0;
        val = "";
      } else {
        var aval = true;
        var pct = 100 * Math.max(0, Math.min(1, (val - min) / (max - min)));
      }

      var toolTipText = aval ? attr + ": " + val + " " + unitTooltip + '<br>(' + min + " ~ " + max +" " + unitTooltip + ")"
                             : this._hass.localize('state.default.unavailable');

      return html`
      <div class="attribute tooltip" @click="${() => this.moreInfo(sensors[attr])}">
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
        <span class="header"><span class="value">${val}</span>&nbsp;<span class="unit">${unsafeHTML(unit)}</span></span>
      </div>
      `;
    };
    const battery = () => {
      if (battery_sensor) {
        if (this._hass.states[battery_sensor]) {
          var value = this._hass.states[battery_sensor].state + '%';
          switch (true) {
            case this._hass.states[battery_sensor].state > 90:
              var icon = "mdi:battery";
              var battery_color = "green";
              break;
            case this._hass.states[battery_sensor].state > 80:
              var icon = "mdi:battery-90";
              var battery_color = "green";
              break;
            case this._hass.states[battery_sensor].state > 70:
              var icon = "mdi:battery-80";
              var battery_color = "green";
              break;
            case this._hass.states[battery_sensor].state > 60:
              var icon = "mdi:battery-70";
              var battery_color = "green";
              break;
            case this._hass.states[battery_sensor].state > 50:
              var icon = "mdi:battery-60";
              var battery_color = "green";
              break;
            case this._hass.states[battery_sensor].state > 40:
              var icon = "mdi:battery-50";
              var battery_color = "green";
              break;
            case this._hass.states[battery_sensor].state > 30:
              var icon = "mdi:battery-40";
              var battery_color = "orange";
              break;
            case this._hass.states[battery_sensor].state > 20:
              var icon = "mdi:battery-30";
              var battery_color = "orange";
              break;
            case this._hass.states[battery_sensor].state > 10:
              var icon = "mdi:battery-20";
              var battery_color = "red";
              break;
            case this._hass.states[battery_sensor].state == 0:
              var icon = "mdi:battery-alert-variant-outline";
              var battery_color = "red";
              break;
            case this._hass.states[battery_sensor].state == 'unavailable':
              var icon = "mdi:battery-off-outline";
              var battery_color = "rgba(158,158,158,1)";
              var value =  this._hass.localize('state.default.unavailable');
              break;
            default:
              var icon = "mdi:battery-10";
              var battery_color = "red";
          }
        } else {
          var icon = "mdi:battery-off-outline";
          var battery_color = "rgba(158,158,158,1)";
          var value =  this._hass.localize('state.default.unavailable');
        }
        return html`
        <div class="battery tooltip">
        <div class="tip" style="text-align:center;">${value}</div>
        <ha-icon .icon="${icon}" style="color: ${battery_color}"></ha-icon>
        </div>
        `;
      } else {
        return html``;
      }
    };
    return html`
      <ha-card>
      <div class="header" @click="${() =>
        this.moreInfo(this.stateObj.entity_id)}">
        <img src="${
          this.stateObj.attributes.entity_picture
            ? this.stateObj.attributes.entity_picture
            : missingImage
        }">
        <span id="name"> ${
          this.stateObj.attributes.friendly_name
        } <ha-icon .icon="mdi:${
      this.stateObj.state.toLowerCase() == "problem"
        ? "alert-circle-outline"
        : ""
    }"></ha-icon>
        </span>
        <span id="battery">${battery()}</span>
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
}

class ContentCardEditor extends LitElement {

  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }
  setConfig(config) {
    this._config = config;
  }
  set hass(hass) {
    this._hass = hass;
  }

  _valueChanged(ev) {
    // console.log("ValueChanged");
    // console.log(ev);
    if (!this._config || !this._hass) {
      return;
    }
    const _config = Object.assign({}, this._config);
    _config.entity = ev.detail.value.entity;
    _config.battery_sensor = ev.detail.value.battery_sensor;
    _config.show_bars = ev.detail.value.show_bars;

    this._config = _config;

    const event = new CustomEvent("config-changed", {
      detail: { config: _config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    // console.log("Render");
    // console.log(this._config);
    if (!this._hass || !this._config) {
      return html``;
    }
    if (!this._config.hasOwnProperty('show_bars')) {
      // Enable all bars by default
      this._config.show_bars = default_show_bars;
    }
    return html`
      <ha-form
      .hass=${this._hass}
      .data=${this._config}
      .schema=${[
        {name: "entity", selector: { entity: { domain: "plant" } }},
        {name: "battery_sensor", selector: { entity: { device_class: "battery" } }},
        {name: "show_bars", selector: { select: { multiple: true, mode: "list", options: [
	  {label: "Moisture", value: "moisture"},
	  {label: "Conductivity", value: "conductivity"},
	  {label: "Temperature", value: "temperature"},
	  {label: "Illuminance", value: "illuminance"},
	  {label: "Humidity", value: "humidity"},
	  {label: "Daily Light Integral", value: "dli"}
	  ]}
	}}
      ]}
      .computeLabel=${this._computeLabel}
      @value-changed=${this._valueChanged} 
      ></ha-form>
    `;
  }
}


customElements.define("flower-card", FlowerCard);
customElements.define("flower-card-editor", ContentCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
    type: "flower-card",
    name: "Flower Card",
    preview: true, // Optional - defaults to false
    description: "Custom flower card for https://github.com/Olen/homeassistant-plant", // Optional
});

