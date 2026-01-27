import { fireEvent } from "custom-card-helpers";
import FlowerCard from "../flower-card";

export const moreInfo = (card: FlowerCard, entityId: string): void => {
    fireEvent(
        card,
        'hass-more-info',
        { entityId },
        { bubbles: false, composed: true }
    );
};
