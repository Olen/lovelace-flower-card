customElements.whenDefined("card-tools").then(() => {
  /*
  /
  / Possible options for bars:
  / - moisture
  / - illuminance
  / - conductivity
  / - temperature
  / - humidity
  / - dli
  /
  */
  var cardTools = customElements.get("card-tools");
  var missingImage =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiIGZvY3VzYWJsZT0iZmFsc2UiIHJvbGU9ImltZyIgYXJpYS1oaWRkZW49InRydWUiIHZpZXdCb3g9IjAgMCAyNCAyNCI+CiAgICAgIDxnPgogICAgICA8IS0tP2xpdCQ0MTM0MjMxNjkkLS0+PHBhdGggZD0iTTMsMTNBOSw5IDAgMCwwIDEyLDIyQzEyLDE3IDcuOTcsMTMgMywxM00xMiw1LjVBMi41LDIuNSAwIDAsMSAxNC41LDhBMi41LDIuNSAwIDAsMSAxMiwxMC41QTIuNSwyLjUgMCAwLDEgOS41LDhBMi41LDIuNSAwIDAsMSAxMiw1LjVNNS42LDEwLjI1QTIuNSwyLjUgMCAwLDAgOC4xLDEyLjc1QzguNjMsMTIuNzUgOS4xMiwxMi41OCA5LjUsMTIuMzFDOS41LDEyLjM3IDkuNSwxMi40MyA5LjUsMTIuNUEyLjUsMi41IDAgMCwwIDEyLDE1QTIuNSwyLjUgMCAwLDAgMTQuNSwxMi41QzE0LjUsMTIuNDMgMTQuNSwxMi4zNyAxNC41LDEyLjMxQzE0Ljg4LDEyLjU4IDE1LjM3LDEyLjc1IDE1LjksMTIuNzVDMTcuMjgsMTIuNzUgMTguNCwxMS42MyAxOC40LDEwLjI1QzE4LjQsOS4yNSAxNy44MSw4LjQgMTYuOTcsOEMxNy44MSw3LjYgMTguNCw2Ljc0IDE4LjQsNS43NUMxOC40LDQuMzcgMTcuMjgsMy4yNSAxNS45LDMuMjVDMTUuMzcsMy4yNSAxNC44OCwzLjQxIDE0LjUsMy42OUMxNC41LDMuNjMgMTQuNSwzLjU2IDE0LjUsMy41QTIuNSwyLjUgMCAwLDAgMTIsMUEyLjUsMi41IDAgMCwwIDkuNSwzLjVDOS41LDMuNTYgOS41LDMuNjMgOS41LDMuNjlDOS4xMiwzLjQxIDguNjMsMy4yNSA4LjEsMy4yNUEyLjUsMi41IDAgMCwwIDUuNiw1Ljc1QzUuNiw2Ljc0IDYuMTksNy42IDcuMDMsOEM2LjE5LDguNCA1LjYsOS4yNSA1LjYsMTAuMjVNMTIsMjJBOSw5IDAgMCwwIDIxLDEzQzE2LDEzIDEyLDE3IDEyLDIyWiI+PC9wYXRoPgogICAgICA8L2c+Cjwvc3ZnPgo=";

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
      @media (max-width: 600px) {
        .header > .unit {
          display: none;
        }
      }
      `;
    }

    render() {
      if (!this.stateObj) {
        return cardTools.LitHtml`
            <hui-warning>
            Entity not available: ${this.config.entity}
            </hui-warning>
          `;
      }
      const species = this.stateObj.attributes.species;
      var icons = {};
      var uom = {};
      var limits = {};
      var curr = {};
      var sensors = {};
      var displayed = [];
      var monitored = this.config.show_bars || [
        "moisture",
        "conductivity",
        "temperature",
        "illuminance",
        "humidity",
        "dli",
      ];

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
            uom[elem] = result[elem].unit_of_measurement;
            if (elem == "dli") {
              uom["dli"] = "mol/d⋅m²";
            }
            displayed.push(elem);
          }
        }
      }
      const attribute = (attr) => {
        const min = parseInt(limits["min_" + attr]);
        const max = parseInt(limits["max_" + attr]);
        const unit = uom[attr];
        const icon = icons[attr] || "mdi:help-circle-outline";
        var val = parseInt(curr[attr]);
        if (isNaN(val)) {
          var aval = false;
          var pct = 0;
          val = "";
        } else {
          var aval = true;
          var pct = 100 * Math.max(0, Math.min(1, (val - min) / (max - min)));
        }

        return cardTools.LitHtml`
        <div class="attribute tooltip" data-tooltip="${
          aval
            ? attr +
              ": " +
              val +
              " " +
              unit +
              " | " +
              min +
              " ~ " +
              max +
              " " +
              unit
            : curr[attr]
        }" @click="${() => cardTools.moreInfo(sensors[attr])}">
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
          <span class="header"><span class="value"> ${val}</span> <span class="unit">${unit}</span></span>
        </div>
        `;
      };

      return cardTools.LitHtml`
        <ha-card>
        <div class="header" @click="${() =>
          cardTools.moreInfo(this.stateObj.entity_id)}">
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

    async get_data(hass) {
      try {
        this.plantinfo = await hass.callWS({
          type: "plant/get_info",
          entity_id: this.config.entity,
        });
      } catch (err) {}
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
  }

  customElements.define("flower-card", FlowerCard);
});

window.setTimeout(() => {
  if (customElements.get("card-tools")) return;
  customElements.define(
    "flower-card",
    class extends HTMLElement {
      setConfig() {
        throw new Error(
          "Can't find card-tools. See https://github.com/thomasloven/lovelace-card-tools"
        );
      }
    }
  );
}, 2000);
