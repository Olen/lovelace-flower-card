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
});
