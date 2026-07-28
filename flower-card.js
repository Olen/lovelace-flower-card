/*! For license information please see flower-card.js.LICENSE.txt */
(()=>{"use strict";const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;class o{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const e=void 0!==i&&1===i.length;e&&(t=s.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&s.set(i,t))}return t}toString(){return this.cssText}}const r=(i,s)=>{if(e)i.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of s){const s=document.createElement("style"),o=t.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=e.cssText,i.appendChild(s)}},n=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:a,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:d,getOwnPropertySymbols:h,getPrototypeOf:p}=Object,u=globalThis,m=u.trustedTypes,g=m?m.emptyScript:"",f=u.reactiveElementPolyfillSupport,y=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},_=(t,e)=>!a(t,e),b={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:_};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;class $ extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&l(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const r=s?.call(this);o?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...h(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(n(t))}else void 0!==t&&e.push(n(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return r(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=s;const r=o.fromAttribute(e,t.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,i,s=!1,o){if(void 0!==t){const r=this.constructor;if(!1===s&&(o=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??_)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==o||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}}$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[y("elementProperties")]=new Map,$[y("finalized")]=new Map,f?.({ReactiveElement:$}),(u.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,x=t=>t,A=w.trustedTypes,M=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,D="?"+S,C=`<${D}>`,N=document,I=()=>N.createComment(""),L=t=>null===t||"object"!=typeof t&&"function"!=typeof t,O=Array.isArray,j="[ \t\n\f\r]",U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,k=/-->/g,T=/>/g,P=RegExp(`>|${j}(?:([^\\s"'>=/]+)(${j}*=${j}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),z=/'/g,H=/"/g,R=/^(?:script|style|textarea|title)$/i,W=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),B=W(1),Q=(W(2),W(3),Symbol.for("lit-noChange")),F=Symbol.for("lit-nothing"),V=new WeakMap,Z=N.createTreeWalker(N,129);function Y(t,e){if(!O(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==M?M.createHTML(e):e}const q=(t,e)=>{const i=t.length-1,s=[];let o,r=2===e?"<svg>":3===e?"<math>":"",n=U;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,d=0;for(;d<i.length&&(n.lastIndex=d,l=n.exec(i),null!==l);)d=n.lastIndex,n===U?"!--"===l[1]?n=k:void 0!==l[1]?n=T:void 0!==l[2]?(R.test(l[2])&&(o=RegExp("</"+l[2],"g")),n=P):void 0!==l[3]&&(n=P):n===P?">"===l[0]?(n=o??U,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?P:'"'===l[3]?H:z):n===H||n===z?n=P:n===k||n===T?n=U:(n=P,o=void 0);const h=n===P&&t[e+1].startsWith("/>")?" ":"";r+=n===U?i+C:c>=0?(s.push(a),i.slice(0,c)+E+i.slice(c)+S+h):i+S+(-2===c?e:h)}return[Y(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class X{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,r=0;const n=t.length-1,a=this.parts,[l,c]=q(t,e);if(this.el=X.createElement(l,i),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=Z.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(E)){const e=c[r++],i=s.getAttribute(t).split(S),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:o,name:n[2],strings:i,ctor:"."===n[1]?et:"?"===n[1]?it:"@"===n[1]?st:tt}),s.removeAttribute(t)}else t.startsWith(S)&&(a.push({type:6,index:o}),s.removeAttribute(t));if(R.test(s.tagName)){const t=s.textContent.split(S),e=t.length-1;if(e>0){s.textContent=A?A.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],I()),Z.nextNode(),a.push({type:2,index:++o});s.append(t[e],I())}}}else if(8===s.nodeType)if(s.data===D)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(S,t+1));)a.push({type:7,index:o}),t+=S.length-1}o++}}static createElement(t,e){const i=N.createElement("template");return i.innerHTML=t,i}}function J(t,e,i=t,s){if(e===Q)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const r=L(e)?void 0:e._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),void 0===r?o=void 0:(o=new r(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=J(t,o._$AS(t,e.values),o,s)),e}class G{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??N).importNode(e,!0);Z.currentNode=s;let o=Z.nextNode(),r=0,n=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new K(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new ot(o,this,t)),this._$AV.push(e),a=i[++n]}r!==a?.index&&(o=Z.nextNode(),r++)}return Z.currentNode=N,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class K{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=F,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),L(t)?t===F||null==t||""===t?(this._$AH!==F&&this._$AR(),this._$AH=F):t!==this._$AH&&t!==Q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>O(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==F&&L(this._$AH)?this._$AA.nextSibling.data=t:this.T(N.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=X.createElement(Y(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new G(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=V.get(t.strings);return void 0===e&&V.set(t.strings,e=new X(t)),e}k(t){O(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new K(this.O(I()),this.O(I()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=x(t).nextSibling;x(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=F,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=F}_$AI(t,e=this,i,s){const o=this.strings;let r=!1;if(void 0===o)t=J(this,t,e,0),r=!L(t)||t!==this._$AH&&t!==Q,r&&(this._$AH=t);else{const s=t;let n,a;for(t=o[0],n=0;n<o.length-1;n++)a=J(this,s[i+n],e,n),a===Q&&(a=this._$AH[n]),r||=!L(a)||a!==this._$AH[n],a===F?t=F:t!==F&&(t+=(a??"")+o[n+1]),this._$AH[n]=a}r&&!s&&this.j(t)}j(t){t===F?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===F?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==F)}}class st extends tt{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=J(this,t,e,0)??F)===Q)return;const i=this._$AH,s=t===F&&i!==F||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==F&&(i===F||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const rt=w.litHtmlPolyfillSupport;rt?.(X,K),(w.litHtmlVersions??=[]).push("3.3.3");const nt=globalThis;class at extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new K(e.insertBefore(I(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Q}}at._$litElement$=!0,at.finalized=!0,nt.litElementHydrateSupport?.({LitElement:at});const lt=nt.litElementPolyfillSupport;lt?.({LitElement:at}),(nt.litElementVersions??=[]).push("4.2.2");const ct={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:_},dt=(t=ct,e,i)=>{const{kind:s,metadata:o}=i;let r=globalThis.litPropertyMetadata.get(o);if(void 0===r&&globalThis.litPropertyMetadata.set(o,r=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,o,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];e.call(this,i),this.requestUpdate(s,o,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function ht(t){return(e,i)=>"object"==typeof i?dt(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function pt(t){return ht({...t,state:!0,attribute:!1})}const ut=((t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new o(s,t,i)})`
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
  display: block;
}
.header-compact > #name {
  font-weight: bold;
  width: 100%;
  margin-top: 8px;
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
.attribute.tooltip.width-100.has-units .meter.green {
  max-width: 70%;
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
.care-info--dialog {
  padding: 4px 4px 8px;
}
.care-info-empty {
  padding: 8px 4px;
  color: var(--secondary-text-color);
}
.has-lightbox {
  cursor: pointer;
}
.image-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.image-dialog img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}
.image-dialog-caption {
  margin-top: 8px;
  text-align: center;
  color: var(--primary-text-color);
  font-weight: 500;
}
`;var mt;!function(t){t.Full="full",t.Compact="compact"}(mt||(mt={}));class gt{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}class ft extends gt{constructor(t){if(super(t),this.it=F,2!==t.type)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===F||null==t)return this._t=void 0,this.it=t;if(t===Q)return t;if("string"!=typeof t)throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const e=[t];return e.raw=e,this._t={_$litType$:this.constructor.resultType,strings:e,values:[]}}}ft.directiveName="unsafeHTML",ft.resultType=1;const yt=(t=>(...e)=>({_$litDirective$:t,values:e}))(ft),vt="flower-card",_t=["moisture","conductivity","temperature","illuminance","humidity","dli"],bt=[{label:"Moisture",value:"moisture"},{label:"Conductivity",value:"conductivity"},{label:"Temperature",value:"temperature"},{label:"Illuminance",value:"illuminance"},{label:"Humidity",value:"humidity"},{label:"Daily Light Integral",value:"dli"},{label:"DLI (24h rolling)",value:"dli_24h"},{label:"CO2",value:"co2"},{label:"Soil Temperature",value:"soil_temperature"},{label:"VPD",value:"vpd"}],$t=[{label:"Watering",value:"care_watering"},{label:"Sunlight",value:"care_sunlight"},{label:"Soil",value:"care_soil"},{label:"Pruning",value:"care_pruning"},{label:"Fertilization",value:"care_fertilization"}],wt={care_watering:"mdi:watering-can-outline",care_sunlight:"mdi:white-balance-sunny",care_soil:"mdi:shovel",care_pruning:"mdi:content-cut",care_fertilization:"mdi:bottle-tonic-outline"};var xt,At;!function(t){t.language="language",t.system="system",t.comma_decimal="comma_decimal",t.decimal_comma="decimal_comma",t.space_comma="space_comma",t.none="none"}(xt||(xt={})),function(t){t.language="language",t.system="system",t.am_pm="12",t.twenty_four="24"}(At||(At={})),new Set(["fan","input_boolean","light","switch","group","automation"]);new Set(["call-service","divider","section","weblink","cast","select"]);const Mt=(t,e)=>{((t,e,i,s)=>{s=s||{},i=i??{};const o=new Event(e,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});o.detail=i,t.dispatchEvent(o)})(t,"hass-more-info",{entityId:e},{bubbles:!1,composed:!0})},Et=t=>{var e;return null!==(e=null==t?void 0:t.startsWith("media-source://"))&&void 0!==e&&e},St=(t,e)=>t&&e&&0!==e.length?$t.filter(t=>e.includes(t.value)).map(e=>({key:e.value,label:e.label,icon:wt[e.value],text:t[e.value]})).filter(t=>"string"==typeof t.text&&""!==t.text.trim()):[],Dt=t=>B`
    ${t.map(t=>B`
        <div class="care-item">
            <div class="care-heading">
                <ha-icon .icon="${t.icon}"></ha-icon>
                <span>${t.label}</span>
            </div>
            <div class="care-text">${t.text}</div>
        </div>
    `)}
`,Ct="Care",Nt=t=>{var e;return null!==(e=t.fields)&&void 0!==e?e:$t.map(t=>t.value)},It=t=>{var e;const i=null===(e=t.config)||void 0===e?void 0:e.extra_badges;return i&&0!==i.length?i.map(e=>((t,e)=>{var i;if((t=>"care_info"===t.type)(e))return((t,e)=>{const{icon:i,color:s,tip:o}=(t=>{var e,i,s;return{icon:null!==(e=t.icon)&&void 0!==e?e:"mdi:sprout",color:null!==(i=t.color)&&void 0!==i?i:"var(--secondary-text-color)",tip:null!==(s=t.title)&&void 0!==s?s:Ct}})(e);return B`
        <div class="extra-badge tooltip" @click="${i=>{i.stopPropagation(),t.openCareDialog(e)}}">
            <div class="tip" style="text-align:center;">${o}</div>
            <ha-icon .icon="${i}" style="color: ${s}"></ha-icon>
        </div>
    `})(t,e);if(e.text){const t="none"===(null===(i=e.icon)||void 0===i?void 0:i.toLowerCase()),s=e.color||"var(--secondary-text-color)";if(t&&e.show_state)return B`
                <div class="extra-badge tooltip">
                    <div class="tip" style="text-align:center;">${e.text}</div>
                    <span class="badge-text" style="color: ${s}">${e.text}</span>
                </div>
            `;const o=t?"":e.icon||"mdi:information";return B`
            <div class="extra-badge tooltip">
                <div class="tip" style="text-align:center;">${e.text}</div>
                ${t?"":B`<ha-icon .icon="${o}" style="color: ${s}"></ha-icon>`}
                ${e.show_state?B`<span class="badge-text">${e.text}</span>`:""}
            </div>
        `}if(!e.entity&&e.icon){const t=e.color||"var(--secondary-text-color)";return B`
            <div class="extra-badge">
                <ha-icon .icon="${e.icon}" style="color: ${t}"></ha-icon>
            </div>
        `}if(!e.entity)return B``;const s=e.entity,o=t._hass.states[s];if(!o)return B``;const r=s.startsWith("binary_sensor."),n=o.state,a=o.attributes.friendly_name||e.entity;let l,c,d,h=e.icon||o.attributes.icon;if(!h)if(r){const t=o.attributes.device_class,e="on"===n,i={battery:["mdi:battery","mdi:battery-outline"],battery_charging:["mdi:battery-charging","mdi:battery"],cold:["mdi:snowflake","mdi:snowflake-off"],connectivity:["mdi:check-network-outline","mdi:close-network-outline"],door:["mdi:door-open","mdi:door-closed"],garage_door:["mdi:garage-open","mdi:garage"],gas:["mdi:alert-circle","mdi:check-circle"],heat:["mdi:fire","mdi:fire-off"],light:["mdi:brightness-7","mdi:brightness-5"],lock:["mdi:lock-open","mdi:lock"],moisture:["mdi:water","mdi:water-off"],motion:["mdi:motion-sensor","mdi:motion-sensor-off"],moving:["mdi:motion","mdi:motion-off"],occupancy:["mdi:home","mdi:home-outline"],opening:["mdi:square-outline","mdi:square"],plug:["mdi:power-plug","mdi:power-plug-off"],power:["mdi:power","mdi:power-off"],presence:["mdi:home","mdi:home-outline"],problem:["mdi:alert-circle","mdi:check-circle"],running:["mdi:play","mdi:stop"],safety:["mdi:alert-circle","mdi:check-circle"],smoke:["mdi:smoke-detector-alert","mdi:smoke-detector"],sound:["mdi:music-note","mdi:music-note-off"],tamper:["mdi:alert-circle","mdi:check-circle"],update:["mdi:package-up","mdi:package"],vibration:["mdi:vibrate","mdi:vibrate-off"],window:["mdi:window-open","mdi:window-closed"]};h=t&&i[t]?e?i[t][0]:i[t][1]:e?"mdi:checkbox-marked-circle":"mdi:checkbox-blank-circle-outline"}else h="mdi:information";if(l=r&&!e.attribute?"on"===n?e.color_on||"var(--primary-color)":e.color_off||"var(--disabled-text-color)":e.color||"var(--secondary-text-color)",e.attribute){const i=o.attributes[e.attribute];if(d=e.attribute,null==i)c="N/A";else if("last_changed"===e.attribute||"last_updated"===e.attribute){const t="last_changed"===e.attribute?o.last_changed:o.last_updated;c=t?new Date(t).toLocaleString():String(i)}else c=t._hass.formatEntityAttributeValue?t._hass.formatEntityAttributeValue(o,e.attribute):String(i)}else d=a,c=r?n:t._hass.formatEntityState(o);return B`
        <div class="extra-badge tooltip" @click="${e=>{e.stopPropagation(),Mt(t,s)}}">
            <div class="tip" style="text-align:center;">${`${d}: ${c}`}</div>
            <ha-icon .icon="${h}" style="color: ${l}"></ha-icon>
            ${e.show_state?B`<span class="badge-text">${c}</span>`:""}
        </div>
    `})(t,e)):B``};var Lt=function(t,e,i,s){var o,r=arguments.length,n=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(n=(r<3?o(n):r>3?o(e,i,n):o(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n},Ot=function(t,e,i,s){return new(i||(i=Promise))(function(o,r){function n(t){try{l(s.next(t))}catch(t){r(t)}}function a(t){try{l(s.throw(t))}catch(t){r(t)}}function l(t){var e;t.done?o(t.value):(e=t.value,e instanceof i?e:new i(function(t){t(e)})).then(n,a)}l((s=s.apply(t,e||[])).next())})};console.info("%c FLOWER-CARD %c 2026.7.0","color: cyan; background: black; font-weight: bold;","color: darkblue; background: white; font-weight: bold;"),window.customCards=window.customCards||[],window.customCards.push({type:vt,name:"Flower card",preview:!0,description:"Custom flower card for https://github.com/Olen/homeassistant-plant",getEntitySuggestion:(t,e)=>"plant"!==e.split(".")[0]?null:[{label:"Full",config:{type:`custom:${vt}`,entity:e}},{label:"Compact",config:{type:`custom:${vt}`,entity:e,display_type:mt.Compact}}]});let jt=class extends at{constructor(){super(...arguments),this._careDialogOpen=!1,this._careDialogFields=[],this._careDialogTitle="Care",this._imageDialogOpen=!1,this.previousFetchDate=0,this.plantinfo={result:{}}}set hass(t){var e,i;this._hass=t,this.stateObj=(null===(e=this.config)||void 0===e?void 0:e.entity)?t.states[this.config.entity]:void 0;const s=null===(i=this.stateObj)||void 0===i?void 0:i.attributes.entity_picture;s!==this._lastEntityPicture&&(this._lastEntityPicture=s,this._resolveEntityPicture(t,s)),Date.now()>this.previousFetchDate+1e3&&(this.previousFetchDate=Date.now(),this.get_data(t).then(()=>{this.requestUpdate()}))}_resolveEntityPicture(t,e){return Ot(this,void 0,void 0,function*(){e?Et(e)?(this._resolvedImageUrl=yield((t,e)=>function(t,e,i,s){return new(i||(i=Promise))(function(o,r){function n(t){try{l(s.next(t))}catch(t){r(t)}}function a(t){try{l(s.throw(t))}catch(t){r(t)}}function l(t){var e;t.done?o(t.value):(e=t.value,e instanceof i?e:new i(function(t){t(e)})).then(n,a)}l((s=s.apply(t,e||[])).next())})}(void 0,void 0,void 0,function*(){if(!Et(e))return e;try{return(yield t.callWS({type:"media_source/resolve_media",media_content_id:e})).url}catch(t){return console.error("Failed to resolve media source:",t),""}}))(t,e),this.requestUpdate()):this._resolvedImageUrl=e:this._resolvedImageUrl=void 0})}static getConfigForm(){return{schema:[{name:"entity",required:!0,selector:{entity:{domain:"plant"}}},{name:"name",selector:{text:{}}},{name:"battery_sensor",selector:{entity:{domain:"sensor",device_class:"battery"}}},{type:"expandable",name:"",title:"Bars",schema:[{name:"show_bars",selector:{select:{multiple:!0,options:bt}}}]},{type:"expandable",name:"",title:"Care Info",schema:[{name:"show_care",selector:{select:{multiple:!0,options:$t}}}]},{type:"expandable",name:"",title:"Appearance",schema:[{name:"display_type",selector:{select:{options:[{value:"full",label:"Full"},{value:"compact",label:"Compact"}]}}},{name:"hide_species",selector:{boolean:{}}},{name:"hide_image",selector:{boolean:{}}},{name:"hide_units",selector:{boolean:{}}}]}],computeLabel:t=>({entity:"Entity",name:"Display Name",display_type:"Display Type",battery_sensor:"Battery Sensor",show_bars:"Show Bars",show_care:"Show Care Info",hide_species:"Hide Species",hide_image:"Hide Image",hide_units:"Hide Units"}[t.name]||t.name)}}static getStubConfig(t){const e=t=>"object"==typeof t&&null!==t&&"entity_id"in t&&"string"==typeof t.entity_id&&t.entity_id.startsWith("plant.");let i=[];try{i=Object.values(t.states).filter(e)}catch(t){console.info(`Unable to get ha-data: ${t}`)}return{entity:i.length>0?i[0].entity_id:"plant.my_plant",battery_sensor:"sensor.myflower_battery",show_bars:_t}}setConfig(t){if(!t.entity)throw new Error("You need to define an entity");this.config=t}openCareDialog(t){const{open:e,fields:i,title:s}=(t=>{var e;return{open:!0,fields:Nt(t),title:null!==(e=t.title)&&void 0!==e?e:Ct}})(t);this._careDialogFields=i,this._careDialogTitle=s,this._careDialogOpen=e}_closeCareDialog(){this._careDialogOpen=!1}renderCareDialog(){var t,e,i;const s=null===(t=this.config)||void 0===t?void 0:t.entity,o=s?null===(i=null===(e=this._hass)||void 0===e?void 0:e.states[s])||void 0===i?void 0:i.attributes:void 0,r=St(o,this._careDialogFields);return B`
            <ha-dialog open heading="${this._careDialogTitle}" @closed="${()=>this._closeCareDialog()}">
                ${r.length>0?B`<div class="care-info care-info--dialog">${Dt(r)}</div>`:B`<div class="care-info-empty">No care information available.</div>`}
            </ha-dialog>
        `}openImageDialog(){this._imageDialogOpen=!0}_closeImageDialog(){this._imageDialogOpen=!1}renderImageDialog(){var t,e;const i=(null===(t=this.config)||void 0===t?void 0:t.name)||(null===(e=this.stateObj)||void 0===e?void 0:e.attributes.friendly_name)||"";return B`
            <ha-dialog open @closed="${()=>this._closeImageDialog()}">
                <div class="image-dialog">
                    <img src="${this._resolvedImageUrl}" alt="${i}">
                    ${i?B`<div class="image-dialog-caption">${i}</div>`:""}
                </div>
            </ha-dialog>
        `}render(){var t,e;if(!this.config||!this._hass)return B``;if(!this.stateObj)return this._careDialogOpen=!1,this._imageDialogOpen=!1,B`
                <hui-warning>
                Entity not available: ${this.config.entity}
                </hui-warning>
              `;const i=this.stateObj,s=i.attributes.species,o=this.config.name||i.attributes.friendly_name,r=null!==(t=this.config.hide_species)&&void 0!==t&&t,n=null!==(e=this.config.hide_image)&&void 0!==e&&e,a=((t,e)=>!t&&!!e)(n,this._resolvedImageUrl),l=this.config.display_type===mt.Compact?"header-compact":"header",c=this.config.display_type===mt.Compact||n?"":"card-margin-top";return B`
            <ha-card class="${c}">
            <div class="${l}${n?" no-image":""}" @click="${()=>Mt(this,i.entity_id)}">
                ${n?"":B`<img
                    src="${this._resolvedImageUrl||"data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiIGZvY3VzYWJsZT0iZmFsc2UiIHJvbGU9ImltZyIgYXJpYS1oaWRkZW49InRydWUiIHZpZXdCb3g9IjAgMCAyNCAyNCI+CiAgICAgIDxnPgogICAgICA8IS0tP2xpdCQ0MTM0MjMxNjkkLS0+PHBhdGggZD0iTTMsMTNBOSw5IDAgMCwwIDEyLDIyQzEyLDE3IDcuOTcsMTMgMywxM00xMiw1LjVBMi41LDIuNSAwIDAsMSAxNC41LDhBMi41LDIuNSAwIDAsMSAxMiwxMC41QTIuNSwyLjUgMCAwLDEgOS41LDhBMi41LDIuNSAwIDAsMSAxMiw1LjVNNS42LDEwLjI1QTIuNSwyLjUgMCAwLDAgOC4xLDEyLjc1QzguNjMsMTIuNzUgOS4xMiwxMi41OCA5LjUsMTIuMzFDOS41LDEyLjM3IDkuNSwxMi40MyA5LjUsMTIuNUEyLjUsMi41IDAgMCwwIDEyLDE1QTIuNSwyLjUgMCAwLDAgMTQuNSwxMi41QzE0LjUsMTIuNDMgMTQuNSwxMi4zNyAxNC41LDEyLjMxQzE0Ljg4LDEyLjU4IDE1LjM3LDEyLjc1IDE1LjksMTIuNzVDMTcuMjgsMTIuNzUgMTguNCwxMS42MyAxOC40LDEwLjI1QzE4LjQsOS4yNSAxNy44MSw4LjQgMTYuOTcsOEMxNy44MSw3LjYgMTguNCw2Ljc0IDE4LjQsNS43NUMxOC40LDQuMzcgMTcuMjgsMy4yNSAxNS45LDMuMjVDMTUuMzcsMy4yNSAxNC44OCwzLjQxIDE0LjUsMy42OUMxNC41LDMuNjMgMTQuNSwzLjU2IDE0LjUsMy41QTIuNSwyLjUgMCAwLDAgMTIsMUEyLjUsMi41IDAgMCwwIDkuNSwzLjVDOS41LDMuNTYgOS41LDMuNjMgOS41LDMuNjlDOS4xMiwzLjQxIDguNjMsMy4yNSA4LjEsMy4yNUEyLjUsMi41IDAgMCwwIDUuNiw1Ljc1QzUuNiw2Ljc0IDYuMTksNy42IDcuMDMsOEM2LjE5LDguNCA1LjYsOS4yNSA1LjYsMTAuMjVNMTIsMjJBOSw5IDAgMCwwIDIxLDEzQzE2LDEzIDEyLDE3IDEyLDIyWiI+PC9wYXRoPgogICAgICA8L2c+Cjwvc3ZnPgo="}"
                    class="${a?"has-lightbox":""}"
                    @click="${t=>{a&&(t.stopPropagation(),this.openImageDialog())}}">`}
                <span id="name"> ${o} <ha-icon .icon="mdi:${"problem"==i.state.toLowerCase()?"alert-circle-outline":""}"></ha-icon>
                </span>
                <span id="battery">${It(this)}${(t=>{var e,i;const s=t.config;if(!(null==s?void 0:s.battery_sensor))return B``;const o=s.battery_sensor,r=t._hass.states[o];if(!r)return B``;const n=parseInt(r.state),a=null!==(e=s.battery_warn_level)&&void 0!==e?e:20,l=null!==(i=s.battery_ok_level)&&void 0!==i?i:40,c=([{threshold:90,icon:"mdi:battery"},{threshold:80,icon:"mdi:battery-90"},{threshold:70,icon:"mdi:battery-80"},{threshold:60,icon:"mdi:battery-70"},{threshold:50,icon:"mdi:battery-60"},{threshold:40,icon:"mdi:battery-50"},{threshold:30,icon:"mdi:battery-40"},{threshold:20,icon:"mdi:battery-30"},{threshold:10,icon:"mdi:battery-20"},{threshold:0,icon:"mdi:battery-10"},{threshold:-1/0,icon:"mdi:battery-alert-variant-outline"}].find(({threshold:t})=>n>t)||{threshold:-1/0,icon:"mdi:battery-alert-variant-outline"}).icon,d=(h=n)>=l?"green":h>=a?"orange":"red";var h;return B`
        <div class="battery tooltip" @click="${e=>{e.stopPropagation(),Mt(t,o)}}">
            <div class="tip" style="text-align:center;">${n}%</div>
            <ha-icon .icon="${c}" style="color: ${d}"></ha-icon>
        </div>
    `})(this)}</span>
                ${r?"":B`<span id="species">${s}</span>`}
            </div>
            <div class="divider"></div>
            ${(t=>{var e,i;const s={},o=(null===(e=t.config)||void 0===e?void 0:e.show_bars)||_t;if(t.plantinfo&&t.plantinfo.result){const e=t.plantinfo.result;for(const r of o)if(e[r])try{const{max:o,min:n,current:a,icon:l,sensor:c}=e[r],d=t._hass.states[c];if(!d)continue;const h=t._hass.formatEntityState(d).replace(/[^\d,.+-]/g,""),p=(null===(i=null==d?void 0:d.attributes)||void 0===i?void 0:i.unit_of_measurement)||e[r].unit_of_measurement||"",u={max:Number(o),min:Number(n)};s[r]={name:r,current:Number(a),limits:u,icon:String(l),sensor:String(c),unit_of_measurement:String(p),display_state:h}}catch(t){console.warn(`Flower card: Error processing ${r}:`,t)}}return((t,e)=>{var i,s,o;const r=(null===(i=t.config)||void 0===i?void 0:i.display_type)===mt.Compact,n=null!==(o=null===(s=t.config)||void 0===s?void 0:s.bars_per_row)&&void 0!==o?o:r?1:2,a=1===n,l=((t,e)=>Object.values(t).reduce((t,i,s)=>{const o=Math.floor(s/e);return t[o]||(t[o]=[]),t[o].push(i),t},[]))(e,n),c="attributes "+(a?"width-100":"");return l.map(e=>B`<div class="${c}">${e.map(e=>e?B`${((t,e)=>{var i,s,o,r,n,a;const{max:l,min:c}=e.limits,d=e.unit_of_measurement,h="lx"===e.unit_of_measurement,p=e.icon||"mdi:help-circle-outline",u=null!==(i=e.current)&&void 0!==i?i:0,m=!isNaN(u)&&null!=u,g=e.display_state,f=!h||u<=0||c<=0?100*Math.max(0,Math.min(1,(u-c)/(l-c))):100*Math.max(0,Math.min(1,(Math.log(u)-Math.log(c))/(Math.log(l)-Math.log(c)))),y=m?`${e.name}: ${u} ${d}<br>(${c} ~ ${l} ${d})`:t._hass.localize("state.default.unavailable"),v="dli"===e.name||"dli_24h"===e.name?'<math style="display: inline-grid;" xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mfrac><mrow><mn>mol</mn></mrow><mrow><mn>d</mn><mn>⋅</mn><msup><mn>m</mn><mn>2</mn></msup></mrow></mfrac></mrow></math>':d,_=(null===(s=t.config)||void 0===s?void 0:s.display_type)===mt.Compact,b=null!==(r=null===(o=t.config)||void 0===o?void 0:o.bars_per_row)&&void 0!==r?r:_?1:2,$=!(null!==(a=null===(n=t.config)||void 0===n?void 0:n.hide_units)&&void 0!==a?a:_),w=1===b;return B`
        <div class="${`attribute tooltip ${w?"width-100":""}${w&&$?" has-units":""}`}" @click="${()=>Mt(t,e.sensor)}">
            <div class="tip" style="text-align:center;">${yt(y)}</div>
            <ha-icon .icon="${p}"></ha-icon>
            <div class="meter red">
                <span class="${m?u<c||u>l?"bad":"good":"unavailable"}" style="width: 100%;"></span>
            </div>
            <div class="meter green">
                <span class="${m?u>l?"bad":"good":"unavailable"}" style="width:${m?f:"0"}%;"></span>
            </div>
            <div class="meter red">
                <span class="bad" style="width:${m?u>l?100:0:"0"}%;"></span>
            </div>
            ${$?B`<div class="header"><span class="value">${g}</span>&nbsp;<span class='unit'>${yt(v)}</span></div>`:""}
        </div>
    `})(t,e)}`:"")}</div>`).flat()})(t,s)})(this)}
            ${(t=>{var e;const i=t.config;if(!i)return B``;const s=i.entity,o=s?null===(e=t._hass.states[s])||void 0===e?void 0:e.attributes:void 0,r=St(o,i.show_care);return 0===r.length?B``:B`
        <div class="care-info">
            ${Dt(r)}
        </div>
    `})(this)}
            </ha-card>
            ${this._careDialogOpen?this.renderCareDialog():B``}
            ${this._imageDialogOpen?this.renderImageDialog():B``}
            `}get_data(t){return Ot(this,void 0,void 0,function*(){var e,i;try{this.plantinfo=yield t.callWS({type:"plant/get_info",entity_id:null===(e=this.config)||void 0===e?void 0:e.entity})}catch(t){console.warn(`Flower card: Failed to fetch data for ${null===(i=this.config)||void 0===i?void 0:i.entity}:`,t),this.plantinfo&&this.plantinfo.result&&0!==Object.keys(this.plantinfo.result).length||(this.plantinfo={result:{}})}})}getCardSize(){return 5}static get styles(){return ut}};Lt([ht()],jt.prototype,"_hass",void 0),Lt([ht()],jt.prototype,"config",void 0),Lt([pt()],jt.prototype,"_careDialogOpen",void 0),Lt([pt()],jt.prototype,"_careDialogFields",void 0),Lt([pt()],jt.prototype,"_careDialogTitle",void 0),Lt([pt()],jt.prototype,"_imageDialogOpen",void 0),jt=Lt([(t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)})(vt)],jt)})();