import { describe, it, expect } from 'vitest';
import {
  agendaCareTypes,
  agendaSummary,
  agendaTasks,
  AgendaTask,
  bulkWaterTasks,
  dueGroup,
  groupByArea,
  groupByDue,
  plantArea,
  plantsInScope,
  PlantRows,
  Registry,
  validateAgendaOptions,
} from '../src/care/agenda';
import { CareRow, RowKey } from '../src/care/model';

const now = new Date(2026, 10, 23, 12, 0);

const registry: Registry = {
  entities: {
    'plant.monstera': { area_id: 'stue', labels: [] },
    'plant.basil': { device_id: 'dev_basil', labels: ['herbs'] },
    'plant.pilea': { area_id: null, device_id: 'dev_pilea', labels: ['ingen_plantevarsler'] },
    'plant.loose': { labels: [] },
  },
  devices: {
    dev_basil: { area_id: 'kjokken' },
    dev_pilea: { area_id: 'kontor' },
  },
  areas: {
    stue: { name: 'Stue', floor_id: 'ground' },
    kjokken: { name: 'Kjøkken', floor_id: 'ground' },
    kontor: { name: 'Kontoret', floor_id: 'upstairs' },
  },
};

const ALL = ['plant.monstera', 'plant.basil', 'plant.pilea', 'plant.loose', 'sensor.monstera_moisture'];

function row(key: RowKey, status: CareRow['status'], extra: Partial<CareRow> = {}): CareRow {
  return {
    key, alert: false, status, lastDone: null, intervalDays: null, texts: [],
    done: null, snooze: null, progress: null, reading: null, ...extra,
  };
}

function task(name: string, days: number, area: string | null, key: RowKey = 'water', extra: Partial<CareRow> = {}): AgendaTask {
  return { plant: `plant.${name}`, name, names: [name], area, days, row: row(key, { kind: 'due_today' }, extra) };
}

describe('plantArea', () => {
  it('uses the entity area first', () => {
    expect(plantArea('plant.monstera', registry)).toBe('stue');
  });
  it('falls back to the device area', () => {
    expect(plantArea('plant.basil', registry)).toBe('kjokken');
    expect(plantArea('plant.pilea', registry)).toBe('kontor');
  });
  it('is null without an area or a registry entry', () => {
    expect(plantArea('plant.loose', registry)).toBeNull();
    expect(plantArea('plant.unknown', registry)).toBeNull();
  });
});

describe('plantsInScope', () => {
  it('returns every plant without filters, and only plants', () => {
    expect(plantsInScope(ALL, registry, {})).toEqual(['plant.monstera', 'plant.basil', 'plant.pilea', 'plant.loose']);
  });
  it('filters by area, floor and label', () => {
    expect(plantsInScope(ALL, registry, { area: 'kjokken' })).toEqual(['plant.basil']);
    expect(plantsInScope(ALL, registry, { floor: 'ground' })).toEqual(['plant.monstera', 'plant.basil']);
    expect(plantsInScope(ALL, registry, { label: 'herbs' })).toEqual(['plant.basil']);
  });
  it('combines filters', () => {
    expect(plantsInScope(ALL, registry, { floor: 'ground', label: 'herbs' })).toEqual(['plant.basil']);
    expect(plantsInScope(ALL, registry, { area: 'stue', label: 'herbs' })).toEqual([]);
  });
  it('drops plants with the excluded label', () => {
    expect(plantsInScope(ALL, registry, { exclude_label: 'ingen_plantevarsler' })).toEqual(['plant.monstera', 'plant.basil', 'plant.loose']);
  });
});

describe('agendaCareTypes and validateAgendaOptions', () => {
  it('defaults to all four care types', () => {
    expect([...agendaCareTypes(undefined)]).toEqual(['water', 'fertilize', 'repot', 'prune']);
    expect([...agendaCareTypes([])]).toEqual(['water', 'fertilize', 'repot', 'prune']);
  });
  it('maps show_care values', () => {
    expect([...agendaCareTypes(['care_pruning', 'care_watering'])]).toEqual(['prune', 'water']);
  });
  it('rejects advice areas and unknown values', () => {
    expect(() => agendaCareTypes(['care_sunlight'])).toThrow(/care_sunlight/);
  });
  it('rejects a bad group_by or days', () => {
    expect(() => validateAgendaOptions({ group_by: 'room' })).toThrow(/room/);
    expect(() => validateAgendaOptions({ days: 0 })).toThrow(/days/);
    expect(() => validateAgendaOptions({ days: 2.5 })).toThrow(/days/);
    expect(() => validateAgendaOptions({ group_by: 'area', days: 14 })).not.toThrow();
  });
});

