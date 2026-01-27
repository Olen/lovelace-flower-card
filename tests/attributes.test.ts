import { describe, it, expect } from 'vitest';
import { getChunkedDisplayed } from '../src/utils/attributes';
import { DisplayedAttribute, DisplayedAttributes, ExtraBadge } from '../src/types/flower-card-types';

describe('percentage calculation', () => {
  // Test the percentage calculation logic used in renderAttribute
  const calculatePct = (val: number, min: number, max: number, logScale: boolean) => {
    const useLinear = !logScale || val <= 0 || min <= 0;
    return useLinear
      ? 100 * Math.max(0, Math.min(1, (val - min) / (max - min)))
      : 100 * Math.max(0, Math.min(1, (Math.log(val) - Math.log(min)) / (Math.log(max) - Math.log(min))));
  };

  it('should calculate linear percentage correctly', () => {
    expect(calculatePct(50, 0, 100, false)).toBe(50);
    expect(calculatePct(0, 0, 100, false)).toBe(0);
    expect(calculatePct(100, 0, 100, false)).toBe(100);
  });

  it('should clamp percentage to 0-100 range', () => {
    expect(calculatePct(-10, 0, 100, false)).toBe(0);
    expect(calculatePct(150, 0, 100, false)).toBe(100);
  });

  it('should handle negative ranges (temperature)', () => {
    // Temperature range -10 to 40
    expect(calculatePct(15, -10, 40, false)).toBe(50);
    expect(calculatePct(-10, -10, 40, false)).toBe(0);
    expect(calculatePct(40, -10, 40, false)).toBe(100);
  });

  it('should use linear scale when logScale is false', () => {
    const pct = calculatePct(500, 100, 10000, false);
    expect(pct).toBeCloseTo(4.04, 1); // (500-100)/(10000-100) * 100
  });

  it('should use log scale for lux when value and min are positive', () => {
    // Log scale makes more sense for large ranges like lux
    const pctLog = calculatePct(1000, 100, 100000, true);
    const pctLinear = calculatePct(1000, 100, 100000, false);

    // Log scale should give higher percentage for same value
    expect(pctLog).toBeGreaterThan(pctLinear);
  });

  it('should fall back to linear when value is zero', () => {
    const pct = calculatePct(0, 0, 100000, true);
    expect(pct).toBe(0);
  });

  it('should fall back to linear when min is zero', () => {
    const pct = calculatePct(50, 0, 100, true);
    expect(pct).toBe(50);
  });
});

describe('battery level determination', () => {
  // Test the battery level logic used in renderBattery
  const getBatteryLevel = (state: number) => {
    const levels = [
      { threshold: 90, icon: 'mdi:battery', color: 'green' },
      { threshold: 80, icon: 'mdi:battery-90', color: 'green' },
      { threshold: 70, icon: 'mdi:battery-80', color: 'green' },
      { threshold: 60, icon: 'mdi:battery-70', color: 'green' },
      { threshold: 50, icon: 'mdi:battery-60', color: 'green' },
      { threshold: 40, icon: 'mdi:battery-50', color: 'green' },
      { threshold: 30, icon: 'mdi:battery-40', color: 'orange' },
      { threshold: 20, icon: 'mdi:battery-30', color: 'orange' },
      { threshold: 10, icon: 'mdi:battery-20', color: 'red' },
      { threshold: 0, icon: 'mdi:battery-10', color: 'red' },
      { threshold: -Infinity, icon: 'mdi:battery-alert-variant-outline', color: 'red' },
    ];
    return levels.find(({ threshold }) => state > threshold) ||
      { icon: 'mdi:battery-alert-variant-outline', color: 'red' };
  };

  it('should show full battery for >90%', () => {
    const { icon, color } = getBatteryLevel(95);
    expect(icon).toBe('mdi:battery');
    expect(color).toBe('green');
  });

  it('should show green for 41-90%', () => {
    expect(getBatteryLevel(85).color).toBe('green');
    expect(getBatteryLevel(60).color).toBe('green');
    expect(getBatteryLevel(41).color).toBe('green');
  });

  it('should show orange for 21-40%', () => {
    expect(getBatteryLevel(35).color).toBe('orange');
    expect(getBatteryLevel(25).color).toBe('orange');
  });

  it('should show red for <=20%', () => {
    expect(getBatteryLevel(15).color).toBe('red');
    expect(getBatteryLevel(5).color).toBe('red');
  });

  it('should handle 0% battery', () => {
    // 0 is not > 0, so it falls through to the -Infinity threshold
    const { icon, color } = getBatteryLevel(0);
    expect(icon).toBe('mdi:battery-alert-variant-outline');
    expect(color).toBe('red');
  });

  it('should handle 1% battery', () => {
    // 1 > 0, so it matches the threshold: 0 level
    const { icon, color } = getBatteryLevel(1);
    expect(icon).toBe('mdi:battery-10');
    expect(color).toBe('red');
  });

  it('should handle negative values', () => {
    const { icon, color } = getBatteryLevel(-5);
    expect(icon).toBe('mdi:battery-alert-variant-outline');
    expect(color).toBe('red');
  });
});

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

