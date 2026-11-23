import { describe, it, expect } from 'vitest';
import { validateCareCardConfig } from '../src/plant-care-card';
import { DisplayType } from '../src/types/flower-card-types';

describe('validateCareCardConfig', () => {
  it('rejects a config without an entity', () => {
    expect(() => validateCareCardConfig({})).toThrow('You need to define an entity');
  });

  it('returns a valid config unchanged', () => {
    const config = { type: 'custom:plant-care-card', entity: 'plant.x', display_type: DisplayType.Compact };
    expect(validateCareCardConfig(config)).toEqual(config);
  });
});
