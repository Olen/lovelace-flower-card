import { CareRow, CareType, daysUntilCare, isTaskKey } from './model';

export interface RegistryEntity {
  area_id?: string | null;
  device_id?: string | null;
  labels?: string[];
}

export interface Registry {
  entities: Record<string, RegistryEntity | undefined>;
  devices: Record<string, { area_id?: string | null } | undefined>;
  areas: Record<string, { name: string; floor_id?: string | null } | undefined>;
}

export interface AgendaScope {
  area?: string;
  floor?: string;
  label?: string;
  exclude_label?: string;
}

export type GroupBy = 'due' | 'area';
export const GROUP_BY_VALUES: GroupBy[] = ['due', 'area'];
export const DEFAULT_DAYS = 7;

export interface AgendaTask {
  plant: string;
  name: string;
  names: string[];   // every plant in scope a shared custom task belongs to, in order
  area: string | null;
  row: CareRow;
  days: number;
}

export type DueGroupKey = 'overdue' | 'today' | 'tomorrow' | 'week';
export const DUE_GROUPS: DueGroupKey[] = ['overdue', 'today', 'tomorrow', 'week'];

export interface AgendaGroup {
  key: string;
  tasks: AgendaTask[];
}

export interface GroupedAgenda {
  groups: AgendaGroup[];
  later: AgendaTask[];
}

const CARE_ORDER: CareType[] = ['water', 'fertilize', 'repot', 'prune'];

const CARE_TYPE_OF_SHOW_CARE = new Map<string, CareType>([
  ['care_watering', 'water'],
  ['care_fertilization', 'fertilize'],
  ['care_repotting', 'repot'],
  ['care_pruning', 'prune'],
]);

/** The plant's own area, else its device's area. */
export function plantArea(entityId: string, registry: Registry): string | null {
  const entity = registry.entities[entityId];
  if (entity === undefined) {
    return null;
  }
  if (entity.area_id) {
    return entity.area_id;
  }
  if (entity.device_id) {
    return registry.devices[entity.device_id]?.area_id ?? null;
  }
  return null;
}

function inScope(entityId: string, registry: Registry, scope: AgendaScope): boolean {
  const labels = registry.entities[entityId]?.labels ?? [];
  if (scope.exclude_label && labels.includes(scope.exclude_label)) {
    return false;
  }
  if (scope.label && !labels.includes(scope.label)) {
    return false;
  }
  const area = plantArea(entityId, registry);
  if (scope.area && area !== scope.area) {
    return false;
  }
  if (scope.floor) {
    const floor = area === null ? null : registry.areas[area]?.floor_id ?? null;
    if (floor !== scope.floor) {
      return false;
    }
  }
  return true;
}

export function plantsInScope(entityIds: string[], registry: Registry, scope: AgendaScope): string[] {
  return entityIds.filter((entityId) => entityId.startsWith('plant.') && inScope(entityId, registry, scope));
}

export function agendaCareTypes(showCare: unknown): Set<CareType> {
  const valid = [...CARE_TYPE_OF_SHOW_CARE.keys()].join(', ');
  if (showCare === undefined || showCare === null || (Array.isArray(showCare) && showCare.length === 0)) {
    return new Set(CARE_ORDER);
  }
  if (!Array.isArray(showCare)) {
    throw new Error(`show_care must be a list of: ${valid}`);
  }
  const types = new Set<CareType>();
  for (const value of showCare) {
    const careType = CARE_TYPE_OF_SHOW_CARE.get(value);
    if (careType === undefined) {
      throw new Error(`Unknown show_care value "${value}". Valid values: ${valid}`);
    }
    types.add(careType);
  }
  return types;
}

export interface AgendaConfigInput {
  group_by?: unknown;
  days?: unknown;
  show_care?: unknown;
}

export function validateAgendaOptions(config: AgendaConfigInput): void {
  if (config.group_by !== undefined && !GROUP_BY_VALUES.includes(config.group_by as GroupBy)) {
    throw new Error(`Unknown group_by "${config.group_by}"; use one of: ${GROUP_BY_VALUES.join(', ')}`);
  }
  if (config.days !== undefined && (!Number.isInteger(config.days) || (config.days as number) < 1)) {
    throw new Error(`days must be a whole number of at least 1, not "${config.days}"`);
  }
  agendaCareTypes(config.show_care);
}

export interface PlantRows {
  plant: string;
  name: string;
  area: string | null;
  rows: CareRow[];
}

function careIndex(row: CareRow): number {
  if (isTaskKey(row.key)) {
    return CARE_ORDER.length;
  }
  return CARE_ORDER.indexOf(row.key as CareType);
}

