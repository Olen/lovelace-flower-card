// A selectable option (label/value pair) for the card's config-form selectors.
export interface DropdownOption {
    label: string;
    value: string;
}

import { localize } from '../localize/localize';

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
  { label: localize({ language }, 'moisture'), value: 'moisture' },
  { label: localize({ language }, 'conductivity'), value: 'conductivity' },
  { label: localize({ language }, 'temperature'), value: 'temperature' },
  { label: localize({ language }, 'illuminance'), value: 'illuminance' },
  { label: localize({ language }, 'humidity'), value: 'humidity' },
  { label: localize({ language }, 'dli'), value: 'dli' },
  { label: localize({ language }, 'dli_24h'), value: 'dli_24h' },
  { label: localize({ language }, 'co2'), value: 'co2' },
  { label: localize({ language }, 'soil_temperature'), value: 'soil_temperature' },
  { label: localize({ language }, 'vpd'), value: 'vpd' }
];

export const plantAttributes: DropdownOption[] = getPlantAttributes('en');

export const getCareFields = (language = 'en'): DropdownOption[] => [
  { label: localize({ language }, 'care_watering'), value: 'care_watering' },
  { label: localize({ language }, 'care_sunlight'), value: 'care_sunlight' },
  { label: localize({ language }, 'care_soil'), value: 'care_soil' },
  { label: localize({ language }, 'care_pruning'), value: 'care_pruning' },
  { label: localize({ language }, 'care_fertilization'), value: 'care_fertilization' }
];

export const careFields: DropdownOption[] = getCareFields('en');

export const careIcons: Record<string, string> = {
  care_watering: 'mdi:watering-can-outline',
  care_sunlight: 'mdi:white-balance-sunny',
  care_soil: 'mdi:shovel',
  care_pruning: 'mdi:content-cut',
  care_fertilization: 'mdi:bottle-tonic-outline',
};
