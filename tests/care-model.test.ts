import { describe, it, expect } from 'vitest';
import {
  buildCareRows,
  careDatesFromStates,
  careOfItem,
  CareInfo,
  CareMode,
  CareRow,
  CareRowInput,
  CareType,
  dueInDays,
  doneConfirmation,
  formatCareDate,
  initiallyExpanded,
  msUntilMidnight,
  predictionDays,
  progressFraction,
  readingsFromPlantInfo,
  rowKeysFromShowCare,
  RowKey,
  snoozedDue,
  statusLabel,
  TodoItem,
} from '../src/care/model';

const now = new Date(2026, 10, 23, 12, 0);
const PLANT = 'plant.plant_004';
const SEP = ' · ';

function careInfo(modes: Partial<Record<CareType, CareMode>> = {}, todoList: string | null = 'todo.plant_care'): CareInfo {
  return {
    todo_list: todoList,
    modes: { water: 'none', fertilize: 'none', repot: 'none', prune: 'none', ...modes },
    intervals: { water: 0, fertilize: 0, repot: 0, prune: 0 },
    events: { water: '', fertilize: '', repot: '', prune: '' },
    next_watering: null,
    marker_separator: SEP,
  };
}

function input(overrides: Partial<CareRowInput> = {}): CareRowInput {
  return {
    plantEntityId: PLANT,
    attributes: {},
    care: careInfo(),
    items: [],
    lastDone: {},
    nextWatering: null,
    readings: {},
    ...overrides,
  };
}

function item(careType: string, overrides: Partial<TodoItem> = {}): TodoItem {
  return {
    uid: `uid-${careType}`,
    summary: `Do ${careType}`,
    status: 'needs_action',
    description: `${PLANT}${SEP}${careType}`,
    ...overrides,
  };
}

function problems(...sensorTypes: string[]) {
  return { problems: sensorTypes.map((sensor_type) => ({ sensor_type, status: 'Low' })) };
}

function row(rows: CareRow[], key: RowKey): CareRow {
  const found = rows.find((r) => r.key === key);
  if (!found) {
    throw new Error(`no ${key} row`);
  }
  return found;
}

describe('careOfItem', () => {
  it('reads the care type from the marker', () => {
    expect(careOfItem(item('water'), PLANT, SEP)).toBe('water');
  });

  it('ignores plants whose id only shares a prefix', () => {
    const other = item('water', { description: `plant.plant_0040${SEP}water` });
    expect(careOfItem(other, PLANT, SEP)).toBeNull();
  });

  it('ignores unknown care types', () => {
    expect(careOfItem(item('weed'), PLANT, SEP)).toBeNull();
  });

  it('finds the marker on a later description line', () => {
    const multi = item('water', { description: `Remember the saucer\n${PLANT}${SEP}water` });
    expect(careOfItem(multi, PLANT, SEP)).toBe('water');
  });

  it('returns null without a description', () => {
    expect(careOfItem(item('water', { description: undefined }), PLANT, SEP)).toBeNull();
  });
});

describe('dueInDays', () => {
  it.each([
    ['2026-11-23', 0],
    ['2026-11-20', -3],
    ['2026-12-02', 9],
    ['2026-11-24T12:00:00+01:00', 1],
  ])('counts calendar days for %s', (due, expected) => {
    expect(dueInDays(due, now)).toBe(expected);
  });

  it('gives a date-only and a datetime due on the same day the same result', () => {
    const datetime = new Date(2026, 11, 2, 8, 0).toISOString();
    expect(dueInDays(datetime, now)).toBe(dueInDays('2026-12-02', now));
  });
});

