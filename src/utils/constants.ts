// A selectable option (label/value pair) for the card's config-form selectors.
export interface DropdownOption {
    label: string;
    value: string;
}

import { getTranslation } from './translations';

export const CARD_NAME = "flower-card";

export const default_show_bars = [
    "moisture",
    "conductivity",
    "temperature",
    "illuminance",
    "humidity",
    "dli",
  ];

export const missingImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiIGZvY3VzYWJsZT0iZmFsc2UiIHJvbGU9ImltZyIgYXJpYS1oaWRkZW49InRydWUiIHZpZXdCb3g9IjAgMCAyNCAyNCI+CiAgICAgIDxnPgogICAgICA8IS0tP2xpdCQ0MTM0MjMxNjkkLS0+PHBhdGggZD0iTTMsMTNBOSw5IDAgMCwwIDEyLDIyQzEyLDE3IDcuOTcsMTMgMywxM00xMiw1LjVBMi41LDIuNSAwIDAsMSAxNC41LDhBMi41LDIuNSAwIDAsMSAxMiwxMC41QTIuNSwyLjUgMCAwLDEgOS41LDhBMi41LDIuNSAwIDAsMSAxMiw1LjVNNS42LDEwLjI1QTIuNSwyLjUgMCAwLDAgOC4xLDEyLjc1QzguNjMsMTIuNzUgOS4xMiwxMi41OCA5LjUsMTIuMzFDOS41LDEyLjM3IDkuNSwxMi40MyA5LjUsMTIuNUEyLjUsMi41IDAgMCwwIDEyLDE1QTIuNSwyLjUgMCAwLDAgMTQuNSwxMi41QzE0LjUsMTIuNDMgMTQuNSwxMi4zNyAxNC41LDEyLjMxQzE0Ljg4LDEyLjU4IDE1LjM3LDEyLjc1IDE1LjksMTIuNzVDMTcuMjgsMTIuNzUgMTguNCwxMS42MyAxOC40LDEwLjI1QzE4LjQsOS4yNSAxNy44MSw4LjQgMTYuOTcsOEMxNy44MSw3LjYgMTguNCw2Ljc0IDE4LjQsNS43NUMxOC40LDQuMzcgMTcuMjgsMy4yNSAxNS45LDMuMjVDMTUuMzcsMy4yNSAxNC44OCwzLjQxIDE0LjUsMy42OUMxNC41LDMuNjMgMTQuNSwzLjU2IDE0LjUsMy41QTIuNSwyLjUgMCAwLDAgMTIsMUEyLjUsMi41IDAgMCwwIDkuNSwzLjVDOS41LDMuNTYgOS41LDMuNjMgOS41LDMuNjlDOS4xMiwzLjQxIDguNjMsMy4yNSA4LjEsMy4yNUEyLjUsMi41IDAgMCwwIDUuNiw1Ljc1QzUuNiw2Ljc0IDYuMTksNy42IDcuMDMsOEM2LjE5LDguNCA1LjYsOS4yNSA1LjYsMTAuMjVNMTIsMjJBOSw5IDAgMCwwIDIxLDEzQzE2LDEzIDEyLDE3IDEyLDIyWiI+PC9wYXRoPgogICAgICA8L2c+Cjwvc3ZnPgo=";

export const getPlantAttributes = (language = 'en'): DropdownOption[] => [
  { label: getTranslation('moisture', language), value: 'moisture' },
  { label: getTranslation('conductivity', language), value: 'conductivity' },
  { label: getTranslation('temperature', language), value: 'temperature' },
  { label: getTranslation('illuminance', language), value: 'illuminance' },
  { label: getTranslation('humidity', language), value: 'humidity' },
  { label: getTranslation('dli', language), value: 'dli' },
  { label: getTranslation('dli_24h', language), value: 'dli_24h' },
  { label: getTranslation('co2', language), value: 'co2' },
  { label: getTranslation('soil_temperature', language), value: 'soil_temperature' },
  { label: getTranslation('vpd', language), value: 'vpd' }
];

export const plantAttributes: DropdownOption[] = getPlantAttributes('en');

export const getCareFields = (language = 'en'): DropdownOption[] => [
  { label: getTranslation('care_watering', language), value: 'care_watering' },
  { label: getTranslation('care_sunlight', language), value: 'care_sunlight' },
  { label: getTranslation('care_soil', language), value: 'care_soil' },
  { label: getTranslation('care_pruning', language), value: 'care_pruning' },
  { label: getTranslation('care_fertilization', language), value: 'care_fertilization' }
];

export const careFields: DropdownOption[] = getCareFields('en');

export const careIcons: Record<string, string> = {
  care_watering: 'mdi:watering-can-outline',
  care_sunlight: 'mdi:white-balance-sunny',
  care_soil: 'mdi:shovel',
  care_pruning: 'mdi:content-cut',
  care_fertilization: 'mdi:bottle-tonic-outline',
};
