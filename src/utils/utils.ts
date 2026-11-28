import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { CardName } from "../types/flower-card-types";

export const moreInfo = (element: HTMLElement, entityId: string): void => {
    fireEvent(
        element,
        'hass-more-info',
        { entityId },
        { bubbles: false, composed: true }
    );
};

// getConfigForm is static, so it has no hass of its own; read the language from the page
export const getConfigFormLanguage = (): string => {
    if (typeof document === 'undefined') return 'en';
    return document.documentElement?.lang || 'en';
};

// getConfigForm is static, so it has no hass of its own; read the version from the page
export const getHaVersion = (): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    const root = document.querySelector('home-assistant') as (Element & { hass?: HomeAssistant }) | null;
    return root?.hass?.config?.version;
};

// Media source URL handling
const MEDIA_SOURCE_PREFIX = "media-source://";

interface ResolvedMediaSource {
    url: string;
    mime_type: string;
}

export const isMediaSourceUrl = (url: string | undefined): url is string => {
    return url?.startsWith(MEDIA_SOURCE_PREFIX) ?? false;
};

export const resolveMediaSource = async (
    hass: HomeAssistant,
    mediaContentId: string
): Promise<string> => {
    if (!isMediaSourceUrl(mediaContentId)) {
        return mediaContentId;
    }

    try {
        const result = await hass.callWS<ResolvedMediaSource>({
            type: "media_source/resolve_media",
            media_content_id: mediaContentId,
        });
        return result.url;
    } catch (error) {
        console.error("Failed to resolve media source:", error);
        return ""; // Return empty string on failure, will fall back to missingImage
    }
};

/** Passes the picture URL to `apply`: plain URLs at once, so the first render has them; media-source URLs once resolved. */
export const resolveEntityPicture = (
    hass: HomeAssistant,
    entityPicture: string | undefined,
    apply: (url: string | undefined) => void,
): void => {
    if (!isMediaSourceUrl(entityPicture)) {
        apply(entityPicture || undefined);
        return;
    }
    resolveMediaSource(hass, entityPicture).then(apply);
};

/** True when the thumbnail should open a lightbox (real image present and not hidden). */
export const shouldEnableImageLightbox = (
    hideImage: boolean,
    resolvedImageUrl: string | undefined,
): boolean => !hideImage && !!resolvedImageUrl;

/** True when this HA version composes names from parts (2025.11+). */
export const supportsNameItems = (version: string | undefined): boolean => {
    if (!version) return false;
    const [year, month] = version.split('.').map(Number);
    if (year > 2025) return true;
    return year === 2025 && month >= 11;
};

/** The name HA's own cards show: typed text as is, parts composed by HA, else HA's default name. */
export const entityDisplayName = (
    hass: HomeAssistant,
    stateObj: HassEntity,
    name?: CardName,
): string => {
    if (typeof name === "string" && name) return name;
    const format = (hass as HomeAssistant & {
        formatEntityName?: (stateObj: HassEntity, name?: CardName) => string;
    }).formatEntityName;
    if (typeof format !== "function") {
        return stateObj.attributes.friendly_name || stateObj.entity_id;
    }
    const hasParts = typeof name === "object" && name !== null;
    if (hasParts && supportsNameItems(hass.config?.version)) {
        return format(stateObj, name);
    }
    return format(stateObj);
};

/** The editor's name field: HA's name picker where it exists (2025.11+), else a text field. */
export const nameSelector = (version: string | undefined) => {
    if (supportsNameItems(version)) {
        return { name: "name", selector: { entity_name: {} }, context: { entity: "entity" } };
    }
    return { name: "name", selector: { text: {} } };
};
