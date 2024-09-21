import { HomeAssistant, fireEvent } from "custom-card-helpers";
import { default_show_bars } from "./constants";
import FlowerCard from "../flower-card";

export const getConfigElement = (): HTMLElement => {
    return document.createElement("flower-card-editor");
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export const getStubConfig = (hass: HomeAssistant) => {
    const isPlant = (entity: HomeAssistantEntity | unknown): entity is HomeAssistantEntity => {
        if (entity.entity_id.indexOf('plant.') === 0) {
            return !!entity;
        }
    }
    let supportedEntities: Array<any> = [];
    try {
        supportedEntities = Object.values(hass.states).filter(isPlant);
        //    (entity) => entity.entity_id.indexOf('plant.') === 0
        // );
    }
    catch(e) {
        console.info("Unable to get ha-data");
    }
    const entity = supportedEntities.length > 0 ? supportedEntities[0].entity_id : 'plant.my_plant';

    return {
        entity: entity,
        battery_sensor: "sensor.myflower_battery",
        show_bars: default_show_bars
    }
}

export const moreInfo = (card: FlowerCard, entityId: string): void => {
    // console.log("Event", entityId);
    fireEvent(
        card,
        'hass-more-info',
        { entityId },
        { bubbles: false, composed: true }
    );

}
