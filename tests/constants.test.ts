import { describe, it, expect } from 'vitest';
import { CARD_NAME, default_show_bars, missingImage, plantAttributes, careFields, careIcons } from '../src/utils/constants';

describe('constants', () => {
  describe('CARD_NAME', () => {
    it('should be "flower-card"', () => {
      expect(CARD_NAME).toBe('flower-card');
    });
  });

  describe('default_show_bars', () => {
    it('should contain common plant attributes', () => {
      expect(default_show_bars).toContain('moisture');
      expect(default_show_bars).toContain('conductivity');
      expect(default_show_bars).toContain('temperature');
      expect(default_show_bars).toContain('illuminance');
      expect(default_show_bars).toContain('humidity');
      expect(default_show_bars).toContain('dli');
    });

    it('should not include uncommon sensors by default', () => {
      expect(default_show_bars).not.toContain('co2');
      expect(default_show_bars).not.toContain('soil_temperature');
    });

    it('should have 6 default attributes', () => {
      expect(default_show_bars).toHaveLength(6);
    });
  });

  describe('missingImage', () => {
    it('should be a base64 encoded SVG', () => {
      expect(missingImage).toMatch(/^data:image\/svg\+xml;base64,/);
    });
  });

  describe('plantAttributes', () => {
    it('should have label and value for each attribute', () => {
      plantAttributes.forEach((attr) => {
        expect(attr).toHaveProperty('label');
        expect(attr).toHaveProperty('value');
        expect(typeof attr.label).toBe('string');
        expect(typeof attr.value).toBe('string');
      });
    });

    it('should include all sensors including uncommon ones', () => {
      const values = plantAttributes.map(a => a.value);
      expect(values).toContain('co2');
      expect(values).toContain('soil_temperature');
    });

    it('should have matching values with default_show_bars', () => {
      const attrValues = plantAttributes.map((a) => a.value);
      default_show_bars.forEach((bar) => {
        expect(attrValues).toContain(bar);
      });
    });
  });

  describe('careFields', () => {
    it('has the five OpenPlantbook care fields with care_ prefixed values', () => {
      const values = careFields.map(f => f.value);
      expect(values).toEqual([
        'care_watering',
        'care_sunlight',
        'care_soil',
        'care_pruning',
        'care_fertilization',
      ]);
    });

    it('has a label and value for each field', () => {
      careFields.forEach(f => {
        expect(typeof f.label).toBe('string');
        expect(typeof f.value).toBe('string');
      });
    });

    it('has a matching mdi icon for every care field', () => {
      careFields.forEach(f => {
        expect(careIcons[f.value]).toMatch(/^mdi:/);
      });
    });

    it('has no icon keys that are not care fields', () => {
      const fieldValues = careFields.map(f => f.value).sort();
      expect(Object.keys(careIcons).sort()).toEqual(fieldValues);
    });
  });
});