describe('buildCareRows water', () => {
  it('W1 ignores items without a list', () => {
    const base = { care: careInfo({ water: 'interval' }, null), items: [item('water', { due: '2026-11-23' })] };
    const predicted = row(buildCareRows(input({ ...base, nextWatering: '2026-11-25T10:00:00+01:00' }), now), 'water');
    expect(predicted.done).toBeNull();
    expect(predicted.alert).toBe(false);
    expect(predicted.status).toEqual({ kind: 'prediction', at: '2026-11-25T10:00:00+01:00' });
    const plain = row(buildCareRows(input(base), now), 'water');
    expect(plain.status).toEqual({ kind: 'none' });
    expect(plain.done).toBeNull();
  });

  it('W2 sensor mode without item shows the prediction', () => {
    const water = row(
      buildCareRows(input({ care: careInfo({ water: 'sensor' }), nextWatering: '2026-11-25T10:00:00+01:00' }), now),
      'water',
    );
    expect(water.status).toEqual({ kind: 'prediction', at: '2026-11-25T10:00:00+01:00' });
    expect(water.alert).toBe(false);
    expect(water.done).toBeNull();
  });

  it('W3 sensor mode with moisture problem and due item is an alert without Done', () => {
    const water = row(
      buildCareRows(
        input({
          care: careInfo({ water: 'sensor' }),
          items: [item('water', { due: '2026-11-23' })],
          attributes: problems('moisture'),
        }),
        now,
      ),
      'water',
    );
    expect(water.alert).toBe(true);
    expect(water.status).toEqual({ kind: 'due_today' });
    expect(water.done).toBeNull();
  });

  it('W3 sensor mode with a moisture problem and no open item is an alert without Done', () => {
    const water = row(
      buildCareRows(
        input({
          care: careInfo({ water: 'sensor' }),
          attributes: problems('moisture'),
          nextWatering: '2026-11-25T10:00:00+01:00',
        }),
        now,
      ),
      'water',
    );
    expect(water.alert).toBe(true);
    expect(water.status).toEqual({ kind: 'prediction', at: '2026-11-25T10:00:00+01:00' });
    expect(water.done).toBeNull();
  });

  it('W4 interval mode offers a solid Done when due today', () => {
    const care = careInfo({ water: 'interval' });
    care.intervals.water = 7;
    const water = row(buildCareRows(input({ care, items: [item('water', { due: '2026-11-23' })] }), now), 'water');
    expect(water.done).toEqual({ uids: ['uid-water'], emphasis: 'solid' });
    expect(water.intervalDays).toBe(7);
  });

  it('an open item without due gives no status', () => {
    const water = row(buildCareRows(input({ care: careInfo({ water: 'interval' }), items: [item('water')] }), now), 'water');
    expect(water.status).toEqual({ kind: 'none' });
    expect(water.done).toEqual({ uids: ['uid-water'], emphasis: 'outlined' });
  });
});

