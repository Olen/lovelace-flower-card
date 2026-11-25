import { describe, it, expect } from 'vitest';
import { HassEntity } from 'home-assistant-js-websocket';
import { extraBarAttributes, validateExtraBars } from '../src/utils/extra-bars';
import { formatStateNumber } from '../src/utils/utils';

function entity(entity_id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity {
  return {
    entity_id, state, attributes,
    last_changed: '', last_updated: '', context: { id: '', parent_id: null, user_id: null },
  };
}

const states: Record<string, HassEntity> = {
  'sensor.reservoir': entity('sensor.reservoir', '42.5', { unit_of_measurement: '%', icon: 'mdi:cup-water', friendly_name: 'Reservoir' }),
  'sensor.pot_weight': entity('sensor.pot_weight', '1830', { unit_of_measurement: 'g' }),
  'sensor.offline': entity('sensor.offline', 'unavailable'),
  'sensor.consumption': entity('sensor.consumption', '5.2', { unit_of_measurement: 'L/100km' }),
  'sensor.blank': entity('sensor.blank', ''),
  'sensor.spaces': entity('sensor.spaces', '  '),
  'sensor.infinite': entity('sensor.infinite', 'Infinity'),
  'sensor.pump_runtime': entity('sensor.pump_runtime', '1.5', { unit_of_measurement: 'h', device_class: 'duration' }),
};
const english = { language: 'en', number_format: 'language' } as never;
const formatState = (state: HassEntity) => formatStateNumber(state, english, undefined);
const displayName = (state: HassEntity) => String(state.attributes.friendly_name ?? state.entity_id);

describe('extraBarAttributes', () => {
  it('builds a bar from the entity, with 0–100 and its own icon and name by default', () => {
    const [bar] = Object.values(extraBarAttributes([{ entity: 'sensor.reservoir' }], states, formatState, displayName));
    expect(bar).toEqual({
      name: 'extra_bar_0',
      label: 'Reservoir',
      current: 42.5,
      limits: { min: 0, max: 100 },
      icon: 'mdi:cup-water',
      sensor: 'sensor.reservoir',
      unit_of_measurement: '%',
      display_state: '42.5',
    });
  });

  it('uses the configured name, icon and range', () => {
    const [bar] = Object.values(extraBarAttributes(
      [{ entity: 'sensor.pot_weight', name: 'Weight', icon: 'mdi:scale', min: 900, max: 2500 }],
      states, formatState, displayName,
    ));
    expect(bar.label).toBe('Weight');
    expect(bar.icon).toBe('mdi:scale');
    expect(bar.limits).toEqual({ min: 900, max: 2500 });
    expect(bar.unit_of_measurement).toBe('g');
  });

  it('falls back to mdi:gauge without an entity icon', () => {
    const [bar] = Object.values(extraBarAttributes([{ entity: 'sensor.pot_weight' }], states, formatState, displayName));
    expect(bar.icon).toBe('mdi:gauge');
  });

  it('gives an unavailable bar for a non-numeric or missing entity', () => {
    const bars = Object.values(extraBarAttributes(
      [{ entity: 'sensor.offline' }, { entity: 'sensor.gone' }],
      states, formatState, displayName,
    ));
    expect(bars.map((bar) => Number.isNaN(bar.current))).toEqual([true, true]);
    expect(bars[1].label).toBe('sensor.gone');
    expect(bars[1].display_state).toBe('');
  });

  it('gives an unavailable bar for a blank or infinite state', () => {
    const bars = Object.values(extraBarAttributes(
      [{ entity: 'sensor.blank' }, { entity: 'sensor.spaces' }, { entity: 'sensor.infinite' }],
      states, formatState, displayName,
    ));
    expect(bars.map((bar) => Number.isNaN(bar.current))).toEqual([true, true, true]);
    expect(bars.map((bar) => bar.display_state)).toEqual(['', '', '']);
  });

  it('shows the value without digits from the unit', () => {
    const [bar] = Object.values(extraBarAttributes([{ entity: 'sensor.consumption' }], states, formatState, displayName));
    expect(bar.current).toBe(5.2);
    expect(bar.display_state).toBe('5.2');
    expect(bar.unit_of_measurement).toBe('L/100km');
  });

  it('shows a duration as a number in its own unit', () => {
    const [bar] = Object.values(extraBarAttributes([{ entity: 'sensor.pump_runtime' }], states, formatState, displayName));
    expect(bar.display_state).toBe('1.5');
    expect(bar.unit_of_measurement).toBe('h');
  });

  it('keeps the configured order', () => {
    const bars = extraBarAttributes(
      [{ entity: 'sensor.pot_weight' }, { entity: 'sensor.reservoir' }],
      states, formatState, displayName,
    );
    expect(Object.values(bars).map((bar) => bar.sensor)).toEqual(['sensor.pot_weight', 'sensor.reservoir']);
  });
});

describe('validateExtraBars', () => {
  it('accepts no bars and a valid list', () => {
    expect(() => validateExtraBars(undefined)).not.toThrow();
    expect(() => validateExtraBars([{ entity: 'sensor.reservoir', min: 20 }])).not.toThrow();
  });

  it('rejects a missing entity, non-numeric limits and an empty range', () => {
    expect(() => validateExtraBars({ entity: 'sensor.x' })).toThrow(/list/);
    expect(() => validateExtraBars([{ name: 'x' }])).toThrow(/extra_bars\[0\] needs an entity/);
    expect(() => validateExtraBars([{ entity: 'sensor.x', min: '20' }])).toThrow(/min must be a number/);
    expect(() => validateExtraBars([{ entity: 'sensor.x', min: 50, max: 50 }])).toThrow(/min \(50\) must be below max \(50\)/);
    expect(() => validateExtraBars([{ entity: 'sensor.x', min: 150 }])).toThrow(/max \(100\)/);
  });
});
