import { describe, it, expect } from 'vitest';
import { HassEntity } from 'home-assistant-js-websocket';
import { extraBarAttributes, validateExtraBars } from '../src/utils/extra-bars';

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
};
const formatState = (state: HassEntity) => `${state.state} ${state.attributes.unit_of_measurement ?? ''}`;
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