describe('buildCareRows fertilize', () => {
  it('F2 interval not yet due is outlined and not an alert', () => {
    const fertilize = row(
      buildCareRows(input({ care: careInfo({ fertilize: 'interval' }), items: [item('fertilize', { due: '2026-12-02' })] }), now),
      'fertilize',
    );
    expect(fertilize.status).toEqual({ kind: 'due', days: 9, date: '2026-12-02' });
    expect(fertilize.done?.emphasis).toBe('outlined');
    expect(fertilize.alert).toBe(false);
  });

  it('F3 overdue is an alert with a solid Done', () => {
    const fertilize = row(
      buildCareRows(input({ care: careInfo({ fertilize: 'interval' }), items: [item('fertilize', { due: '2026-11-20' })] }), now),
      'fertilize',
    );
    expect(fertilize.status).toEqual({ kind: 'overdue', days: 3 });
    expect(fertilize.alert).toBe(true);
    expect(fertilize.done?.emphasis).toBe('solid');
  });

  it('F4 mode none takes last done from a completed item', () => {
    const completed = item('fertilize', { status: 'completed', completed: '2026-10-30T09:00:00+01:00' });
    const fertilize = row(buildCareRows(input({ items: [completed] }), now), 'fertilize');
    expect(fertilize.lastDone).toBe('2026-10-30T09:00:00+01:00');
    expect(fertilize.done).toBeNull();
  });

  it('F5 sensor mode with conductivity problem and due item alerts without Done', () => {
    const fertilize = row(
      buildCareRows(
        input({
          care: careInfo({ fertilize: 'sensor' }),
          items: [item('fertilize', { due: '2026-11-23' })],
          attributes: problems('conductivity'),
        }),
        now,
      ),
      'fertilize',
    );
    expect(fertilize.alert).toBe(true);
    expect(fertilize.done).toBeNull();
  });

  it('F6 sensor mode without item has no status and no alert', () => {
    const fertilize = row(buildCareRows(input({ care: careInfo({ fertilize: 'sensor' }) }), now), 'fertilize');
    expect(fertilize.status).toEqual({ kind: 'none' });
    expect(fertilize.alert).toBe(false);
  });

  it('collects every open item of the type for Done', () => {
    const items = [
      item('fertilize', { uid: 'a', due: '2026-11-25' }),
      item('fertilize', { uid: 'b', due: '2026-11-22' }),
    ];
    const fertilize = row(buildCareRows(input({ care: careInfo({ fertilize: 'interval' }), items }), now), 'fertilize');
    expect(fertilize.done?.uids).toEqual(['a', 'b']);
    expect(fertilize.status).toEqual({ kind: 'overdue', days: 1 });
  });
});

describe('buildCareRows light, soil and prune', () => {
  it('shows light with its text and alerts on a dli problem', () => {
    const light = row(buildCareRows(input({ attributes: { care_sunlight: 'Bright', ...problems('dli') } }), now), 'light');
    expect(light.alert).toBe(true);
    expect(light.texts).toEqual(['Bright']);
    expect(light.status).toEqual({ kind: 'none' });
    expect(light.done).toBeNull();
  });

  it('hides light without text and problem', () => {
    const keys = buildCareRows(input(), now).map((r) => r.key);
    expect(keys).not.toContain('light');
  });

  it('shows soil text and never alerts', () => {
    const everything = problems('moisture', 'conductivity', 'illuminance', 'dli');
    const soil = row(buildCareRows(input({ attributes: { care_soil: 'Loose', ...everything } }), now), 'soil');
    expect(soil.texts).toEqual(['Loose']);
    expect(soil.alert).toBe(false);
  });

  it('hides soil without text', () => {
    expect(buildCareRows(input(), now).map((r) => r.key)).not.toContain('soil');
  });

  it('hides prune without text, mode, last done or item', () => {
    expect(buildCareRows(input(), now).map((r) => r.key)).toEqual(['water', 'fertilize', 'repot']);
  });

  it.each([
    ['text', input({ attributes: { care_pruning: 'In spring' } })],
    ['interval mode', input({ care: careInfo({ prune: 'interval' }) })],
    ['open item', input({ items: [item('prune')] })],
    ['last done', input({ lastDone: { prune: '2026-10-01T10:00:00+02:00' } })],
  ])('shows prune with %s', (_name, rowInput) => {
    expect(buildCareRows(rowInput, now).map((r) => r.key)).toContain('prune');
  });

  it('keeps fixed order', () => {
    const attributes = { care_pruning: 'a', care_sunlight: 'b', care_soil: 'c' };
    expect(buildCareRows(input({ attributes }), now).map((r) => r.key)).toEqual([
      'water',
      'fertilize',
      'repot',
      'prune',
      'light',
      'soil',
    ]);
  });
});

describe('buildCareRows without care block', () => {
  it('shows text only, no status and no Done', () => {
    const attributes = { care_watering: 'Weekly', care_soil: 'Loose' };
    const rows = buildCareRows(input({ care: null, attributes, items: [item('water', { due: '2026-11-20' })] }), now);
    expect(rows.length).toBeLessThanOrEqual(6);
    expect(row(rows, 'water').texts).toEqual(['Weekly']);
    for (const r of rows) {
      expect(r.done).toBeNull();
      expect(r.snooze).toBeNull();
      expect(r.status).toEqual({ kind: 'none' });
    }
  });
});

