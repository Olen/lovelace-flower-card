customElements.whenDefined('card-tools').then(() => {
  var cardTools = customElements.get('card-tools');
  class FlowerCard extends cardTools.LitElement {

    async setConfig(config) {
      this.config = config;
    }

    static get styles() {
      return cardTools.LitCSS`
      ha-card {
        margin-top: 32px;
      }
      .attributes {
        white-space: nowrap;
        padding: 8px;
      }
      .attribute ha-icon {
        float: left;
        margin-right: 4px;
      }
      .attribute {
        display: inline-block;
        width: 50%;
        white-space: normal;
      }

      .header {
        padding-top: 8px;
        height: 72px;
      }
      .header > img {
        border-radius: 50%;
        width: 88px;
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
        width: 10%;
      }
      .meter.green {
        width: 50%;
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
      .tooltip:after {
        opacity: 0;
        visibility: hidden;
        position: absolute;
        content: attr(data-tooltip);
        padding: 6px 10px;
        top: 1.4em;
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
      .tooltip:hover:after, .tooltip:active:after {
        display: block;
        opacity: 1;
        visibility: visible;
        -webkit-transform: translateX(-50%) translateY(-200%);
                transform: translateX(-50%) translateY(-200%);
      }
      `;
    }

    render() {
      if(!this.stateObj) {
	console.log("No plant found for entity " + this.config.entity);
        return cardTools.LitHtml``;
      }
      const species = this.stateObj.attributes.species;
      const limits = this.stateObj.attributes.limits;
      const attribute = (icon, attr, min, max) => {
        const unit = this.stateObj.attributes.unit_of_measurement_dict[attr];
        const val = this.stateObj.attributes[attr];
        const aval = val !== 'unavailable' ? true : false;
        const pct = 100*Math.max(0, Math.min(1, (val-min)/(max-min)));
        return cardTools.LitHtml`
        <div class="attribute tooltip" data-tooltip="${aval ? val + " "+ unit + " | " + min + " ~ " + max + " " + unit : val}" @click="${() => cardTools.moreInfo(this.stateObj.attributes.sensors[attr])}">
          <ha-icon .icon="${icon}"></ha-icon>
          <div class="meter red">
            <span class="${aval ? (val < min || val > max ? 'bad' : 'good') : 'unavailable'}" style="width: 100%;"></span>
          </div>
          <div class="meter green">
            <span class="${aval ? (val > max ? 'bad' : 'good') : 'unavailable'}" style="width:${aval ? pct : '0'}%;"></span>
          </div>
          <div class="meter red">
            <span class="bad" style="width:${aval ? (val > max ? 100 : 0) : '0'}%;"></span>
          </div>
        </div>
        `;
            // ${val} (${min}-${max})
      }

      return cardTools.LitHtml`
      <ha-card>
        <div class="header" @click="${() => cardTools.moreInfo(this.stateObj.entity_id)}">
          <img src="${this.stateObj.attributes.image}">
          <span id="name"> ${this.stateObj.attributes.name} <ha-icon .icon="mdi:${this.stateObj.state == 'problem' ? 'alert-circle-outline' : ''}"></ha-icon></span>
          <span id="species">${species} </span>
        </div>
        <div class="divider"></div>
        <div class="attributes">
          ${attribute('mdi:thermometer', 'temperature', limits['min_temperature'], limits['max_temperature'])}
          ${attribute('mdi:white-balance-sunny', 'brightness', limits['min_brightness'], limits['max_brightness'])}
        </div>
        <div class="attributes">
          ${attribute('mdi:water-percent', 'moisture', limits['min_moisture'], limits['max_moisture'])}
          ${attribute('mdi:leaf', 'conductivity', limits['min_conductivity'], limits['max_conductivity'])}
        </div>
      </ha-card>
      `;
    }

    set hass(hass) {
      this._hass = hass;
      this.stateObj = hass.states[this.config.entity];
      this.requestUpdate();
    }

  }

  customElements.define('flower-card', FlowerCard);
});

window.setTimeout(() => {
  if(customElements.get('card-tools')) return;
  customElements.define('flower-card', class extends HTMLElement{
    setConfig() { throw new Error("Can't find card-tools. See https://github.com/thomasloven/lovelace-card-tools");}
});

}, 2000);