describe('agendaTasks', () => {
  const plants: PlantRows[] = [
    {
      plant: 'plant.monstera', name: 'Monstera', area: 'stue', rows: [
        row('water', { kind: 'prediction', at: '2026-11-26T10:00:00+01:00' }),
        row('fertilize', { kind: 'overdue', days: 2 }),
        row('light', { kind: 'none' }, { alert: true }),
        row('repot', { kind: 'none' }),
      ],
    },
    {
      plant: 'plant.basil', name: 'Basilikum', area: 'kjokken', rows: [
        row('water', { kind: 'due_today' }),
        row('prune', { kind: 'due', days: 9, date: '2026-12-02' }),
      ],
    },
  ];
  const all = agendaTasks(plants, agendaCareTypes(undefined), true, true, now);

  it('merges plants, soonest first, leaving out advice rows and rows with nothing to do', () => {
    expect(all.map((t) => `${t.name}:${t.row.key}:${t.days}`)).toEqual([
      'Monstera:fertilize:-2', 'Basilikum:water:0', 'Monstera:water:3', 'Basilikum:prune:9',
    ]);
  });
  it('can hide predictions', () => {
    const tasks = agendaTasks(plants, agendaCareTypes(undefined), false, true, now);
    expect(tasks.map((t) => t.row.key)).toEqual(['fertilize', 'water', 'prune']);
  });
  it('limits care types', () => {
    const tasks = agendaTasks(plants, agendaCareTypes(['care_watering']), true, true, now);
    expect(tasks.map((t) => t.name)).toEqual(['Basilikum', 'Monstera']);
  });
  it('orders equal days by care type, then plant name', () => {
    const same: PlantRows[] = [
      { plant: 'plant.b', name: 'B', area: null, rows: [row('fertilize', { kind: 'due_today' }), row('water', { kind: 'due_today' })] },
      { plant: 'plant.a', name: 'A', area: null, rows: [row('fertilize', { kind: 'due_today' })] },
    ];
    const tasks = agendaTasks(same, agendaCareTypes(undefined), true, true, now);
    expect(tasks.map((t) => `${t.name}:${t.row.key}`)).toEqual(['B:water', 'A:fertilize', 'B:fertilize']);
  });
});

describe('grouping', () => {
  const tasks = [
    task('pilea', -1, 'kontor'),
    task('basil', 0, 'kjokken'),
    task('monstera', 0, 'stue'),
    task('chili', 1, 'kjokken'),
    task('ficus', 5, null),
    task('rosemary', 9, 'kjokken'),
  ];

  it('puts days into due groups', () => {
    expect([-3, 0, 1, 2, 7].map(dueGroup)).toEqual(['overdue', 'today', 'tomorrow', 'week', 'week']);
  });
  it('groups by due within the horizon and folds the rest', () => {
    const { groups, later } = groupByDue(tasks, 7);
    expect(groups.map((g) => `${g.key}:${g.tasks.map((t) => t.name).join(',')}`)).toEqual([
      'overdue:pilea', 'today:basil,monstera', 'tomorrow:chili', 'week:ficus',
    ]);
    expect(later.map((t) => t.name)).toEqual(['rosemary']);
  });
  it('leaves out empty due groups', () => {
    expect(groupByDue([task('a', 4, null)], 7).groups.map((g) => g.key)).toEqual(['week']);
  });
  it('groups by area name with plants without an area last', () => {
    const names: Record<string, string> = { stue: 'Stue', kjokken: 'Kjøkken', kontor: 'Kontoret' };
    const { groups } = groupByArea(tasks, 7, (id) => names[id]);
    expect(groups.map((g) => `${g.key}:${g.tasks.map((t) => t.name).join(',')}`)).toEqual([
      'kjokken:basil,chili', 'kontor:pilea', 'stue:monstera', ':ficus',
    ]);
  });
});

describe('bulkWaterTasks and agendaSummary', () => {
  const done = { done: { uids: ['x'], emphasis: 'solid' as const } };
  it('takes only due or overdue schedule water tasks', () => {
    const tasks = [
      task('a', -1, null, 'water', done),
      task('b', 0, null, 'water', done),
      task('c', 1, null, 'water', { done: { uids: ['y'], emphasis: 'outlined' } }),
      task('d', 0, null, 'water'),
      task('e', 0, null, 'fertilize', done),
    ];
    expect(bulkWaterTasks(tasks).map((t) => t.name)).toEqual(['a', 'b']);
  });
  it('counts tasks in the horizon, not predictions', () => {
    const prediction: AgendaTask = { plant: 'plant.p', name: 'p', names: ['p'], area: null, days: 2, row: row('water', { kind: 'prediction', at: '2026-11-25' }) };
    const tasks = [task('a', -2, null), task('b', 0, null), prediction, task('c', 10, null)];
    expect(agendaSummary(tasks, 7)).toEqual({ todo: 2, overdue: 1 });
  });
});

describe('custom tasks in the agenda', () => {
  const done = { uids: ['c1'], emphasis: 'solid' as const };
  const cistern = () => row('task:fill_cistern' as RowKey, { kind: 'due_today' }, {
    done, task: { slug: 'fill_cistern', summary: 'Fill cistern', plants: ['plant.basil', 'plant.chili'] },
  });
  const plants: PlantRows[] = [
    { plant: 'plant.basil', name: 'Basilikum', area: 'kjokken', rows: [cistern(), row('water', { kind: 'due_today' }, { done: { uids: ['w1'], emphasis: 'solid' } })] },
    { plant: 'plant.chili', name: 'Chili', area: 'stue', rows: [cistern()] },
  ];

  it('lists a task shared by several plants once, with every plant name', () => {
    const tasks = agendaTasks(plants, agendaCareTypes(undefined), true, true, now);
    expect(tasks.map((t) => `${t.names.join('+')}:${t.row.key}`)).toEqual(['Basilikum:water', 'Basilikum+Chili:task:fill_cistern']);
    expect(tasks[1].area).toBe('kjokken');
    expect(agendaSummary(tasks, 7)).toEqual({ todo: 2, overdue: 0 });
  });

  it('can hide custom tasks, and show_care does not hide them', () => {
    expect(agendaTasks(plants, agendaCareTypes(undefined), true, false, now).map((t) => t.row.key)).toEqual(['water']);
    expect(agendaTasks(plants, agendaCareTypes(['care_pruning']), true, true, now).map((t) => t.row.key)).toEqual(['task:fill_cistern']);
  });

  it('keeps custom tasks out of Water all', () => {
    const tasks = agendaTasks(plants, agendaCareTypes(undefined), true, true, now);
    expect(bulkWaterTasks(tasks).map((t) => t.row.key)).toEqual(['water']);
  });
});
