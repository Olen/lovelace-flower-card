import { describe, it, expect } from 'vitest';
import { getChunkedDisplayed } from '../src/utils/attributes';
import { DisplayedAttribute, DisplayedAttributes } from '../src/types/flower-card-types';

describe('display_state regex', () => {
  // Test the regex pattern used for extracting numeric values
  const regex = /[^\d,.+-]/g;

  it('should preserve negative numbers', () => {
    const input = '-5.2 °C';
    const result = input.replace(regex, '');
    expect(result).toBe('-5.2');
  });

  it('should preserve positive numbers', () => {
    const input = '25.5 °C';
    const result = input.replace(regex, '');
    expect(result).toBe('25.5');
  });

  it('should preserve zero', () => {
    const input = '0 lx';
    const result = input.replace(regex, '');
    expect(result).toBe('0');
  });

  it('should handle comma decimal separators', () => {
    const input = '1.234,56 µS/cm';
    const result = input.replace(regex, '');
    expect(result).toBe('1.234,56');
  });
});

const createMockAttribute = (name: string): DisplayedAttribute => ({
  name,
  current: 50,
  limits: { min: 0, max: 100 },
  icon: 'mdi:test',
  sensor: `sensor.${name}`,
  unit_of_measurement: '%',
  display_state: '50',
});

describe('attributes', () => {
  describe('getChunkedDisplayed', () => {
    it('should chunk attributes into groups of specified size', () => {
      const displayed: DisplayedAttributes = {
        moisture: createMockAttribute('moisture'),
        temperature: createMockAttribute('temperature'),
        humidity: createMockAttribute('humidity'),
        conductivity: createMockAttribute('conductivity'),
      };

      const chunked = getChunkedDisplayed(displayed, 2);

      expect(chunked).toHaveLength(2);
      expect(chunked[0]).toHaveLength(2);
      expect(chunked[1]).toHaveLength(2);
    });

    it('should handle odd number of attributes', () => {
      const displayed: DisplayedAttributes = {
        moisture: createMockAttribute('moisture'),
        temperature: createMockAttribute('temperature'),
        humidity: createMockAttribute('humidity'),
      };

      const chunked = getChunkedDisplayed(displayed, 2);

      expect(chunked).toHaveLength(2);
      expect(chunked[0]).toHaveLength(2);
      expect(chunked[1]).toHaveLength(1);
    });

    it('should return single chunk when attributesPerRow equals total', () => {
      const displayed: DisplayedAttributes = {
        moisture: createMockAttribute('moisture'),
        temperature: createMockAttribute('temperature'),
      };

      const chunked = getChunkedDisplayed(displayed, 2);

      expect(chunked).toHaveLength(1);
      expect(chunked[0]).toHaveLength(2);
    });

    it('should handle empty input', () => {
      const displayed: DisplayedAttributes = {};

      const chunked = getChunkedDisplayed(displayed, 2);

      expect(chunked).toHaveLength(0);
    });

    it('should chunk into single items for compact mode', () => {
      const displayed: DisplayedAttributes = {
        moisture: createMockAttribute('moisture'),
        temperature: createMockAttribute('temperature'),
        humidity: createMockAttribute('humidity'),
      };

      const chunked = getChunkedDisplayed(displayed, 1);

      expect(chunked).toHaveLength(3);
      expect(chunked[0]).toHaveLength(1);
      expect(chunked[1]).toHaveLength(1);
      expect(chunked[2]).toHaveLength(1);
    });
  });
});
