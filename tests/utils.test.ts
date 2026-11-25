import { describe, it, expect } from 'vitest';
import { entityDisplayName, formatStateNumber, nameSelector, numericState, shouldEnableImageLightbox, supportsNameItems } from '../src/utils/utils';
import { NumberFormat, TimeFormat } from 'custom-card-helpers';
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

describe('name parts', () => {
  const stateObj = {
    entity_id: 'plant.monstera',
    attributes: { friendly_name: 'Old friendly name' },
  } as unknown as HassEntity;
  const hassOn = (version: string) => ({
    config: { version },
    formatEntityName: (s: HassEntity, name?: unknown) =>
      name === undefined ? `default ${s.entity_id}` : `parts ${JSON.stringify(name)}`,
  }) as unknown as HomeAssistant;
  const parts = [{ type: 'area' }, { type: 'device' }] as const;

  it('passes a list of parts to formatEntityName on HA 2025.11+', () => {
    expect(entityDisplayName(hassOn('2025.11.0'), stateObj, [...parts]))
      .toBe('parts [{"type":"area"},{"type":"device"}]');
    expect(entityDisplayName(hassOn('2026.11.0b3'), stateObj, [...parts]))
      .toBe('parts [{"type":"area"},{"type":"device"}]');
  });
  it('passes a single part on HA 2025.11+', () => {
    expect(entityDisplayName(hassOn('2026.1.2'), stateObj, { type: 'area' })).toBe('parts {"type":"area"}');
  });
  it('shows the default name for parts on older HA', () => {
    expect(entityDisplayName(hassOn('2025.10.4'), stateObj, [...parts])).toBe('default plant.monstera');
  });
  it('keeps a text name as typed', () => {
    expect(entityDisplayName(hassOn('2026.11.0'), stateObj, 'Monstera')).toBe('Monstera');
  });
  it('knows which HA versions understand name parts', () => {
    expect(supportsNameItems('2025.11.0')).toBe(true);
    expect(supportsNameItems('2026.1.0')).toBe(true);
    expect(supportsNameItems('2026.11.0.dev20261101')).toBe(true);
    expect(supportsNameItems('2025.10.9')).toBe(false);
    expect(supportsNameItems('2024.12.0')).toBe(false);
    expect(supportsNameItems(undefined)).toBe(false);
  });
  it('offers the name picker only where HA has it', () => {
    expect(nameSelector('2025.11.0')).toEqual({
      name: 'name', selector: { entity_name: {} }, context: { entity: 'entity' },
    });
    expect(nameSelector('2025.10.0')).toEqual({ name: 'name', selector: { text: {} } });
    expect(nameSelector(undefined)).toEqual({ name: 'name', selector: { text: {} } });
  });
});

describe('numericState', () => {
  const withState = (state: string) => ({ entity_id: 'sensor.x', state, attributes: {} }) as unknown as HassEntity;

  it('reads a number', () => {
    expect(numericState(withState('42.5'))).toBe(42.5);
    expect(numericState(withState('-3'))).toBe(-3);
  });

  it('is NaN for blank, non-numeric and infinite states', () => {
    for (const state of ['', '  ', 'unavailable', 'unknown', 'Infinity', '-Infinity']) {
      expect(numericState(withState(state))).toBeNaN();
    }
  });
});

describe('formatStateNumber', () => {
  const withState = (state: string) => ({ entity_id: 'sensor.x', state, attributes: {} }) as unknown as HassEntity;
  const english = { language: 'en', number_format: NumberFormat.language, time_format: TimeFormat.language };
  const decimalComma = { language: 'en', number_format: NumberFormat.decimal_comma, time_format: TimeFormat.language };

  it('keeps the decimals of the state without a display precision', () => {
    expect(formatStateNumber(withState('5.20'), english, undefined)).toBe('5.20');
    expect(formatStateNumber(withState('1830'), english, null)).toBe('1,830');
  });

  it('rounds to the display precision', () => {
    expect(formatStateNumber(withState('21.456'), english, 1)).toBe('21.5');
    expect(formatStateNumber(withState('21'), english, 2)).toBe('21.00');
  });

  it("uses the user's number format", () => {
    expect(formatStateNumber(withState('1234.5'), decimalComma, undefined)).toBe('1.234,5');
  });
});
