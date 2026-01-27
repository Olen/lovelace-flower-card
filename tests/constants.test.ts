import { describe, it, expect } from 'vitest';
import { CARD_NAME, CARD_EDITOR_NAME, default_show_bars, missingImage, plantAttributes } from '../src/utils/constants';

describe('constants', () => {
  describe('CARD_NAME', () => {
    it('should be "flower-card"', () => {
      expect(CARD_NAME).toBe('flower-card');
    });
  });

  describe('CARD_EDITOR_NAME', () => {
    it('should be derived from CARD_NAME', () => {
      expect(CARD_EDITOR_NAME).toBe('flower-card-editor');
    });
  });

  describe('default_show_bars', () => {
    it('should contain expected plant attributes', () => {
      expect(default_show_bars).toContain('moisture');
      expect(default_show_bars).toContain('conductivity');
      expect(default_show_bars).toContain('temperature');
      expect(default_show_bars).toContain('illuminance');
      expect(default_show_bars).toContain('humidity');
      expect(default_show_bars).toContain('dli');
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

    it('should have matching values with default_show_bars', () => {
      const attrValues = plantAttributes.map((a) => a.value);
      default_show_bars.forEach((bar) => {
        expect(attrValues).toContain(bar);
      });
    });
  });
});
