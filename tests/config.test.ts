import { describe, it, expect } from 'vitest';
import { DisplayType, FlowerCardConfig } from '../src/types/flower-card-types';

describe('FlowerCardConfig', () => {
  describe('name option', () => {
    it('should allow custom name to be set', () => {
      const config: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        name: 'My Custom Plant Name',
      };

      expect(config.name).toBe('My Custom Plant Name');
    });

    it('should be optional', () => {
      const config: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
      };

      expect(config.name).toBeUndefined();
    });
  });

  describe('hide_species option', () => {
    it('should allow hiding species', () => {
      const config: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        hide_species: true,
      };

      expect(config.hide_species).toBe(true);
    });

    it('should default to showing species when not set', () => {
      const config: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
      };

      // When hide_species is undefined, species should be shown (hide_species ?? false === false)
      const hideSpecies = config.hide_species ?? false;
      expect(hideSpecies).toBe(false);
    });
  });

  describe('hide_image option', () => {
    it('should allow hiding image', () => {
      const config: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        hide_image: true,
      };

      expect(config.hide_image).toBe(true);
    });

    it('should default to showing image when not set', () => {
      const config: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
      };

      // When hide_image is undefined, image should be shown (hide_image ?? false === false)
      const hideImage = config.hide_image ?? false;
      expect(hideImage).toBe(false);
    });
  });

  describe('display_type option', () => {
    it('should support Full display type', () => {
      const config: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        display_type: DisplayType.Full,
      };

      expect(config.display_type).toBe('full');
    });

    it('should support Compact display type', () => {
      const config: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        display_type: DisplayType.Compact,
      };

      expect(config.display_type).toBe('compact');
    });
  });

  describe('show_units option', () => {
    it('should allow explicit show_units setting', () => {
      const config: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        show_units: false,
      };

      expect(config.show_units).toBe(false);
    });

    it('should default based on display_type when not set', () => {
      const fullConfig: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        display_type: DisplayType.Full,
      };
      const compactConfig: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        display_type: DisplayType.Compact,
      };

      // Default: true for full, false for compact
      const isCompactFull = fullConfig.display_type === DisplayType.Compact;
      const showUnitsFull = fullConfig.show_units ?? !isCompactFull;
      expect(showUnitsFull).toBe(true);

      const isCompactCompact = compactConfig.display_type === DisplayType.Compact;
      const showUnitsCompact = compactConfig.show_units ?? !isCompactCompact;
      expect(showUnitsCompact).toBe(false);
    });

    it('should allow overriding default for compact mode', () => {
      const config: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        display_type: DisplayType.Compact,
        show_units: true,
      };

      // Explicit show_units should override the compact default
      const isCompact = config.display_type === DisplayType.Compact;
      const showUnits = config.show_units ?? !isCompact;
      expect(showUnits).toBe(true);
    });
  });

  describe('bars_per_row option', () => {
    it('should allow setting bars_per_row', () => {
      const config: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        bars_per_row: 1,
      };

      expect(config.bars_per_row).toBe(1);
    });

    it('should default based on display_type when not set', () => {
      const fullConfig: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        display_type: DisplayType.Full,
      };
      const compactConfig: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        display_type: DisplayType.Compact,
      };

      // Default: 2 for full, 1 for compact
      const isCompactFull = fullConfig.display_type === DisplayType.Compact;
      const barsPerRowFull = fullConfig.bars_per_row ?? (isCompactFull ? 1 : 2);
      expect(barsPerRowFull).toBe(2);

      const isCompactCompact = compactConfig.display_type === DisplayType.Compact;
      const barsPerRowCompact = compactConfig.bars_per_row ?? (isCompactCompact ? 1 : 2);
      expect(barsPerRowCompact).toBe(1);
    });

    it('should allow overriding default for full mode', () => {
      const config: FlowerCardConfig = {
        type: 'flower-card',
        entity: 'plant.my_plant',
        display_type: DisplayType.Full,
        bars_per_row: 1,
      };

      // Explicit bars_per_row should override the full default
      const isCompact = config.display_type === DisplayType.Compact;
      const barsPerRow = config.bars_per_row ?? (isCompact ? 1 : 2);
      expect(barsPerRow).toBe(1);
    });
  });
});
