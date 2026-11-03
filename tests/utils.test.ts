import { describe, it, expect } from 'vitest';
import { entityDisplayName, shouldEnableImageLightbox } from '../src/utils/utils';
import type { HomeAssistant } from 'custom-card-helpers';
import type { HassEntity } from 'home-assistant-js-websocket';

describe('shouldEnableImageLightbox', () => {
  it('is true when not hidden and a real URL is present', () => {
    expect(shouldEnableImageLightbox(false, 'https://example.com/plant.jpg')).toBe(true);
    expect(shouldEnableImageLightbox(false, '/local/plant.jpg')).toBe(true);
  });
  it('is false when the image is hidden, even with a URL', () => {
    expect(shouldEnableImageLightbox(true, 'https://example.com/plant.jpg')).toBe(false);
  });
  it('is false when there is no resolved URL', () => {
    expect(shouldEnableImageLightbox(false, undefined)).toBe(false);
    expect(shouldEnableImageLightbox(false, '')).toBe(false);
  });
});

describe('entityDisplayName', () => {
  const stateObj = {
    entity_id: 'plant.monstera',
    attributes: { friendly_name: 'Old friendly name' },
  } as unknown as HassEntity;
  const withFormatter = {
    formatEntityName: (s: HassEntity) => `formatted ${s.entity_id}`,
  } as unknown as HomeAssistant;
  const withoutFormatter = {} as HomeAssistant;

  it('uses the configured name over everything', () => {
    expect(entityDisplayName(withFormatter, stateObj, 'Mine')).toBe('Mine');
  });
  it('uses formatEntityName when HA provides it', () => {
    expect(entityDisplayName(withFormatter, stateObj)).toBe('formatted plant.monstera');
    expect(entityDisplayName(withFormatter, stateObj, '')).toBe('formatted plant.monstera');
  });
  it('falls back to friendly_name, then the entity id, on older HA', () => {
    expect(entityDisplayName(withoutFormatter, stateObj)).toBe('Old friendly name');
    const unnamed = { entity_id: 'plant.x', attributes: {} } as unknown as HassEntity;
    expect(entityDisplayName(withoutFormatter, unnamed)).toBe('plant.x');
  });
});
