import { describe, it, expect } from 'vitest';
import { validateCareCardConfig } from '../src/flower-care-card';
import { DisplayType } from '../src/types/flower-card-types';

describe('validateCareCardConfig', () => {
  it('rejects a config without an entity', () => {
    expect(() => validateCareCardConfig({})).toThrow('You need to define an entity');
  });

  it('returns a valid config unchanged', () => {
    const config = { type: 'custom:flower-care-card', entity: 'plant.x', display_type: DisplayType.Compact };
    expect(validateCareCardConfig(config)).toEqual(config);
  });

  it('accepts the options shared with the flower card', () => {
    const config = {
      type: 'custom:flower-care-card',
      entity: 'plant.x',
      name: 'Monstera',
      battery_sensor: 'sensor.x_battery',
      extra_badges: [{ type: 'care_info' }],
      show_care: ['care_watering', 'care_repotting'],
      hide_species: true,
      hide_image: true,
    };
    expect(validateCareCardConfig(config)).toEqual(config);
  });

  it('rejects an unknown show_care value', () => {
    expect(() => validateCareCardConfig({ entity: 'plant.x', show_care: ['care_misting'] })).toThrow(/care_misting/);
  });
});