/** A custom task shared by several plants is one to-do item: same key, same items. */
function sharedTaskKey(row: CareRow): string | null {
  if (!isTaskKey(row.key) || row.done === null) {
    return null;
  }
  return `${row.key}|${[...row.done.uids].sort().join(',')}`;
}

function compareTasks(a: AgendaTask, b: AgendaTask): number {
  if (a.days !== b.days) {
    return a.days - b.days;
  }
  if (careIndex(a.row) !== careIndex(b.row)) {
    return careIndex(a.row) - careIndex(b.row);
  }
  return a.name.localeCompare(b.name);
}

/** Every care task of the given plants, soonest first; a shared custom task is listed once. */
export function agendaTasks(
  plants: PlantRows[],
  careTypes: Set<CareType>,
  showPredictions: boolean,
  showTasks: boolean,
  now: Date,
): AgendaTask[] {
  const tasks: AgendaTask[] = [];
  const shared = new Map<string, AgendaTask>();
  for (const plant of plants) {
    for (const row of plant.rows) {
      const wanted = isTaskKey(row.key) ? showTasks : careTypes.has(row.key as CareType);
      if (!wanted) {
        continue;
      }
      const sharedKey = sharedTaskKey(row);
      const already = sharedKey === null ? undefined : shared.get(sharedKey);
      if (already !== undefined) {
        already.names.push(plant.name);
        continue;
      }
      const isPrediction = row.status.kind === 'prediction' && !row.alert;
      if (isPrediction && !showPredictions) {
        continue;
      }
      const days = daysUntilCare(row, now);
      if (days === null) {
        continue;
      }
      const task: AgendaTask = { plant: plant.plant, name: plant.name, names: [plant.name], area: plant.area, row, days };
      tasks.push(task);
      if (sharedKey !== null) {
        shared.set(sharedKey, task);
      }
    }
  }
  return tasks.sort(compareTasks);
}

export function dueGroup(days: number): DueGroupKey {
  if (days < 0) {
    return 'overdue';
  }
  if (days === 0) {
    return 'today';
  }
  if (days === 1) {
    return 'tomorrow';
  }
  return 'week';
}

function splitHorizon(tasks: AgendaTask[], horizon: number): { near: AgendaTask[]; later: AgendaTask[] } {
  return {
    near: tasks.filter((task) => task.days <= horizon),
    later: tasks.filter((task) => task.days > horizon),
  };
}

/** Groups sorted tasks into Overdue / Today / Tomorrow / This week; empty groups are left out. */
export function groupByDue(tasks: AgendaTask[], horizon: number): GroupedAgenda {
  const { near, later } = splitHorizon(tasks, horizon);
  const groups: AgendaGroup[] = [];
  for (const key of DUE_GROUPS) {
    const inGroup = near.filter((task) => dueGroup(task.days) === key);
    if (inGroup.length > 0) {
      groups.push({ key, tasks: inGroup });
    }
  }
  return { groups, later };
}

/** One group per area, sorted by area name, plants without an area last (key ''). */
export function groupByArea(tasks: AgendaTask[], horizon: number, areaName: (areaId: string) => string): GroupedAgenda {
  const { near, later } = splitHorizon(tasks, horizon);
  const byArea = new Map<string, AgendaTask[]>();
  for (const task of near) {
    const key = task.area ?? '';
    const list = byArea.get(key) ?? [];
    list.push(task);
    byArea.set(key, list);
  }
  const named = [...byArea.keys()].filter((key) => key !== '');
  named.sort((a, b) => areaName(a).localeCompare(areaName(b)));
  const keys = byArea.has('') ? [...named, ''] : named;
  return { groups: keys.map((key) => ({ key, tasks: byArea.get(key) as AgendaTask[] })), later };
}

/** Schedule water tasks that are due or overdue: the ones "Water all" completes. */
export function bulkWaterTasks(tasks: AgendaTask[]): AgendaTask[] {
  return tasks.filter((task) => task.row.key === 'water' && task.row.done !== null && task.days <= 0);
}

export interface AgendaSummary {
  todo: number;
  overdue: number;
}

/** Counts tasks within the horizon; predictions are not tasks. */
export function agendaSummary(tasks: AgendaTask[], horizon: number): AgendaSummary {
  const counted = tasks.filter((task) => task.days <= horizon && !(task.row.status.kind === 'prediction' && !task.row.alert));
  return { todo: counted.length, overdue: counted.filter((task) => task.days < 0).length };
}