describe('last done', () => {
  it('stays null for a completed item without completed timestamp', () => {
    const completed = item('water', { status: 'completed' });
    expect(row(buildCareRows(input({ items: [completed] }), now), 'water').lastDone).toBeNull();
  });

  it('prefers the event value over a completed item', () => {
    const completed = item('water', { status: 'completed', completed: '2026-10-30T09:00:00+01:00' });
    const water = row(
      buildCareRows(input({ items: [completed], lastDone: { water: '2026-11-20T08:00:00+01:00' } }), now),
      'water',
    );
    expect(water.lastDone).toBe('2026-11-20T08:00:00+01:00');
  });

  it('ignores a completed item with an unparsable timestamp', () => {
    const items = [
      item('water', { uid: 'bad', status: 'completed', completed: 'not a date' }),
      item('water', { uid: 'good', status: 'completed', completed: '2026-11-01T09:00:00+01:00' }),
    ];
    const water = row(buildCareRows(input({ care: careInfo({ water: 'interval' }), items }), now), 'water');
    expect(water.lastDone).toBe('2026-11-01T09:00:00+01:00');
  });

  it('treats an open item with an unparsable due as having no due', () => {
    const items = [item('water', { due: 'garbage' })];
    const water = row(buildCareRows(input({ care: careInfo({ water: 'interval' }), items }), now), 'water');
    expect(water.status).toEqual({ kind: 'none' });
    expect(water.done).toEqual({ uids: ['uid-water'], emphasis: 'outlined' });
    expect(water.snooze).toBeNull();
  });

  it('uses the newest completed item', () => {
    const items = [
      item('water', { uid: 'old', status: 'completed', completed: '2026-10-01T09:00:00+01:00' }),
      item('water', { uid: 'new', status: 'completed', completed: '2026-11-01T09:00:00+01:00' }),
    ];
    expect(row(buildCareRows(input({ items }), now), 'water').lastDone).toBe('2026-11-01T09:00:00+01:00');
  });
});

describe('progress and snooze on rows', () => {
  it('sets progress on interval rows with last done and due', () => {
    const water = row(
      buildCareRows(
        input({
          care: careInfo({ water: 'interval' }),
          items: [item('water', { due: '2026-12-02' })],
          lastDone: { water: '2026-11-17' },
        }),
        now,
      ),
      'water',
    );
    expect(water.progress).toBeCloseTo(0.4);
  });

  it('leaves progress null in sensor mode', () => {
    const water = row(
      buildCareRows(
        input({
          care: careInfo({ water: 'sensor' }),
          items: [item('water', { due: '2026-12-02' })],
          lastDone: { water: '2026-11-17' },
        }),
        now,
      ),
      'water',
    );
    expect(water.progress).toBeNull();
  });

  it.each([
    ['interval', '2026-11-25', true],
    ['interval', '2026-11-26', false],
    ['interval', '2026-11-20', true],
    ['sensor', '2026-11-25', true],
    ['sensor', '2026-11-26', false],
    ['sensor', '2026-11-20', true],
  ] as const)('snooze in %s mode with due %s is set: %s', (mode, due, expectSet) => {
    const rows = buildCareRows(input({ care: careInfo({ water: mode }), items: [item('water', { due })] }), now);
    const snooze = row(rows, 'water').snooze;
    if (expectSet) {
      expect(snooze).toEqual({ uids: ['uid-water'], due });
    } else {
      expect(snooze).toBeNull();
    }
  });

  it('has no snooze without a list', () => {
    const rows = buildCareRows(
      input({ care: careInfo({ water: 'interval' }, null), items: [item('water', { due: '2026-11-20' })] }),
      now,
    );
    expect(row(rows, 'water').snooze).toBeNull();
  });

  it('snoozes repot rows too', () => {
    const rows = buildCareRows(input({ items: [item('repot', { due: '2026-11-23' })] }), now);
    expect(row(rows, 'repot').snooze).not.toBeNull();
  });
});

