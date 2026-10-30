import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import FlowerCard from "../flower-card";

export const moreInfo = (card: FlowerCard, entityId: string): void => {
    fireEvent(
        card,
        'hass-more-info',
        { entityId },
        { bubbles: false, composed: true }
    );
};

// Media source URL handling
const MEDIA_SOURCE_PREFIX = "media-source://";

interface ResolvedMediaSource {
    url: string;
    mime_type: string;
}

export const isMediaSourceUrl = (url: string | undefined): boolean => {
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

/** True when the thumbnail should open a lightbox (real image present and not hidden). */
export const shouldEnableImageLightbox = (
    hideImage: boolean,
    resolvedImageUrl: string | undefined,
): boolean => !hideImage && !!resolvedImageUrl;

/** The name HA's own cards show: a configured name, else hass.formatEntityName (HA 2025.10+), else friendly_name. */
export const entityDisplayName = (
    hass: HomeAssistant,
    stateObj: HassEntity,
    name?: string,
): string => {
    if (name) return name;
    const format = (hass as HomeAssistant & {
        formatEntityName?: (stateObj: HassEntity) => string;
    }).formatEntityName;
    if (typeof format === "function") return format(stateObj);
    return stateObj.attributes.friendly_name || stateObj.entity_id;
};
