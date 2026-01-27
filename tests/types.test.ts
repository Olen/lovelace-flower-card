import { describe, it, expect } from 'vitest';
import { DisplayType } from '../src/types/flower-card-types';

describe('types', () => {
  describe('DisplayType', () => {
    it('should have Full and Compact variants', () => {
      expect(DisplayType.Full).toBe('full');
      expect(DisplayType.Compact).toBe('compact');
    });

    it('should only have two display types', () => {
      const displayTypes = Object.values(DisplayType);
      expect(displayTypes).toHaveLength(2);
    });
  });
});
