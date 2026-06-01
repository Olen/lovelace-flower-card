import { describe, it, expect } from 'vitest';
import { selectCareInfo } from '../src/utils/attributes';

describe('selectCareInfo', () => {
  const attrs = {
    care_watering: 'Water weekly.',
    care_sunlight: 'Bright indirect light.',
    care_soil: '   ',                       // whitespace-only -> treated as absent
    care_fertilization: 'Feed monthly in spring.',
    // care_pruning intentionally absent
  };

  it('returns empty when show_care is undefined or empty', () => {
    expect(selectCareInfo(attrs, undefined)).toEqual([]);
    expect(selectCareInfo(attrs, [])).toEqual([]);
  });

  it('returns empty when attributes are missing', () => {
    expect(selectCareInfo(undefined, ['care_watering'])).toEqual([]);
  });

  it('includes selected fields that are present and non-empty', () => {
    const result = selectCareInfo(attrs, ['care_watering', 'care_fertilization']);
    expect(result.map(e => e.key)).toEqual(['care_watering', 'care_fertilization']);
    expect(result[0].text).toBe('Water weekly.');
    expect(result[0].label).toBe('Watering');
    expect(result[0].icon).toBe('mdi:watering-can-outline');
  });

  it('skips selected fields that are absent', () => {
    const result = selectCareInfo(attrs, ['care_pruning', 'care_watering']);
    expect(result.map(e => e.key)).toEqual(['care_watering']);
  });

  it('skips selected fields that are whitespace-only', () => {
    expect(selectCareInfo(attrs, ['care_soil'])).toEqual([]);
  });

  it('orders results by careFields order, not selection order', () => {
    const result = selectCareInfo(attrs, ['care_fertilization', 'care_watering', 'care_sunlight']);
    expect(result.map(e => e.key)).toEqual(['care_watering', 'care_sunlight', 'care_fertilization']);
  });

  it('skips non-string attribute values', () => {
    expect(selectCareInfo({ care_watering: 42 }, ['care_watering'])).toEqual([]);
  });
});
