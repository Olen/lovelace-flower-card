import { HassEntity } from "home-assistant-js-websocket";
import { DisplayedAttribute, DisplayedAttributes, ExtraBar, ValuePart } from "../types/flower-card-types";
import { formattedValue, numericState } from "./utils";

export const EXTRA_BAR_DEFAULT_MIN = 0;
export const EXTRA_BAR_DEFAULT_MAX = 100;
export const EXTRA_BAR_DEFAULT_ICON = "mdi:gauge";

function isNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

/** Throws on an extra_bars config the card cannot draw. */
export function validateExtraBars(bars: unknown): void {
    if (bars === undefined) {
        return;
    }
    if (!Array.isArray(bars)) {
        throw new Error("extra_bars must be a list");
    }
    bars.forEach((bar, index) => {
        if (typeof bar !== "object" || bar === null || typeof bar.entity !== "string" || bar.entity === "") {
            throw new Error(`extra_bars[${index}] needs an entity`);
        }
        for (const key of ["min", "max"]) {
            if (bar[key] !== undefined && !isNumber(bar[key])) {
                throw new Error(`extra_bars[${index}].${key} must be a number, not "${bar[key]}"`);
            }
        }
        const min = bar.min ?? EXTRA_BAR_DEFAULT_MIN;
        const max = bar.max ?? EXTRA_BAR_DEFAULT_MAX;
        if (min >= max) {
            throw new Error(`extra_bars[${index}] (${bar.entity}): min (${min}) must be below max (${max})`);
        }
    });
}

/** One bar per configured entity; a missing or non-numeric entity gives an unavailable bar. */
export function extraBarAttributes(
    bars: ExtraBar[],
    states: Record<string, HassEntity | undefined>,
    formatStateParts: (state: HassEntity) => ValuePart[],
    displayName: (state: HassEntity) => string,
): DisplayedAttributes {
    const displayed: DisplayedAttributes = {};
    bars.forEach((bar, index) => {
        const state = states[bar.entity];
        const current = state ? numericState(state) : NaN;
        const attribute: DisplayedAttribute = {
            name: `extra_bar_${index}`,
            label: bar.name ?? (state ? displayName(state) : bar.entity),
            current,
            limits: { min: bar.min ?? EXTRA_BAR_DEFAULT_MIN, max: bar.max ?? EXTRA_BAR_DEFAULT_MAX },
            icon: bar.icon ?? state?.attributes.icon ?? EXTRA_BAR_DEFAULT_ICON,
            sensor: bar.entity,
            unit_of_measurement: state?.attributes.unit_of_measurement ?? "",
            display_state: state && !Number.isNaN(current) ? formattedValue(formatStateParts(state)) : "",
        };
        displayed[attribute.name] = attribute;
    });
    return displayed;
}