describe('ExtraBadge type', () => {
  describe('icon-only badge', () => {
    it('should support icon-only badge configuration', () => {
      const badge: ExtraBadge = {
        icon: 'mdi:flower',
        color: 'pink',
      };

      expect(badge.icon).toBe('mdi:flower');
      expect(badge.color).toBe('pink');
      expect(badge.entity).toBeUndefined();
      expect(badge.text).toBeUndefined();
    });
  });

  describe('static text badge', () => {
    it('should support text-based badge configuration', () => {
      const badge: ExtraBadge = {
        text: 'Indoor',
        icon: 'mdi:home',
        color: 'blue',
      };

      expect(badge.text).toBe('Indoor');
      expect(badge.icon).toBe('mdi:home');
      expect(badge.color).toBe('blue');
    });

    it('should have optional show_state', () => {
      const badge: ExtraBadge = {
        text: 'Test',
        show_state: true,
      };

      expect(badge.show_state).toBe(true);
    });
  });

  describe('entity-based badge', () => {
    it('should support entity-based badge configuration', () => {
      const badge: ExtraBadge = {
        entity: 'sensor.plant_humidity',
        icon: 'mdi:water-percent',
      };

      expect(badge.entity).toBe('sensor.plant_humidity');
      expect(badge.icon).toBe('mdi:water-percent');
    });

    it('should support binary_sensor with on/off colors', () => {
      const badge: ExtraBadge = {
        entity: 'binary_sensor.plant_needs_water',
        color_on: 'red',
        color_off: 'green',
      };

      expect(badge.entity).toBe('binary_sensor.plant_needs_water');
      expect(badge.color_on).toBe('red');
      expect(badge.color_off).toBe('green');
    });
  });

  describe('badge color logic', () => {
    // Test the color determination logic used in renderExtraBadge
    const getBadgeColor = (badge: ExtraBadge, isBinarySensor: boolean, isOn: boolean) => {
      if (isBinarySensor) {
        return isOn
          ? (badge.color_on || 'var(--primary-color)')
          : (badge.color_off || 'var(--disabled-text-color)');
      }
      return badge.color || 'var(--secondary-text-color)';
    };

    it('should use default colors for binary sensor when not specified', () => {
      const badge: ExtraBadge = { entity: 'binary_sensor.test' };

      expect(getBadgeColor(badge, true, true)).toBe('var(--primary-color)');
      expect(getBadgeColor(badge, true, false)).toBe('var(--disabled-text-color)');
    });

    it('should use custom colors for binary sensor when specified', () => {
      const badge: ExtraBadge = {
        entity: 'binary_sensor.test',
        color_on: 'red',
        color_off: 'grey',
      };

      expect(getBadgeColor(badge, true, true)).toBe('red');
      expect(getBadgeColor(badge, true, false)).toBe('grey');
    });

    it('should use default color for regular sensor when not specified', () => {
      const badge: ExtraBadge = { entity: 'sensor.test' };

      expect(getBadgeColor(badge, false, false)).toBe('var(--secondary-text-color)');
    });

    it('should use custom color for regular sensor when specified', () => {
      const badge: ExtraBadge = {
        entity: 'sensor.test',
        color: 'purple',
      };

      expect(getBadgeColor(badge, false, false)).toBe('purple');
    });
  });
});
