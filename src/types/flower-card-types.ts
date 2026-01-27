import { LovelaceCardConfig } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";

export interface FlowerCardConfig extends LovelaceCardConfig {
    entity?: string;
    battery_sensor?: string;
    display_type?: DisplayType;
    name?: string;
    hide_species?: boolean;
}

export enum DisplayType {
    Full = "full",
    Compact = "compact"
}

export interface HomeAssistantEntity extends HassEntity {
    entity_id: string;
    state: string;
}

export interface PlantInfo {
    result: {
        [key: string]: PlantAttribute;
    };
}

export interface PlantAttribute {
    max: number;
    min: number;
    current: number;
    icon: string;
    sensor: string;
    unit_of_measurement: string;
}

export interface Limits {
    max: number;
    min: number;
}

export interface Attribute {
    icon: string;
    sensor: string;
    unit_of_measurement: string;
    display_state: string;
}

export interface DisplayedAttribute extends Attribute {
    current: number;
    limits: Limits;
    name: string;
}

export interface DisplayedAttributes {
    [key: string]: DisplayedAttribute;
}

export interface Icons {
    [key: string]: string;
}

export interface UOM {
    [key: string]: string;
}

export interface UOMT {
    [key: string]: string;
}