describe('progressFraction', () => {
  it('measures elapsed days of the interval', () => {
    expect(progressFraction('2026-11-17', '2026-12-02', now)).toBeCloseTo(0.4);
  });

  it('is 1 when due has passed', () => {
    expect(progressFraction('2026-11-01', '2026-11-20', now)).toBe(1);
  });

  it('is null when either date is missing', () => {
    expect(progressFraction(null, '2026-12-02', now)).toBeNull();
    expect(progressFraction('2026-11-17', null, now)).toBeNull();
  });
});

describe('snoozedDue', () => {
  it('counts from today when overdue', () => {
    expect(snoozedDue('2026-11-20', 3, now)).toBe('2026-11-26');
  });

  it('counts from the current due when in the future', () => {
    expect(snoozedDue('2026-12-02', 1, now)).toBe('2026-12-03');
  });

  it('counts from today without a due', () => {
    expect(snoozedDue(null, 7, now)).toBe('2026-11-30');
  });
});

describe('msUntilMidnight', () => {
  it('counts to local midnight', () => {
    expect(msUntilMidnight(new Date(2026, 10, 23, 23, 59, 30))).toBe(30000);
  });
});

describe('initiallyExpanded', () => {
  it('is false only for compact', () => {
    expect(initiallyExpanded('compact')).toBe(false);
    expect(initiallyExpanded('full')).toBe(true);
    expect(initiallyExpanded(undefined)).toBe(true);
  });
});

describe('formatCareDate', () => {
  it('formats a date-only value as day and short month', () => {
    expect(formatCareDate('2026-12-02', 'en-GB')).toBe('2 Dec');
  });

  it('formats a timestamp by its local calendar day', () => {
    const local = new Date(2026, 11, 2, 23, 30).toISOString();
    expect(formatCareDate(local, 'en-GB')).toBe('2 Dec');
  });
});

describe('predictionDays', () => {
  it('counts calendar days until the predicted time', () => {
    expect(predictionDays(new Date(2026, 10, 26, 8, 0).toISOString(), now)).toBe(3);
  });

  it('is zero when the prediction is already in the past', () => {
    expect(predictionDays(new Date(2026, 10, 20, 8, 0).toISOString(), now)).toBe(0);
  });
});

describe('careDatesFromStates', () => {
  function withEvents(): CareInfo {
    return {
      ...careInfo(),
      events: {
        water: 'event.plant_004_watered',
        fertilize: 'event.plant_004_fertilized',
        repot: 'event.plant_004_repotted',
        prune: 'event.plant_004_pruned',
      },
      next_watering: 'sensor.plant_004_next_watering',
    };
  }

  it('takes last done and next watering from timestamp states', () => {
    const states = {
      'event.plant_004_watered': { state: '2026-11-20T08:15:00.000+00:00' },
      'event.plant_004_fertilized': { state: '2026-11-01T10:00:00.000+00:00' },
      'sensor.plant_004_next_watering': { state: '2026-11-26T06:00:00+00:00' },
    };
    expect(careDatesFromStates(withEvents(), states)).toEqual({
      lastDone: { water: '2026-11-20T08:15:00.000+00:00', fertilize: '2026-11-01T10:00:00.000+00:00' },
      nextWatering: '2026-11-26T06:00:00+00:00',
    });
  });

  it('ignores unknown and unavailable states', () => {
    const states = {
      'event.plant_004_watered': { state: 'unknown' },
      'event.plant_004_fertilized': { state: 'unavailable' },
      'sensor.plant_004_next_watering': { state: 'unavailable' },
    };
    expect(careDatesFromStates(withEvents(), states)).toEqual({ lastDone: {}, nextWatering: null });
  });

  it('has no dates without a care block', () => {
    expect(careDatesFromStates(null, {})).toEqual({ lastDone: {}, nextWatering: null });
  });

  it('has no next watering when plant names no sensor for it', () => {
    expect(careDatesFromStates(careInfo(), {})).toEqual({ lastDone: {}, nextWatering: null });
  });
});

