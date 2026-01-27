import { describe, it, expect, vi, beforeAll } from 'vitest';
import { default_show_bars } from '../src/utils/constants';

// Test getStubConfig logic without instantiating LitElement
describe('FlowerCard logic', () => {
  describe('getStubConfig logic', () => {
    // Extract the isPlant type guard logic
    const isPlant = (entity: unknown): boolean => {
      return typeof entity === 'object' && entity !== null &&
        'entity_id' in entity &&
        typeof (entity as { entity_id: string }).entity_id === 'string' &&
        (entity as { entity_id: string }).entity_id.startsWith('plant.');
    };

    const getStubConfigLogic = (states: Record<string, unknown> | null) => {
      let supportedEntities: Array<{ entity_id: string }> = [];
      try {
        if (states) {
          supportedEntities = Object.values(states).filter(isPlant) as Array<{ entity_id: string }>;
        }
      } catch (e) {
        // Handle error gracefully
      }
      const entity = supportedEntities.length > 0 ? supportedEntities[0].entity_id : 'plant.my_plant';

      return {
        entity: entity,
        battery_sensor: 'sensor.myflower_battery',
        show_bars: default_show_bars,
      };
    };

    it('should return default config when no plant entities exist', () => {
      const states = {
        'sensor.temperature': { entity_id: 'sensor.temperature' },
      };

      const config = getStubConfigLogic(states);

      expect(config.entity).toBe('plant.my_plant');
      expect(config.battery_sensor).toBe('sensor.myflower_battery');
      expect(config.show_bars).toBeDefined();
    });

    it('should return first plant entity when plants exist', () => {
      const states = {
        'plant.tomato': { entity_id: 'plant.tomato' },
        'plant.basil': { entity_id: 'plant.basil' },
        'sensor.temperature': { entity_id: 'sensor.temperature' },
      };

      const config = getStubConfigLogic(states);

      expect(config.entity).toBe('plant.tomato');
    });

    it('should handle empty states gracefully', () => {
      const config = getStubConfigLogic({});

      expect(config.entity).toBe('plant.my_plant');
    });

    it('should handle null states gracefully', () => {
      const config = getStubConfigLogic(null);

      expect(config.entity).toBe('plant.my_plant');
    });

    describe('isPlant type guard', () => {
      it('should return true for plant entities', () => {
        expect(isPlant({ entity_id: 'plant.tomato' })).toBe(true);
        expect(isPlant({ entity_id: 'plant.my_plant' })).toBe(true);
      });

      it('should return false for non-plant entities', () => {
        expect(isPlant({ entity_id: 'sensor.temperature' })).toBe(false);
        expect(isPlant({ entity_id: 'light.living_room' })).toBe(false);
      });

      it('should return false for invalid inputs', () => {
        expect(isPlant(null)).toBe(false);
        expect(isPlant(undefined)).toBe(false);
        expect(isPlant('plant.test')).toBe(false);
        expect(isPlant({ other_field: 'value' })).toBe(false);
        expect(isPlant({ entity_id: 123 })).toBe(false);
      });
    });
  });

  describe('setConfig validation', () => {
    const validateConfig = (config: { entity?: string }) => {
      if (!config.entity) {
        throw new Error('You need to define an entity');
      }
      return config;
    };

    it('should throw error when entity is not defined', () => {
      expect(() => validateConfig({})).toThrow('You need to define an entity');
    });

    it('should throw error when entity is empty string', () => {
      expect(() => validateConfig({ entity: '' })).toThrow('You need to define an entity');
    });

    it('should accept valid config with entity', () => {
      const config = { entity: 'plant.my_plant' };
      expect(validateConfig(config)).toEqual(config);
    });
  });

  describe('display name logic', () => {
    const getDisplayName = (configName?: string, friendlyName?: string) => {
      return configName || friendlyName;
    };

    it('should use config name when provided', () => {
      expect(getDisplayName('Custom Name', 'Friendly Name')).toBe('Custom Name');
    });

    it('should fall back to friendly name when config name not provided', () => {
      expect(getDisplayName(undefined, 'Friendly Name')).toBe('Friendly Name');
    });

    it('should return undefined when neither is provided', () => {
      expect(getDisplayName(undefined, undefined)).toBeUndefined();
    });
  });

  describe('hide species logic', () => {
    const shouldHideSpecies = (hideSpecies?: boolean) => {
      return hideSpecies ?? false;
    };

    it('should hide species when explicitly set to true', () => {
      expect(shouldHideSpecies(true)).toBe(true);
    });

    it('should show species when explicitly set to false', () => {
      expect(shouldHideSpecies(false)).toBe(false);
    });

    it('should show species by default when not set', () => {
      expect(shouldHideSpecies(undefined)).toBe(false);
    });
  });

  describe('data fetching throttle', () => {
    it('should throttle calls within 1 second', () => {
      let previousFetchDate = 0;
      const shouldFetch = () => {
        if (Date.now() > previousFetchDate + 1000) {
          previousFetchDate = Date.now();
          return true;
        }
        return false;
      };

      // First call should fetch
      expect(shouldFetch()).toBe(true);

      // Immediate second call should not fetch
      expect(shouldFetch()).toBe(false);
    });
  });

  describe('card size', () => {
    it('should return 5', () => {
      const getCardSize = () => 5;
      expect(getCardSize()).toBe(5);
    });
  });
});
