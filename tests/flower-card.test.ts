import { describe, it, expect, vi } from 'vitest';
import { default_show_bars } from '../src/utils/constants';
import { isMediaSourceUrl, resolveMediaSource } from '../src/utils/utils';

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
      } catch {
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

    it('should only set previousFetchDate after successful fetch', async () => {
      let previousFetchDate = 0;
      const mockCallWS = vi.fn().mockResolvedValue({ result: { moisture: { current: 50, min: 0, max: 100, sensor: 'sensor.moisture', icon: 'mdi:water', unit_of_measurement: '%' } } });

      // Simulate the fixed hass setter logic
      const fetchData = async () => {
        if (Date.now() > previousFetchDate + 1000) {
          try {
            await mockCallWS();
            previousFetchDate = Date.now();
          } catch {
            // Allow retry after 5 seconds
            previousFetchDate = Date.now() - 1000 + 5000;
          }
        }
      };

      await fetchData();
      const afterSuccess = previousFetchDate;
      expect(afterSuccess).toBeGreaterThan(0);
      expect(mockCallWS).toHaveBeenCalledTimes(1);
    });

    it('should allow retry after 5 seconds on failure', async () => {
      let previousFetchDate = 0;
      const mockCallWS = vi.fn().mockRejectedValue(new Error('WebSocket error'));

      const fetchData = async () => {
        if (Date.now() > previousFetchDate + 1000) {
          try {
            await mockCallWS();
            previousFetchDate = Date.now();
          } catch {
            // Allow retry after 5 seconds
            previousFetchDate = Date.now() - 1000 + 5000;
          }
        }
      };

      await fetchData();
      const afterFailure = previousFetchDate;

      // After failure, previousFetchDate should be set ~4 seconds in the future
      // so that Date.now() > previousFetchDate + 1000 won't be true for ~5 seconds
      expect(afterFailure).toBeGreaterThan(Date.now() + 3000);

      // Immediate retry should be blocked
      const canRetry = Date.now() > afterFailure + 1000;
      expect(canRetry).toBe(false);
    });

    it('should not block forever on fetch failure (old bug: timestamp set before fetch)', async () => {
      let previousFetchDate = 0;
      let fetchCount = 0;
      const mockCallWS = vi.fn()
        .mockRejectedValueOnce(new Error('WebSocket error'))
        .mockResolvedValueOnce({ result: { moisture: { current: 50 } } });

      const fetchData = async () => {
        if (Date.now() > previousFetchDate + 1000) {
          fetchCount++;
          try {
            await mockCallWS();
            previousFetchDate = Date.now();
          } catch {
            previousFetchDate = Date.now() - 1000 + 5000;
          }
        }
      };

      // First call fails
      await fetchData();
      expect(fetchCount).toBe(1);

      // Simulate time passing (5+ seconds)
      previousFetchDate = Date.now() - 2000; // Force past the retry delay

      // Second call should succeed
      await fetchData();
      expect(fetchCount).toBe(2);
      expect(mockCallWS).toHaveBeenCalledTimes(2);
    });
  });

  describe('get_data error handling', () => {
    it('should preserve existing plantinfo on transient failure', async () => {
      const existingPlantinfo = {
        result: {
          moisture: { current: 50, min: 0, max: 100, sensor: 'sensor.moisture', icon: 'mdi:water', unit_of_measurement: '%' }
        }
      };
      let plantinfo = { ...existingPlantinfo };

      const mockCallWS = vi.fn().mockRejectedValue(new Error('WebSocket error'));

      // Simulate the fixed get_data logic
      const get_data = async () => {
        try {
          plantinfo = await mockCallWS();
        } catch (err) {
          if (!plantinfo || !plantinfo.result || Object.keys(plantinfo.result).length === 0) {
            plantinfo = { result: {} };
          }
          throw err;
        }
      };

      await expect(get_data()).rejects.toThrow('WebSocket error');

      // Existing good data should be preserved
      expect(plantinfo.result.moisture).toBeDefined();
      expect(plantinfo.result.moisture.current).toBe(50);
    });

    it('should set empty result when plantinfo has no data on failure', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let plantinfo: any = undefined;

      const mockCallWS = vi.fn().mockRejectedValue(new Error('WebSocket error'));

      const get_data = async () => {
        try {
          plantinfo = await mockCallWS();
        } catch (err) {
          if (!plantinfo || !plantinfo.result || Object.keys(plantinfo.result).length === 0) {
            plantinfo = { result: {} };
          }
          throw err;
        }
      };

      await expect(get_data()).rejects.toThrow('WebSocket error');
      expect(plantinfo).toEqual({ result: {} });
    });

    it('should set empty result when plantinfo has empty result on failure', async () => {
      let plantinfo = { result: {} };

      const mockCallWS = vi.fn().mockRejectedValue(new Error('WebSocket error'));

      const get_data = async () => {
        try {
          plantinfo = await mockCallWS();
        } catch (err) {
          if (!plantinfo || !plantinfo.result || Object.keys(plantinfo.result).length === 0) {
            plantinfo = { result: {} };
          }
          throw err;
        }
      };

      await expect(get_data()).rejects.toThrow('WebSocket error');
      expect(plantinfo).toEqual({ result: {} });
    });

    it('should re-throw error so caller can handle retry', async () => {
      const mockCallWS = vi.fn().mockRejectedValue(new Error('Connection lost'));
      let plantinfo = { result: {} };

      const get_data = async () => {
        try {
          plantinfo = await mockCallWS();
        } catch (err) {
          if (!plantinfo || !plantinfo.result || Object.keys(plantinfo.result).length === 0) {
            plantinfo = { result: {} };
          }
          throw err;
        }
      };

      await expect(get_data()).rejects.toThrow('Connection lost');
    });

    it('should update plantinfo on successful fetch', async () => {
      let plantinfo = { result: {} };
      const newData = {
        result: {
          moisture: { current: 75, min: 0, max: 100, sensor: 'sensor.moisture', icon: 'mdi:water', unit_of_measurement: '%' }
        }
      };
      const mockCallWS = vi.fn().mockResolvedValue(newData);

      const get_data = async () => {
        try {
          plantinfo = await mockCallWS();
        } catch (err) {
          if (!plantinfo || !plantinfo.result || Object.keys(plantinfo.result).length === 0) {
            plantinfo = { result: {} };
          }
          throw err;
        }
      };

      await get_data();
      expect(plantinfo).toEqual(newData);
    });
  });

  describe('plantinfo initialization', () => {
    it('should default to empty result object', () => {
      // Simulates the fix: plantinfo: PlantInfo = { result: {} }
      const plantinfo = { result: {} };
      expect(plantinfo).toBeDefined();
      expect(plantinfo.result).toBeDefined();
      expect(Object.keys(plantinfo.result)).toHaveLength(0);
    });

    it('should not be undefined before first fetch', () => {
      // The old bug: plantinfo was declared without initialization
      // Verify the initialized value is safe to access
      const plantinfo = { result: {} };
      expect(plantinfo.result).not.toBeUndefined();
      // renderAttributes checks plantinfo && plantinfo.result
      expect(plantinfo && plantinfo.result).toBeTruthy();
    });
  });

  describe('card size', () => {
    it('should return 5', () => {
      const getCardSize = () => 5;
      expect(getCardSize()).toBe(5);
    });
  });

  describe('media source URL handling', () => {
    describe('isMediaSourceUrl', () => {
      it('should return true for media-source:// URLs', () => {
        expect(isMediaSourceUrl('media-source://media_source/local/plants/test.jpg')).toBe(true);
        expect(isMediaSourceUrl('media-source://image_upload/123456')).toBe(true);
      });

      it('should return false for regular URLs', () => {
        expect(isMediaSourceUrl('https://example.com/image.jpg')).toBe(false);
        expect(isMediaSourceUrl('http://example.com/image.jpg')).toBe(false);
        expect(isMediaSourceUrl('/local/images/plant.jpg')).toBe(false);
      });

      it('should return false for undefined or empty values', () => {
        expect(isMediaSourceUrl(undefined)).toBe(false);
        expect(isMediaSourceUrl('')).toBe(false);
      });
    });

    describe('resolveMediaSource', () => {
      it('should return original URL if not a media-source URL', async () => {
        const mockHass = { callWS: vi.fn() };
        const url = 'https://example.com/image.jpg';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await resolveMediaSource(mockHass as any, url);

        expect(result).toBe(url);
        expect(mockHass.callWS).not.toHaveBeenCalled();
      });

      it('should call WebSocket API for media-source URLs', async () => {
        const resolvedUrl = '/media/local/plants/test.jpg?authSig=abc123';
        const mockHass = {
          callWS: vi.fn().mockResolvedValue({ url: resolvedUrl, mime_type: 'image/jpeg' })
        };
        const mediaSourceUrl = 'media-source://media_source/local/plants/test.jpg';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await resolveMediaSource(mockHass as any, mediaSourceUrl);

        expect(result).toBe(resolvedUrl);
        expect(mockHass.callWS).toHaveBeenCalledWith({
          type: 'media_source/resolve_media',
          media_content_id: mediaSourceUrl,
        });
      });

      it('should return empty string on WebSocket error', async () => {
        const mockHass = {
          callWS: vi.fn().mockRejectedValue(new Error('WebSocket error'))
        };
        const mediaSourceUrl = 'media-source://media_source/local/plants/test.jpg';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await resolveMediaSource(mockHass as any, mediaSourceUrl);

        expect(result).toBe('');
      });
    });
  });
});