describe('doneConfirmation', () => {
  function rowWith(overrides: Partial<CareRow>): CareRow {
    return {
      key: 'fertilize',
      alert: false,
      status: { kind: 'none' },
      lastDone: null,
      intervalDays: 14,
      texts: [],
      done: null,
      snooze: null,
      progress: null,
      reading: null,
      ...overrides,
    };
  }

  it('asks with the due date when an outlined Done is pressed before the due date', () => {
    const early = rowWith({ status: { kind: 'due', days: 9, date: '2026-12-02' }, done: { uids: ['a'], emphasis: 'outlined' } });
    expect(doneConfirmation(early)).toEqual({ date: '2026-12-02' });
  });

  it('does not ask for a solid Done', () => {
    const due = rowWith({ status: { kind: 'overdue', days: 3 }, done: { uids: ['a'], emphasis: 'solid' } });
    expect(doneConfirmation(due)).toBeNull();
  });

  it('asks without a date when the open item has no due date', () => {
    const undated = rowWith({ status: { kind: 'none' }, done: { uids: ['a'], emphasis: 'outlined' } });
    expect(doneConfirmation(undated)).toEqual({ date: null });
  });

  it('asks without a date when the row shows a watering prediction instead of a due date', () => {
    const predicted = rowWith({ status: { kind: 'prediction', at: '2026-11-26T06:00:00+00:00' }, done: { uids: ['a'], emphasis: 'outlined' } });
    expect(doneConfirmation(predicted)).toEqual({ date: null });
  });
});

describe('statusLabel', () => {
  it('has no label without a status', () => {
    expect(statusLabel({ kind: 'none' }, now)).toBeNull();
  });

  it('says dry today for a prediction of zero days', () => {
    expect(statusLabel({ kind: 'prediction', at: new Date(2026, 10, 23, 20, 0).toISOString() }, now))
      .toEqual({ key: 'care_status_prediction_today' });
  });

  it('uses the singular for a prediction of one day', () => {
    expect(statusLabel({ kind: 'prediction', at: new Date(2026, 10, 24, 8, 0).toISOString() }, now))
      .toEqual({ key: 'care_status_prediction_one', date: new Date(2026, 10, 24, 8, 0).toISOString() });
  });

  it('counts days for a longer prediction', () => {
    expect(statusLabel({ kind: 'prediction', at: new Date(2026, 10, 26, 8, 0).toISOString() }, now))
      .toEqual({ key: 'care_status_prediction', n: 3, date: new Date(2026, 10, 26, 8, 0).toISOString() });
  });

  it('says tomorrow for a due date one day away', () => {
    expect(statusLabel({ kind: 'due', days: 1, date: '2026-11-24' }, now))
      .toEqual({ key: 'care_status_due_tomorrow', date: '2026-11-24' });
  });

  it('counts days for a later due date', () => {
    expect(statusLabel({ kind: 'due', days: 9, date: '2026-12-02' }, now))
      .toEqual({ key: 'care_status_due', n: 9, date: '2026-12-02' });
  });

  it('says due today', () => {
    expect(statusLabel({ kind: 'due_today' }, now)).toEqual({ key: 'care_status_due_today' });
  });

  it('counts overdue days', () => {
    expect(statusLabel({ kind: 'overdue', days: 3 }, now)).toEqual({ key: 'care_status_overdue', n: 3 });
  });
});

