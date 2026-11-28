import { HTMLTemplateResult, TemplateResult, html, nothing } from 'lit';
import { CardName, DisplayType } from '../types/flower-card-types';
import { missingImage } from './constants';
import { entityDisplayName } from './utils';

export interface HeaderParams {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hass: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stateObj: any;
    displayType: string | undefined;
    hideImage: boolean;
    hideSpecies: boolean;
    name?: CardName;
    imageUrl: string | undefined;
    badges: TemplateResult | typeof nothing;
    imageLightbox: boolean;
    onImageClick?: () => void;
    onClick: () => void;
}

/** The lightbox: the plant's picture enlarged, captioned with its name. */
export function renderImageDialog(imageUrl: string | undefined, displayName: string, onClosed: () => void): HTMLTemplateResult {
    return html`
        <ha-dialog open @closed="${() => onClosed()}">
            <div class="image-dialog">
                <img src="${imageUrl}" alt="${displayName}">
                ${displayName ? html`<div class="image-dialog-caption">${displayName}</div>` : ''}
            </div>
        </ha-dialog>
    `;
}

export function renderPlantHeader(p: HeaderParams): HTMLTemplateResult {
    const headerCssClass = p.displayType === DisplayType.Compact ? 'header-compact' : 'header';
    const noImageClass = p.hideImage ? ' no-image' : '';
    const displayName = entityDisplayName(p.hass, p.stateObj, p.name);
    const species = p.stateObj.attributes.species;
    const alertIcon = p.stateObj.state.toLowerCase() == 'problem' ? 'alert-circle-outline' : '';

    return html`
            <div class="${headerCssClass}${noImageClass}" @click="${() => p.onClick()}">
                ${!p.hideImage ? html`<img
                    src="${p.imageUrl || missingImage}"
                    class="${p.imageLightbox ? 'has-lightbox' : ''}"
                    @click="${(e: Event) => {
                        if (!p.imageLightbox) return;
                        e.stopPropagation();
                        p.onImageClick?.();
                    }}">` : ''}
                <span id="name"> ${displayName} <ha-icon .icon="mdi:${alertIcon}"></ha-icon>
                </span>
                <span id="battery">${p.badges}</span>
                ${!p.hideSpecies ? html`<span id="species">${species}</span>` : ''}
            </div>`;
}
