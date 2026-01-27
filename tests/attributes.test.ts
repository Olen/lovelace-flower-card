import { describe, it, expect } from 'vitest';
import { getChunkedDisplayed } from '../src/utils/attributes';
import { DisplayedAttribute, DisplayedAttributes } from '../src/types/flower-card-types';

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