describe('readingsFromPlantInfo', () => {
  it('takes moisture and conductivity readings from the plant info', () => {
    const result = {
      moisture: { current: 18, min: 15, max: 60, unit_of_measurement: '%', icon: 'mdi:water', sensor: 'sensor.m' },
      conductivity: { current: '164', min: 350, max: 2000, unit_of_measurement: 'μS/cm', icon: 'mdi:spa', sensor: 'sensor.c' },
      temperature: { current: 21, min: 10, max: 30, unit_of_measurement: '°C', icon: 'mdi:t', sensor: 'sensor.t' },
    };
    expect(readingsFromPlantInfo(result)).toEqual({
      moisture: { current: 18, min: 15, max: 60, unit: '%' },
      conductivity: { current: 164, min: 350, max: 2000, unit: 'μS/cm' },
    });
  });

  it('has no reading for a sensor the plant does not have', () => {
    expect(readingsFromPlantInfo({})).toEqual({});
  });

  it('drops a reading whose numbers do not parse', () => {
    const result = {
      moisture: { current: 'unavailable', min: 15, max: 60, unit_of_measurement: '%' },
      conductivity: { current: 164, min: null, max: 2000, unit_of_measurement: 'μS/cm' },
    };
    expect(readingsFromPlantInfo(result)).toEqual({});
  });
});

describe('readings on rows', () => {
  it('shows moisture on Water and conductivity on Fertilize', () => {
    const rows = buildCareRows(input({
      readings: {
        moisture: { current: 18, min: 15, max: 60, unit: '%' },
        conductivity: { current: 164, min: 350, max: 2000, unit: 'μS/cm' },
      },
    }), now);
    expect(row(rows, 'water').reading).toEqual({ value: 18, min: 15, unit: '%', barFraction: 3 / 45 });
    expect(row(rows, 'fertilize').reading).toEqual({ value: 164, min: 350, unit: 'μS/cm', barFraction: 0 });
    expect(row(rows, 'repot').reading).toBeNull();
  });

  it('has no reading without the sensor', () => {
    expect(row(buildCareRows(input(), now), 'water').reading).toBeNull();
  });

  it('clamps the bar fraction at both ends', () => {
    const above = buildCareRows(input({ readings: { moisture: { current: 80, min: 15, max: 60, unit: '%' } } }), now);
    const below = buildCareRows(input({ readings: { moisture: { current: 5, min: 15, max: 60, unit: '%' } } }), now);
    expect(row(above, 'water').reading?.barFraction).toBe(1);
    expect(row(below, 'water').reading?.barFraction).toBe(0);
  });

  it('has no bar when min and max leave no range', () => {
    const flat = buildCareRows(input({ readings: { moisture: { current: 20, min: 20, max: 20, unit: '%' } } }), now);
    expect(row(flat, 'water').reading?.barFraction).toBeNull();
  });
});

describe('rowKeysFromShowCare', () => {
  it('shows every area when show_care is omitted', () => {
    expect(rowKeysFromShowCare(undefined)).toEqual(new Set(['water', 'fertilize', 'repot', 'prune', 'light', 'soil']));
  });

  it('shows only the chosen areas', () => {
    expect(rowKeysFromShowCare(['care_watering', 'care_repotting'])).toEqual(new Set(['water', 'repot']));
  });

  it('ignores the order of the config', () => {
    expect(rowKeysFromShowCare(['care_soil', 'care_fertilization', 'care_sunlight']))
      .toEqual(rowKeysFromShowCare(['care_fertilization', 'care_sunlight', 'care_soil']));
  });

  it('rejects an unknown value and names it', () => {
    expect(() => rowKeysFromShowCare(['care_watering', 'care_misting'])).toThrow(/care_misting/);
  });

  it('rejects a name that only exists on plain objects', () => {
    expect(() => rowKeysFromShowCare(['toString'])).toThrow(/toString/);
  });

  it('lists the valid values when rejecting', () => {
    expect(() => rowKeysFromShowCare(['care_misting'])).toThrow(/care_watering.*care_soil/);
  });
});
