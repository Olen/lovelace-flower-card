/*! For license information please see flower-card.js.LICENSE.txt */
(()=>{"use strict";var t={153(t,e,i){var s,r,o;i.d(e,{fireEvent:()=>n}),(o=s||(s={})).language="language",o.system="system",o.comma_decimal="comma_decimal",o.decimal_comma="decimal_comma",o.space_comma="space_comma",o.none="none",function(t){t.language="language",t.system="system",t.am_pm="12",t.twenty_four="24"}(r||(r={})),new Set(["fan","input_boolean","light","switch","group","automation"]);var n=function(t,e,i,s){s=s||{},i=i??{};var r=new Event(e,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});return r.detail=i,t.dispatchEvent(r),r};new Set(["call-service","divider","section","weblink","cast","select"])},248(t,e,i){var s=this&&this.__decorate||function(t,e,i,s){var r,o=arguments.length,n=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(n=(o<3?r(n):o>3?r(e,i,n):r(e,i))||n);return o>3&&n&&Object.defineProperty(e,i,n),n},r=this&&this.__awaiter||function(t,e,i,s){return new(i||(i=Promise))(function(r,o){function n(t){try{l(s.next(t))}catch(t){o(t)}}function a(t){try{l(s.throw(t))}catch(t){o(t)}}function l(t){var e;t.done?r(t.value):(e=t.value,e instanceof i?e:new i(function(t){t(e)})).then(n,a)}l((s=s.apply(t,e||[])).next())})};Object.defineProperty(e,"__esModule",{value:!0}),e.getEntitySuggestion=void 0;const o=i(618),n=i(791),a=i(800),l=i(854),c=i(330),d=i(429),h=i(139),p=i(135);console.info(`%c FLOWER-CARD %c ${c.version}`,"color: cyan; background: black; font-weight: bold;","color: darkblue; background: white; font-weight: bold;"),e.getEntitySuggestion=(t,e)=>"plant"!==e.split(".")[0]?null:[{label:"Full",config:{type:`custom:${h.CARD_NAME}`,entity:e}},{label:"Compact",config:{type:`custom:${h.CARD_NAME}`,entity:e,display_type:l.DisplayType.Compact}}],window.customCards=window.customCards||[],window.customCards.push({type:h.CARD_NAME,name:"Flower card",preview:!0,description:"Custom flower card for https://github.com/Olen/homeassistant-plant",getEntitySuggestion:e.getEntitySuggestion});let u=class extends o.LitElement{constructor(){super(...arguments),this.plantinfo={result:{}}}set hass(t){var e,i;this._hass=t,this.stateObj=(null===(e=this.config)||void 0===e?void 0:e.entity)?t.states[this.config.entity]:void 0;const s=null===(i=this.stateObj)||void 0===i?void 0:i.attributes.entity_picture;s!==this._lastEntityPicture&&(this._lastEntityPicture=s,this._resolveEntityPicture(t,s)),this.previousFetchDate||(this.previousFetchDate=0),Date.now()>this.previousFetchDate+1e3&&(this.previousFetchDate=Date.now(),this.get_data(t).then(()=>{this.requestUpdate()}))}_resolveEntityPicture(t,e){return r(this,void 0,void 0,function*(){e?(0,p.isMediaSourceUrl)(e)?(this._resolvedImageUrl=yield(0,p.resolveMediaSource)(t,e),this.requestUpdate()):this._resolvedImageUrl=e:this._resolvedImageUrl=void 0})}static getConfigForm(){return{schema:[{name:"entity",required:!0,selector:{entity:{domain:"plant"}}},{name:"name",selector:{text:{}}},{name:"battery_sensor",selector:{entity:{domain:"sensor",device_class:"battery"}}},{type:"expandable",name:"",title:"Bars",schema:[{name:"show_bars",selector:{select:{multiple:!0,options:h.plantAttributes}}}]},{type:"expandable",name:"",title:"Care Info",schema:[{name:"show_care",selector:{select:{multiple:!0,options:h.careFields}}}]},{type:"expandable",name:"",title:"Appearance",schema:[{name:"display_type",selector:{select:{options:[{value:"full",label:"Full"},{value:"compact",label:"Compact"}]}}},{name:"hide_species",selector:{boolean:{}}},{name:"hide_image",selector:{boolean:{}}},{name:"hide_units",selector:{boolean:{}}}]}],computeLabel:t=>({entity:"Entity",name:"Display Name",display_type:"Display Type",battery_sensor:"Battery Sensor",show_bars:"Show Bars",show_care:"Show Care Info",hide_species:"Hide Species",hide_image:"Hide Image",hide_units:"Hide Units"}[t.name]||t.name)}}static getStubConfig(t){const e=t=>"object"==typeof t&&null!==t&&"entity_id"in t&&"string"==typeof t.entity_id&&t.entity_id.startsWith("plant.");let i=[];try{i=Object.values(t.states).filter(e)}catch(t){console.info(`Unable to get ha-data: ${t}`)}return{entity:i.length>0?i[0].entity_id:"plant.my_plant",battery_sensor:"sensor.myflower_battery",show_bars:h.default_show_bars}}setConfig(t){if(!t.entity)throw new Error("You need to define an entity");this.config=t}render(){var t,e;if(!this.config||!this._hass)return o.html``;if(!this.stateObj)return o.html`
                <hui-warning>
                Entity not available: ${this.config.entity}
                </hui-warning>
              `;const i=this.stateObj.attributes.species,s=this.config.name||this.stateObj.attributes.friendly_name,r=null!==(t=this.config.hide_species)&&void 0!==t&&t,n=null!==(e=this.config.hide_image)&&void 0!==e&&e,a=this.config.display_type===l.DisplayType.Compact?"header-compact":"header",c=this.config.display_type===l.DisplayType.Compact||n?"":"card-margin-top",u=n?" no-image":"";return o.html`
            <ha-card class="${c}">
            <div class="${a}${u}" @click="${()=>(0,p.moreInfo)(this,this.stateObj.entity_id)}">
                ${n?"":o.html`<img src="${this._resolvedImageUrl||h.missingImage}">`}
                <span id="name"> ${s} <ha-icon .icon="mdi:${"problem"==this.stateObj.state.toLowerCase()?"alert-circle-outline":""}"></ha-icon>
                </span>
                <span id="battery">${(0,d.renderExtraBadges)(this)}${(0,d.renderBattery)(this)}</span>
                ${r?"":o.html`<span id="species">${i}</span>`}
            </div>
            <div class="divider"></div>
            ${(0,d.renderAttributes)(this)}
            ${(0,d.renderCareInfo)(this)}
            </ha-card>
            `}get_data(t){return r(this,void 0,void 0,function*(){var e,i;try{this.plantinfo=yield t.callWS({type:"plant/get_info",entity_id:null===(e=this.config)||void 0===e?void 0:e.entity})}catch(t){console.warn(`Flower card: Failed to fetch data for ${null===(i=this.config)||void 0===i?void 0:i.entity}:`,t),this.plantinfo&&this.plantinfo.result&&0!==Object.keys(this.plantinfo.result).length||(this.plantinfo={result:{}})}})}getCardSize(){return 5}static get styles(){return a.style}};s([(0,n.property)()],u.prototype,"_hass",void 0),s([(0,n.property)()],u.prototype,"config",void 0),u=s([(0,n.customElement)(h.CARD_NAME)],u),e.default=u},800(t,e,i){e.style=void 0;const s=i(618);e.style=s.css`
.card-margin-top {
  margin-top: 32px;
}
.attributes {
  display: flex;
  white-space: nowrap;
  padding: 8px;
}
.attributes.width-100 {
  padding: 2px;

}
.attribute ha-icon {
  margin-right: 10px;
  margin-left: 5px;
}
.attribute {
  white-space: nowrap;
  display: flex;  
  align-items: center;
  width: 50%;
}
#battery {
  float: right;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 16px;
  margin-top: -15px;
}
.header {
  padding-top: 8px;
  height: 72px;
}
.header-compact {
  padding-top: 4px;
  height: 55px;
}
.attribute .header, .attribute .header-compact {
  height: auto;
  padding-top: 0px;
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
.header-compact > img {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-left: 8px;
  margin-right: 8px;
  margin-top: 0px;
  float: left;
  box-shadow: var( --ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2) );
}
.header.no-image {
  height: auto;
  padding: 16px;
}
.header.no-image + .divider {
  margin-top: 0;
}
.header-compact.no-image {
  height: auto;
  padding: 8px 16px;
}
.header.no-image > #name,
.header-compact.no-image > #name {
  margin-top: 0;
  margin-left: 0;
}
.header > #name {
  font-weight: bold;
  width: 100%;
  margin-top: 16px;
  text-transform: capitalize;
  display: block;
}
.header-compact > #name {
  font-weight: bold;
  width: 100%;
  margin-top: 8px;
  text-transform: capitalize;
  display: block;
  white-space: nowrap;
}
#name ha-icon {
    color: rgb(240, 163, 163);
}
.header > #species {
  color: #8c96a5;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.header-compact > #species {
  line-height: 85%;
  color: #8c96a5;
  font-size: 0.8em;
  margin-top: 0px;
  margin-right: 4px;
  opacity: 0.4;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meter {
  height: 8px;
  background-color: var(--primary-background-color);
  border-radius: 2px;
  display: inline-grid;
  overflow: hidden;
}
.meter.red {
  flex-grow: 1;
  margin-right: 5px;
  max-width: 5%
}
.meter.green {
  flex-grow: 10;
  margin-right: 5px;
  max-width: 40%
}
.attribute.tooltip.width-100 .meter.green {
  max-width: 90%;
}
.attribute.tooltip.width-100 .header {
  display: none;
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
.extra-badge {
  display: inline-block;
  margin-right: 8px;
  cursor: pointer;
}
.extra-badge .badge-text {
  font-size: 0.9em;
  margin-left: 2px;
  vertical-align: middle;
}
.extra-badge.tooltip .tip {
  top: 2em;
}
.tooltip:hover .tip, .tooltip:active .tip {
  display: block;
  opacity: 1;
  visibility: visible;
  -webkit-transform: translateX(-50%) translateY(-200%);
          transform: translateX(-50%) translateY(-200%);
}
.width-100 {
  width: 100%;    
  margin-bottom: 3px;
  margin-right: 5px;
}
.width-100 .header {
  display: none;
}
@media (max-width: 600px) {
  .header > .unit {
    display: none;
  }
}
.care-info {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.care-item {
  display: flex;
  flex-direction: column;
}
.care-heading {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  margin-bottom: 2px;
}
.care-heading ha-icon {
  color: var(--secondary-text-color);
}
.care-text {
  white-space: normal;
  overflow-wrap: break-word;
  line-height: 1.4;
  color: var(--secondary-text-color);
}
`},854(t,e){var i;e.DisplayType=void 0,function(t){t.Full="full",t.Compact="compact"}(i||(e.DisplayType=i={}))},429(t,e,i){e.Rc=e.Ad=e.zc=e.renderAttributes=e.renderExtraBadges=e.kl=e.renderBattery=e.renderCareInfo=e.oN=void 0;const s=i(854),r=i(618),o=i(534),n=i(139),a=i(135);e.oN=(t,e)=>t&&e&&0!==e.length?n.careFields.filter(t=>e.includes(t.value)).map(e=>({key:e.value,label:e.label,icon:n.careIcons[e.value],text:t[e.value]})).filter(t=>"string"==typeof t.text&&""!==t.text.trim()):[],e.renderCareInfo=t=>{var i;const s=t.config.entity,o=s?null===(i=t._hass.states[s])||void 0===i?void 0:i.attributes:void 0,n=(0,e.oN)(o,t.config.show_care);return 0===n.length?r.html``:r.html`
        <div class="care-info">
            ${n.map(t=>r.html`
                <div class="care-item">
                    <div class="care-heading">
                        <ha-icon .icon="${t.icon}"></ha-icon>
                        <span>${t.label}</span>
                    </div>
                    <div class="care-text">${t.text}</div>
                </div>
            `)}
        </div>
    `},e.renderBattery=t=>{var e,i;if(!t.config.battery_sensor)return r.html``;const s=t._hass.states[t.config.battery_sensor];if(!s)return r.html``;const o=parseInt(s.state),n=null!==(e=t.config.battery_warn_level)&&void 0!==e?e:20,l=null!==(i=t.config.battery_ok_level)&&void 0!==i?i:40,c=[{threshold:90,icon:"mdi:battery"},{threshold:80,icon:"mdi:battery-90"},{threshold:70,icon:"mdi:battery-80"},{threshold:60,icon:"mdi:battery-70"},{threshold:50,icon:"mdi:battery-60"},{threshold:40,icon:"mdi:battery-50"},{threshold:30,icon:"mdi:battery-40"},{threshold:20,icon:"mdi:battery-30"},{threshold:10,icon:"mdi:battery-20"},{threshold:0,icon:"mdi:battery-10"},{threshold:-1/0,icon:"mdi:battery-alert-variant-outline"}].find(({threshold:t})=>o>t)||{threshold:-1/0,icon:"mdi:battery-alert-variant-outline"},d=c.icon,h=(p=o)>=l?"green":p>=n?"orange":"red";var p;return r.html`
        <div class="battery tooltip" @click="${e=>{e.stopPropagation(),(0,a.moreInfo)(t,t.config.battery_sensor)}}">
            <div class="tip" style="text-align:center;">${o}%</div>
            <ha-icon .icon="${d}" style="color: ${h}"></ha-icon>
        </div>
    `},e.kl=(t,e)=>{var i;if(e.text){const t="none"===(null===(i=e.icon)||void 0===i?void 0:i.toLowerCase()),s=e.color||"var(--secondary-text-color)";if(t&&e.show_state)return r.html`
                <div class="extra-badge tooltip">
                    <div class="tip" style="text-align:center;">${e.text}</div>
                    <span class="badge-text" style="color: ${s}">${e.text}</span>
                </div>
            `;const o=t?"":e.icon||"mdi:information";return r.html`
            <div class="extra-badge tooltip">
                <div class="tip" style="text-align:center;">${e.text}</div>
                ${t?"":r.html`<ha-icon .icon="${o}" style="color: ${s}"></ha-icon>`}
                ${e.show_state?r.html`<span class="badge-text">${e.text}</span>`:""}
            </div>
        `}if(!e.entity&&e.icon){const t=e.color||"var(--secondary-text-color)";return r.html`
            <div class="extra-badge">
                <ha-icon .icon="${e.icon}" style="color: ${t}"></ha-icon>
            </div>
        `}if(!e.entity)return r.html``;const s=t._hass.states[e.entity];if(!s)return r.html``;const o=e.entity.startsWith("binary_sensor."),n=s.state,l=s.attributes.friendly_name||e.entity;let c,d,h,p=e.icon||s.attributes.icon;if(!p)if(o){const t=s.attributes.device_class,e="on"===n,i={battery:["mdi:battery","mdi:battery-outline"],battery_charging:["mdi:battery-charging","mdi:battery"],cold:["mdi:snowflake","mdi:snowflake-off"],connectivity:["mdi:check-network-outline","mdi:close-network-outline"],door:["mdi:door-open","mdi:door-closed"],garage_door:["mdi:garage-open","mdi:garage"],gas:["mdi:alert-circle","mdi:check-circle"],heat:["mdi:fire","mdi:fire-off"],light:["mdi:brightness-7","mdi:brightness-5"],lock:["mdi:lock-open","mdi:lock"],moisture:["mdi:water","mdi:water-off"],motion:["mdi:motion-sensor","mdi:motion-sensor-off"],moving:["mdi:motion","mdi:motion-off"],occupancy:["mdi:home","mdi:home-outline"],opening:["mdi:square-outline","mdi:square"],plug:["mdi:power-plug","mdi:power-plug-off"],power:["mdi:power","mdi:power-off"],presence:["mdi:home","mdi:home-outline"],problem:["mdi:alert-circle","mdi:check-circle"],running:["mdi:play","mdi:stop"],safety:["mdi:alert-circle","mdi:check-circle"],smoke:["mdi:smoke-detector-alert","mdi:smoke-detector"],sound:["mdi:music-note","mdi:music-note-off"],tamper:["mdi:alert-circle","mdi:check-circle"],update:["mdi:package-up","mdi:package"],vibration:["mdi:vibrate","mdi:vibrate-off"],window:["mdi:window-open","mdi:window-closed"]};p=t&&i[t]?e?i[t][0]:i[t][1]:e?"mdi:checkbox-marked-circle":"mdi:checkbox-blank-circle-outline"}else p="mdi:information";if(c=o&&!e.attribute?"on"===n?e.color_on||"var(--primary-color)":e.color_off||"var(--disabled-text-color)":e.color||"var(--secondary-text-color)",e.attribute){const i=s.attributes[e.attribute];if(h=e.attribute,null==i)d="N/A";else if("last_changed"===e.attribute||"last_updated"===e.attribute){const t="last_changed"===e.attribute?s.last_changed:s.last_updated;d=t?new Date(t).toLocaleString():String(i)}else d=t._hass.formatEntityAttributeValue?t._hass.formatEntityAttributeValue(s,e.attribute):String(i)}else h=l,d=o?n:t._hass.formatEntityState(s);const u=`${h}: ${d}`;return r.html`
        <div class="extra-badge tooltip" @click="${i=>{i.stopPropagation(),(0,a.moreInfo)(t,e.entity)}}">
            <div class="tip" style="text-align:center;">${u}</div>
            <ha-icon .icon="${p}" style="color: ${c}"></ha-icon>
            ${e.show_state?r.html`<span class="badge-text">${d}</span>`:""}
        </div>
    `},e.renderExtraBadges=t=>t.config.extra_badges&&0!==t.config.extra_badges.length?t.config.extra_badges.map(i=>(0,e.kl)(t,i)):r.html``,e.renderAttributes=t=>{var i;const s={},r=t.config.show_bars||n.default_show_bars;if(t.plantinfo&&t.plantinfo.result){const e=t.plantinfo.result;for(const o of r)if(e[o])try{const{max:r,min:n,current:a,icon:l,sensor:c}=e[o],d=t._hass.states[c];if(!d)continue;const h=t._hass.formatEntityState(d).replace(/[^\d,.+-]/g,""),p=(null===(i=null==d?void 0:d.attributes)||void 0===i?void 0:i.unit_of_measurement)||e[o].unit_of_measurement||"",u={max:Number(r),min:Number(n)};s[o]={name:o,current:Number(a),limits:u,icon:String(l),sensor:String(c),unit_of_measurement:String(p),display_state:h}}catch(t){console.warn(`Flower card: Error processing ${o}:`,t)}}return(0,e.Rc)(t,s)},e.zc=(t,e)=>{var i,n,l;const{max:c,min:d}=e.limits,h=e.unit_of_measurement,p="lx"===e.unit_of_measurement,u=e.icon||"mdi:help-circle-outline",m=null!==(i=e.current)&&void 0!==i?i:0,g=!isNaN(m)&&null!=m,y=e.display_state,f=!p||m<=0||d<=0?100*Math.max(0,Math.min(1,(m-d)/(c-d))):100*Math.max(0,Math.min(1,(Math.log(m)-Math.log(d))/(Math.log(c)-Math.log(d)))),_=g?`${e.name}: ${m} ${h}<br>(${d} ~ ${c} ${h})`:t._hass.localize("state.default.unavailable"),v="dli"===e.name||"dli_24h"===e.name?'<math style="display: inline-grid;" xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mfrac><mrow><mn>mol</mn></mrow><mrow><mn>d</mn><mn>⋅</mn><msup><mn>m</mn><mn>2</mn></msup></mrow></mfrac></mrow></math>':h,b=t.config.display_type===s.DisplayType.Compact,$=null!==(n=t.config.bars_per_row)&&void 0!==n?n:b?1:2,w=!(null!==(l=t.config.hide_units)&&void 0!==l?l:b),x="attribute tooltip "+(1===$?"width-100":"");return r.html`
        <div class="${x}" @click="${()=>(0,a.moreInfo)(t,e.sensor)}">
            <div class="tip" style="text-align:center;">${(0,o.unsafeHTML)(_)}</div>
            <ha-icon .icon="${u}"></ha-icon>
            <div class="meter red">
                <span class="${g?m<d||m>c?"bad":"good":"unavailable"}" style="width: 100%;"></span>
            </div>
            <div class="meter green">
                <span class="${g?m>c?"bad":"good":"unavailable"}" style="width:${g?f:"0"}%;"></span>
            </div>
            <div class="meter red">
                <span class="bad" style="width:${g?m>c?100:0:"0"}%;"></span>
            </div>
            ${w?r.html`<div class="header"><span class="value">${y}</span>&nbsp;<span class='unit'>${(0,o.unsafeHTML)(v)}</span></div>`:""}
        </div>
    `},e.Ad=(t,e)=>Object.values(t).reduce((t,i,s)=>{const r=Math.floor(s/e);return t[r]||(t[r]=[]),t[r].push(i),t},[]),e.Rc=(t,i)=>{var o;const n=t.config.display_type===s.DisplayType.Compact,a=null!==(o=t.config.bars_per_row)&&void 0!==o?o:n?1:2,l=1===a,c=(0,e.Ad)(i,a),d="attributes "+(l?"width-100":"");return c.map(i=>r.html`<div class="${d}">${i.map(i=>i?r.html`${(0,e.zc)(t,i)}`:"")}</div>`).flat()}},139(t,e){e.careIcons=e.careFields=e.plantAttributes=e.missingImage=e.default_show_bars=e.CARD_NAME=void 0,e.CARD_NAME="flower-card",e.default_show_bars=["moisture","conductivity","temperature","illuminance","humidity","dli"],e.missingImage="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiIGZvY3VzYWJsZT0iZmFsc2UiIHJvbGU9ImltZyIgYXJpYS1oaWRkZW49InRydWUiIHZpZXdCb3g9IjAgMCAyNCAyNCI+CiAgICAgIDxnPgogICAgICA8IS0tP2xpdCQ0MTM0MjMxNjkkLS0+PHBhdGggZD0iTTMsMTNBOSw5IDAgMCwwIDEyLDIyQzEyLDE3IDcuOTcsMTMgMywxM00xMiw1LjVBMi41LDIuNSAwIDAsMSAxNC41LDhBMi41LDIuNSAwIDAsMSAxMiwxMC41QTIuNSwyLjUgMCAwLDEgOS41LDhBMi41LDIuNSAwIDAsMSAxMiw1LjVNNS42LDEwLjI1QTIuNSwyLjUgMCAwLDAgOC4xLDEyLjc1QzguNjMsMTIuNzUgOS4xMiwxMi41OCA5LjUsMTIuMzFDOS41LDEyLjM3IDkuNSwxMi40MyA5LjUsMTIuNUEyLjUsMi41IDAgMCwwIDEyLDE1QTIuNSwyLjUgMCAwLDAgMTQuNSwxMi41QzE0LjUsMTIuNDMgMTQuNSwxMi4zNyAxNC41LDEyLjMxQzE0Ljg4LDEyLjU4IDE1LjM3LDEyLjc1IDE1LjksMTIuNzVDMTcuMjgsMTIuNzUgMTguNCwxMS42MyAxOC40LDEwLjI1QzE4LjQsOS4yNSAxNy44MSw4LjQgMTYuOTcsOEMxNy44MSw3LjYgMTguNCw2Ljc0IDE4LjQsNS43NUMxOC40LDQuMzcgMTcuMjgsMy4yNSAxNS45LDMuMjVDMTUuMzcsMy4yNSAxNC44OCwzLjQxIDE0LjUsMy42OUMxNC41LDMuNjMgMTQuNSwzLjU2IDE0LjUsMy41QTIuNSwyLjUgMCAwLDAgMTIsMUEyLjUsMi41IDAgMCwwIDkuNSwzLjVDOS41LDMuNTYgOS41LDMuNjMgOS41LDMuNjlDOS4xMiwzLjQxIDguNjMsMy4yNSA4LjEsMy4yNUEyLjUsMi41IDAgMCwwIDUuNiw1Ljc1QzUuNiw2Ljc0IDYuMTksNy42IDcuMDMsOEM2LjE5LDguNCA1LjYsOS4yNSA1LjYsMTAuMjVNMTIsMjJBOSw5IDAgMCwwIDIxLDEzQzE2LDEzIDEyLDE3IDEyLDIyWiI+PC9wYXRoPgogICAgICA8L2c+Cjwvc3ZnPgo=",e.plantAttributes=[{label:"Moisture",value:"moisture"},{label:"Conductivity",value:"conductivity"},{label:"Temperature",value:"temperature"},{label:"Illuminance",value:"illuminance"},{label:"Humidity",value:"humidity"},{label:"Daily Light Integral",value:"dli"},{label:"DLI (24h rolling)",value:"dli_24h"},{label:"CO2",value:"co2"},{label:"Soil Temperature",value:"soil_temperature"},{label:"VPD",value:"vpd"}],e.careFields=[{label:"Watering",value:"care_watering"},{label:"Sunlight",value:"care_sunlight"},{label:"Soil",value:"care_soil"},{label:"Pruning",value:"care_pruning"},{label:"Fertilization",value:"care_fertilization"}],e.careIcons={care_watering:"mdi:watering-can-outline",care_sunlight:"mdi:white-balance-sunny",care_soil:"mdi:shovel",care_pruning:"mdi:content-cut",care_fertilization:"mdi:bottle-tonic-outline"}},135(t,e,i){var s=this&&this.__awaiter||function(t,e,i,s){return new(i||(i=Promise))(function(r,o){function n(t){try{l(s.next(t))}catch(t){o(t)}}function a(t){try{l(s.throw(t))}catch(t){o(t)}}function l(t){var e;t.done?r(t.value):(e=t.value,e instanceof i?e:new i(function(t){t(e)})).then(n,a)}l((s=s.apply(t,e||[])).next())})};Object.defineProperty(e,"__esModule",{value:!0}),e.resolveMediaSource=e.isMediaSourceUrl=e.moreInfo=void 0;const r=i(153);e.moreInfo=(t,e)=>{(0,r.fireEvent)(t,"hass-more-info",{entityId:e},{bubbles:!1,composed:!0})},e.isMediaSourceUrl=t=>{var e;return null!==(e=null==t?void 0:t.startsWith("media-source://"))&&void 0!==e&&e},e.resolveMediaSource=(t,i)=>s(void 0,void 0,void 0,function*(){if(!(0,e.isMediaSourceUrl)(i))return i;try{return(yield t.callWS({type:"media_source/resolve_media",media_content_id:i})).url}catch(t){return console.error("Failed to resolve media source:",t),""}})},842(t,e,i){i.d(e,{mN:()=>M,AH:()=>l,W3:()=>w,Ec:()=>x});const s=globalThis,r=s.ShadowRoot&&(void 0===s.ShadyCSS||s.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),n=new WeakMap;class a{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(r&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}}const l=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new a(i,t,o)},c=(t,e)=>{if(r)t.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of e){const e=document.createElement("style"),r=s.litNonce;void 0!==r&&e.setAttribute("nonce",r),e.textContent=i.cssText,t.appendChild(e)}},d=r?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new a("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:h,defineProperty:p,getOwnPropertyDescriptor:u,getOwnPropertyNames:m,getOwnPropertySymbols:g,getPrototypeOf:y}=Object,f=globalThis,_=f.trustedTypes,v=_?_.emptyScript:"",b=f.reactiveElementPolyfillSupport,$=(t,e)=>t,w={toAttribute(t,e){switch(e){case Boolean:t=t?v:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!h(t,e),A={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:x};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;class M extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=A){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&p(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=u(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const o=s?.call(this);r?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??A}static _$Ei(){if(this.hasOwnProperty($("elementProperties")))return;const t=y(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty($("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty($("properties"))){const t=this.properties,e=[...m(t),...g(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(d(t))}else void 0!==t&&e.push(d(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return c(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:w;this._$Em=s;const o=r.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const o=this.constructor;if(!1===s&&(r=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??x)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==r||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}}M.elementStyles=[],M.shadowRootOptions={mode:"open"},M[$("elementProperties")]=new Map,M[$("finalized")]=new Map,b?.({ReactiveElement:M}),(f.reactiveElementVersions??=[]).push("2.1.2")},752(t,e,i){i.d(e,{XX:()=>R,c0:()=>M,qy:()=>A,s6:()=>E});const s=globalThis,r=t=>t,o=s.trustedTypes,n=o?o.createPolicy("lit-html",{createHTML:t=>t}):void 0,a="$lit$",l=`lit$${Math.random().toFixed(9).slice(2)}$`,c="?"+l,d=`<${c}>`,h=document,p=()=>h.createComment(""),u=t=>null===t||"object"!=typeof t&&"function"!=typeof t,m=Array.isArray,g="[ \t\n\f\r]",y=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,f=/-->/g,_=/>/g,v=RegExp(`>|${g}(?:([^\\s"'>=/]+)(${g}*=${g}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),b=/'/g,$=/"/g,w=/^(?:script|style|textarea|title)$/i,x=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),A=x(1),M=(x(2),x(3),Symbol.for("lit-noChange")),E=Symbol.for("lit-nothing"),S=new WeakMap,C=h.createTreeWalker(h,129);function N(t,e){if(!m(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==n?n.createHTML(e):e}const D=(t,e)=>{const i=t.length-1,s=[];let r,o=2===e?"<svg>":3===e?"<math>":"",n=y;for(let e=0;e<i;e++){const i=t[e];let c,h,p=-1,u=0;for(;u<i.length&&(n.lastIndex=u,h=n.exec(i),null!==h);)u=n.lastIndex,n===y?"!--"===h[1]?n=f:void 0!==h[1]?n=_:void 0!==h[2]?(w.test(h[2])&&(r=RegExp("</"+h[2],"g")),n=v):void 0!==h[3]&&(n=v):n===v?">"===h[0]?(n=r??y,p=-1):void 0===h[1]?p=-2:(p=n.lastIndex-h[2].length,c=h[1],n=void 0===h[3]?v:'"'===h[3]?$:b):n===$||n===b?n=v:n===f||n===_?n=y:(n=v,r=void 0);const m=n===v&&t[e+1].startsWith("/>")?" ":"";o+=n===y?i+d:p>=0?(s.push(c),i.slice(0,p)+a+i.slice(p)+l+m):i+l+(-2===p?e:m)}return[N(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class I{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,n=0;const d=t.length-1,h=this.parts,[u,m]=D(t,e);if(this.el=I.createElement(u,i),C.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=C.nextNode())&&h.length<d;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(a)){const e=m[n++],i=s.getAttribute(t).split(l),o=/([.?@])?(.*)/.exec(e);h.push({type:1,index:r,name:o[2],strings:i,ctor:"."===o[1]?O:"?"===o[1]?k:"@"===o[1]?P:T}),s.removeAttribute(t)}else t.startsWith(l)&&(h.push({type:6,index:r}),s.removeAttribute(t));if(w.test(s.tagName)){const t=s.textContent.split(l),e=t.length-1;if(e>0){s.textContent=o?o.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],p()),C.nextNode(),h.push({type:2,index:++r});s.append(t[e],p())}}}else if(8===s.nodeType)if(s.data===c)h.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(l,t+1));)h.push({type:7,index:r}),t+=l.length-1}r++}}static createElement(t,e){const i=h.createElement("template");return i.innerHTML=t,i}}function L(t,e,i=t,s){if(e===M)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const o=u(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=L(t,r._$AS(t,e.values),r,s)),e}class j{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??h).importNode(e,!0);C.currentNode=s;let r=C.nextNode(),o=0,n=0,a=i[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new U(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new z(r,this,t)),this._$AV.push(e),a=i[++n]}o!==a?.index&&(r=C.nextNode(),o++)}return C.currentNode=h,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class U{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=L(this,t,e),u(t)?t===E||null==t||""===t?(this._$AH!==E&&this._$AR(),this._$AH=E):t!==this._$AH&&t!==M&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>m(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==E&&u(this._$AH)?this._$AA.nextSibling.data=t:this.T(h.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=I.createElement(N(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new j(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=S.get(t.strings);return void 0===e&&S.set(t.strings,e=new I(t)),e}k(t){m(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new U(this.O(p()),this.O(p()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=r(t).nextSibling;r(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class T{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=E,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=E}_$AI(t,e=this,i,s){const r=this.strings;let o=!1;if(void 0===r)t=L(this,t,e,0),o=!u(t)||t!==this._$AH&&t!==M,o&&(this._$AH=t);else{const s=t;let n,a;for(t=r[0],n=0;n<r.length-1;n++)a=L(this,s[i+n],e,n),a===M&&(a=this._$AH[n]),o||=!u(a)||a!==this._$AH[n],a===E?t=E:t!==E&&(t+=(a??"")+r[n+1]),this._$AH[n]=a}o&&!s&&this.j(t)}j(t){t===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class O extends T{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===E?void 0:t}}class k extends T{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==E)}}class P extends T{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=L(this,t,e,0)??E)===M)return;const i=this._$AH,s=t===E&&i!==E||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==E&&(i===E||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class z{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){L(this,t)}}const H=s.litHtmlPolyfillSupport;H?.(I,U),(s.litHtmlVersions??=[]).push("3.3.3");const R=(t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new U(e.insertBefore(p(),t),t,void 0,i??{})}return r._$AI(t),r}},791(t,e,i){i.d(e,{customElement:()=>s,property:()=>a});const s=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};var r=i(842);const o={attribute:!0,type:String,converter:r.W3,reflect:!1,hasChanged:r.Ec},n=(t=o,e,i)=>{const{kind:s,metadata:r}=i;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,r,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];e.call(this,i),this.requestUpdate(s,r,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function a(t){return(e,i)=>"object"==typeof i?n(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}},534(t,e,i){i.d(e,{unsafeHTML:()=>n});var s=i(752);class r{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}class o extends r{constructor(t){if(super(t),this.it=s.s6,2!==t.type)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===s.s6||null==t)return this._t=void 0,this.it=t;if(t===s.c0)return t;if("string"!=typeof t)throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const e=[t];return e.raw=e,this._t={_$litType$:this.constructor.resultType,strings:e,values:[]}}}o.directiveName="unsafeHTML",o.resultType=1;const n=(a=o,(...t)=>({_$litDirective$:a,values:t}));var a},618(t,e,i){i.d(e,{LitElement:()=>n,css:()=>s.AH,html:()=>r.qy});var s=i(842),r=i(752);const o=globalThis;class n extends s.mN{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=(0,r.XX)(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return r.c0}}n._$litElement$=!0,n.finalized=!0,o.litElementHydrateSupport?.({LitElement:n});const a=o.litElementPolyfillSupport;a?.({LitElement:n}),(o.litElementVersions??=[]).push("4.2.2")},330(t){t.exports=JSON.parse('{"version":"2026.6.0"}')}},e={};function i(s){var r=e[s];if(void 0!==r)return r.exports;var o=e[s]={exports:{}};return t[s].call(o.exports,o,o.exports,i),o.exports}i.d=(t,e)=>{for(var s in e)i.o(e,s)&&!i.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:e[s]})},i.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),i(248)})();