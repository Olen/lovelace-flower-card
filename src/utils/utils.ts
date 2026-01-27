import { fireEvent, HomeAssistant } from "custom-card-helpers";
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
