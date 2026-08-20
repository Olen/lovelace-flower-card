import { describe, it, expect } from 'vitest';
import {
  CARE_BADGE_TYPE,
  isCareBadge,
  resolveCareBadgeFields,
  computeCareDialogState,
  careBadgeVisual,
} from '../src/utils/attributes';
import { careFields } from '../src/utils/constants';
import { ExtraBadge } from '../src/types/flower-card-types';

const ALL = careFields.map(f => f.value);

describe('care badge logic', () => {
  describe('isCareBadge', () => {
    it('is true only for type care_info', () => {
      expect(isCareBadge({ type: CARE_BADGE_TYPE })).toBe(true);
      expect(isCareBadge({ type: 'care_info' })).toBe(true);
      expect(isCareBadge({ entity: 'sensor.x' })).toBe(false);
      expect(isCareBadge({ text: 'Hi' })).toBe(false);
      expect(isCareBadge({})).toBe(false);
    });
  });

  describe('resolveCareBadgeFields', () => {
    it('defaults to all care fields when fields omitted', () => {
      expect(resolveCareBadgeFields({ type: CARE_BADGE_TYPE })).toEqual(ALL);
    });
    it('returns the given subset when fields provided', () => {
      const badge: ExtraBadge = { type: CARE_BADGE_TYPE, fields: ['care_soil', 'care_watering'] };
      expect(resolveCareBadgeFields(badge)).toEqual(['care_soil', 'care_watering']);
    });
    it('passes an explicit empty array through (shows nothing)', () => {
      expect(resolveCareBadgeFields({ type: CARE_BADGE_TYPE, fields: [] })).toEqual([]);
    });
  });

  describe('computeCareDialogState', () => {
    it('opens with all fields and default title', () => {
      expect(computeCareDialogState({ type: CARE_BADGE_TYPE })).toEqual({
        open: true, fields: ALL, title: 'Care',
      });
    });
    it('translates the default title', () => {
      expect(computeCareDialogState({ type: CARE_BADGE_TYPE }, 'de').title).toBe('Pflege');
    });
    it('honors fields and title overrides', () => {
      const badge: ExtraBadge = { type: CARE_BADGE_TYPE, fields: ['care_watering'], title: 'Plant Care' };
      expect(computeCareDialogState(badge)).toEqual({
        open: true, fields: ['care_watering'], title: 'Plant Care',
      });
    });
  });

  describe('careBadgeVisual', () => {
    it('uses default icon, color and tip', () => {
      expect(careBadgeVisual({ type: CARE_BADGE_TYPE })).toEqual({
        icon: 'mdi:sprout', color: 'var(--secondary-text-color)', tip: 'Care',
      });
    });
    it('honors icon, color and title overrides', () => {
      const badge: ExtraBadge = { type: CARE_BADGE_TYPE, icon: 'mdi:leaf', color: 'green', title: 'Care Guide' };
      expect(careBadgeVisual(badge)).toEqual({
        icon: 'mdi:leaf', color: 'green', tip: 'Care Guide',
      });
    });
  });
});
