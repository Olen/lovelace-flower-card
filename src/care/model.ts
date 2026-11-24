export type CareType = 'water' | 'fertilize' | 'repot' | 'prune';
export type RowKey = CareType | 'light' | 'soil';
export type TaskKey = `task:${string}`;
export type AnyRowKey = RowKey | TaskKey;
export type CareMode = 'sensor' | 'interval' | 'none';

export interface CareInfo {
  todo_list: string | null;
  modes: Record<CareType, CareMode>;
  intervals: Record<CareType, number>;
  events: Record<CareType, string>;
  next_watering: string | null;
  marker_separator: string;
}

export interface TodoItem {
  uid: string;
  summary: string;
  status: 'needs_action' | 'completed';
  due?: string;
  description?: string;
  completed?: string;
}

export type RowStatus =
  | { kind: 'none' }
  | { kind: 'prediction'; at: string }
  | { kind: 'due'; days: number; date: string }
  | { kind: 'due_today' }
  | { kind: 'overdue'; days: number };

export interface DoneAction {
  uids: string[];
  emphasis: 'outlined' | 'solid';
}

export interface TaskInfo {
  slug: string;
  summary: string;
  plants: string[];
}

export interface CareRow {
  key: AnyRowKey;
  alert: boolean;
  status: RowStatus;
  lastDone: string | null;
  intervalDays: number | null;
  texts: string[];
  done: DoneAction | null;
  snooze: { uids: string[]; due: string | null } | null;
  progress: number | null;
  reading: RowReading | null;
  task?: TaskInfo;
}

export type ReadingKind = 'moisture' | 'conductivity';

export interface Reading {
  current: number;
  min: number;
  max: number;
  unit: string;
}

export type Readings = Partial<Record<ReadingKind, Reading>>;

export interface RowReading {
  value: number;
  min: number;
  unit: string;
  barFraction: number | null;
}

export interface CareRowInput {
  plantEntityId: string;
  attributes: Record<string, unknown>;
  care: CareInfo | null;
  items: TodoItem[];
  lastDone: Partial<Record<CareType, string>>;
  nextWatering: string | null;
  readings: Readings;
}

export const SNOOZE_WINDOW_DAYS = 2;

const CARE_TYPES: CareType[] = ['water', 'fertilize', 'repot', 'prune'];

const TEXT_ATTRIBUTE: Record<RowKey, string | null> = {
  water: 'care_watering',
  fertilize: 'care_fertilization',
  repot: null,
  prune: 'care_pruning',
  light: 'care_sunlight',
  soil: 'care_soil',
};

const PROBLEM_ROW: Record<string, RowKey> = {
  moisture: 'water',
  conductivity: 'fertilize',
  illuminance: 'light',
  dli: 'light',
};

const READING_OF_ROW: Partial<Record<RowKey, ReadingKind>> = {
  water: 'moisture',
  fertilize: 'conductivity',
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86400000;

interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number;
}

function parseCalendarDate(value: string): CalendarDate {
  if (DATE_ONLY.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return { year, month, day };
  }
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return { year: parsed.getFullYear(), month: parsed.getMonth() + 1, day: parsed.getDate() };
}

function isParsableDate(value: string): boolean {
  return DATE_ONLY.test(value) || !isNaN(new Date(value).getTime());
}

function withValidDates(item: TodoItem): TodoItem {
  const cleaned = { ...item };
  if (cleaned.due !== undefined && !isParsableDate(cleaned.due)) {
    console.warn(`Ignoring unparsable due date on to-do item ${item.uid}: ${item.due}`);
    delete cleaned.due;
  }
  if (cleaned.completed !== undefined && !isParsableDate(cleaned.completed)) {
    console.warn(`Ignoring unparsable completed date on to-do item ${item.uid}: ${item.completed}`);
    delete cleaned.completed;
  }
  return cleaned;
}

function calendarDay(date: CalendarDate): number {
  return Math.round(Date.UTC(date.year, date.month - 1, date.day) / MS_PER_DAY);
}

function todayOf(now: Date): CalendarDate {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

function formatCalendarDay(day: number): string {
  return new Date(day * MS_PER_DAY).toISOString().slice(0, 10);
}

export function careOfItem(item: TodoItem, plantEntityId: string, separator: string): CareType | null {
  if (!item.description) {
    return null;
  }
  const lines = item.description.split('\n').map((line) => line.trim());
  for (const careType of CARE_TYPES) {
    if (lines.includes(`${plantEntityId}${separator}${careType}`)) {
      return careType;
    }
  }
  return null;
}

export function dueInDays(due: string, now: Date): number {
  return calendarDay(parseCalendarDate(due)) - calendarDay(todayOf(now));
}

export function progressFraction(lastDone: string | null, due: string | null, now: Date): number | null {
  if (lastDone === null || due === null) {
    return null;
  }
  const start = calendarDay(parseCalendarDate(lastDone));
  const end = calendarDay(parseCalendarDate(due));
  const today = calendarDay(todayOf(now));
  if (today >= end || end <= start) {
    return 1;
  }
  return Math.max(0, (today - start) / (end - start));
}

export function snoozedDue(currentDue: string | null, days: number, now: Date): string {
  const today = calendarDay(todayOf(now));
  const base = currentDue === null ? today : Math.max(today, calendarDay(parseCalendarDate(currentDue)));
  return formatCalendarDay(base + days);
}

export function msUntilMidnight(now: Date): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return midnight.getTime() - now.getTime();
}

export function formatCareDate(value: string, language: string): string {
  const date = parseCalendarDate(value);
  return new Date(date.year, date.month - 1, date.day).toLocaleDateString(language, { day: 'numeric', month: 'short' });
}

export function predictionDays(at: string, now: Date): number {
  return Math.max(0, dueInDays(at, now));
}

export interface CareDates {
  lastDone: Partial<Record<CareType, string>>;
  nextWatering: string | null;
}

function timestampState(states: Record<string, { state: string }>, entityId: string | null): string | null {
  if (entityId === null) {
    return null;
  }
  const state = states[entityId]?.state;
  if (state === undefined || !isParsableDate(state)) {
    return null;
  }
  return state;
}

export function careDatesFromStates(care: CareInfo | null, states: Record<string, { state: string }>): CareDates {
  const dates: CareDates = { lastDone: {}, nextWatering: null };
  if (care === null) {
    return dates;
  }
  for (const careType of CARE_TYPES) {
    const lastDone = timestampState(states, care.events[careType]);
    if (lastDone !== null) {
      dates.lastDone[careType] = lastDone;
    }
  }
  dates.nextWatering = timestampState(states, care.next_watering);
  return dates;
}

export interface DoneConfirmation {
  date: string | null;
}

export function doneConfirmation(row: CareRow): DoneConfirmation | null {
  if (row.done === null || row.done.emphasis !== 'outlined') {
    return null;
  }
  if (row.status.kind === 'due') {
    return { date: row.status.date };
  }
  return { date: null };
}

export interface StatusLabel {
  key: string;
  n?: number;
  date?: string;
}

export function statusLabel(status: RowStatus, now: Date): StatusLabel | null {
  switch (status.kind) {
    case 'none':
      return null;
    case 'prediction': {
      const days = predictionDays(status.at, now);
      if (days === 0) {
        return { key: 'care_status_prediction_today' };
      }
      if (days === 1) {
        return { key: 'care_status_prediction_one', date: status.at };
      }
      return { key: 'care_status_prediction', n: days, date: status.at };
    }
    case 'due':
      if (status.days === 1) {
        return { key: 'care_status_due_tomorrow', date: status.date };
      }
      return { key: 'care_status_due', n: status.days, date: status.date };
    case 'due_today':
      return { key: 'care_status_due_today' };
    case 'overdue':
      return { key: 'care_status_overdue', n: status.days };
  }
}

const ROW_OF_SHOW_CARE = new Map<string, RowKey>([
  ['care_watering', 'water'],
  ['care_fertilization', 'fertilize'],
  ['care_repotting', 'repot'],
  ['care_pruning', 'prune'],
  ['care_sunlight', 'light'],
  ['care_soil', 'soil'],
]);

export function rowKeysFromShowCare(showCare: unknown): Set<RowKey> {
  const valid = [...ROW_OF_SHOW_CARE.keys()].join(', ');
  // The editor writes [] when every chip is cleared; a bare `show_care:` in YAML is null
  if (showCare === undefined || showCare === null || (Array.isArray(showCare) && showCare.length === 0)) {
    return new Set(ROW_OF_SHOW_CARE.values());
  }
  if (!Array.isArray(showCare)) {
    throw new Error(`show_care must be a list of: ${valid}`);
  }
  const keys = new Set<RowKey>();
  for (const value of showCare) {
    const key = ROW_OF_SHOW_CARE.get(value);
    if (key === undefined) {
      throw new Error(`Unknown show_care value "${value}". Valid values: ${valid}`);
    }
    keys.add(key);
  }
  return keys;
}

export function initiallyExpanded(displayType: string | undefined): boolean {
  return displayType !== 'compact' && displayType !== 'folded';
}

/** `folded` keeps the full header; only `compact` uses the small one. */
export function careHeaderDisplayType(displayType: string | undefined): 'full' | 'compact' {
  return displayType === 'compact' ? 'compact' : 'full';
}

function textsOf(key: RowKey, attributes: Record<string, unknown>): string[] {
  const attribute = TEXT_ATTRIBUTE[key];
  if (attribute === null) {
    return [];
  }
  const value = attributes[attribute];
  if (typeof value === 'string' && value.trim() !== '') {
    return [value];
  }
  return [];
}

function problemRows(attributes: Record<string, unknown>): Set<RowKey> {
  const rows = new Set<RowKey>();
  const problems = attributes['problems'];
  if (!Array.isArray(problems)) {
    return rows;
  }
  for (const problem of problems as { sensor_type?: string }[]) {
    const row = PROBLEM_ROW[problem.sensor_type ?? ''];
    if (row) {
      rows.add(row);
    }
  }
  return rows;
}

function newestCompleted(items: TodoItem[]): string | null {
  let newest: string | null = null;
  for (const item of items) {
    if (!item.completed) {
      continue;
    }
    if (newest === null || new Date(item.completed).getTime() > new Date(newest).getTime()) {
      newest = item.completed;
    }
  }
  return newest;
}

function statusOfDue(due: string, now: Date): RowStatus {
  const days = dueInDays(due, now);
  if (days < 0) {
    return { kind: 'overdue', days: -days };
  }
  if (days === 0) {
    return { kind: 'due_today' };
  }
  const date = DATE_ONLY.test(due) ? due : formatCalendarDay(calendarDay(parseCalendarDate(due)));
  return { kind: 'due', days, date };
}

function earliestDue(openItems: TodoItem[]): string | null {
  let earliest: string | null = null;
  for (const item of openItems) {
    if (!item.due) {
      continue;
    }
    if (earliest === null || calendarDay(parseCalendarDate(item.due)) < calendarDay(parseCalendarDate(earliest))) {
      earliest = item.due;
    }
  }
  return earliest;
}

function parsedNumber(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') {
    return null;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readingOf(raw: unknown): Reading | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }
  const fields = raw as Record<string, unknown>;
  const current = parsedNumber(fields.current);
  const min = parsedNumber(fields.min);
  const max = parsedNumber(fields.max);
  if (current === null || min === null || max === null) {
    return null;
  }
  const unit = typeof fields.unit_of_measurement === 'string' ? fields.unit_of_measurement : '';
  return { current, min, max, unit };
}

export function readingsFromPlantInfo(result: Record<string, unknown>): Readings {
  const readings: Readings = {};
  for (const kind of ['moisture', 'conductivity'] as ReadingKind[]) {
    if (!(kind in result)) {
      continue;
    }
    const reading = readingOf(result[kind]);
    if (reading === null) {
      console.warn(`Ignoring unparsable ${kind} reading:`, result[kind]);
      continue;
    }
    readings[kind] = reading;
  }
  return readings;
}

function rowReading(key: RowKey, readings: Readings): RowReading | null {
  const kind = READING_OF_ROW[key];
  if (kind === undefined) {
    return null;
  }
  const reading = readings[kind];
  if (reading === undefined) {
    return null;
  }
  let barFraction: number | null = null;
  if (reading.max > reading.min) {
    const fraction = (reading.current - reading.min) / (reading.max - reading.min);
    barFraction = Math.min(1, Math.max(0, fraction));
  }
  return { value: reading.current, min: reading.min, unit: reading.unit, barFraction };
}

function buildCareTypeRow(
  key: CareType,
  input: CareRowInput,
  problems: Set<RowKey>,
  now: Date,
): { row: CareRow; hasOpenItems: boolean } {
  const care = input.care;
  const hasList = care !== null && care.todo_list !== null;
  const mode: CareMode = care === null ? 'none' : care.modes[key];
  const separator = care === null ? '' : care.marker_separator;

  const keyItems = hasList
    ? input.items.filter((item) => careOfItem(item, input.plantEntityId, separator) === key).map(withValidDates)
    : [];
  const openItems = keyItems.filter((item) => item.status === 'needs_action');
  const completedItems = keyItems.filter((item) => item.status === 'completed');
  const due = earliestDue(openItems);

  let status: RowStatus = { kind: 'none' };
  if (due !== null) {
    status = statusOfDue(due, now);
  } else if (key === 'water' && input.nextWatering !== null) {
    status = { kind: 'prediction', at: input.nextWatering };
  }

  const overdueOrToday = status.kind === 'overdue' || status.kind === 'due_today';
  const lastDone = input.lastDone[key] ?? newestCompleted(completedItems);
  const hasOpenItems = openItems.length > 0;
  const uids = openItems.map((item) => item.uid);

  let done: DoneAction | null = null;
  if (hasList && mode === 'interval' && hasOpenItems) {
    done = { uids, emphasis: overdueOrToday ? 'solid' : 'outlined' };
  }

  let snooze: CareRow['snooze'] = null;
  if (hasList && hasOpenItems && due !== null && dueInDays(due, now) <= SNOOZE_WINDOW_DAYS) {
    snooze = { uids, due };
  }

  const row: CareRow = {
    key,
    alert: problems.has(key) || overdueOrToday,
    status,
    lastDone,
    intervalDays: care !== null && mode === 'interval' ? care.intervals[key] : null,
    texts: textsOf(key, input.attributes),
    done,
    snooze,
    progress: mode === 'interval' ? progressFraction(lastDone, due, now) : null,
    reading: rowReading(key, input.readings),
  };
  return { row, hasOpenItems };
}

function buildTextRow(key: 'light' | 'soil', input: CareRowInput, problems: Set<RowKey>): CareRow {
  return {
    key,
    alert: key === 'light' && problems.has('light'),
    status: { kind: 'none' },
    lastDone: null,
    intervalDays: null,
    texts: textsOf(key, input.attributes),
    done: null,
    snooze: null,
    progress: null,
    reading: null,
  };
}

function pruneVisible(row: CareRow, mode: CareMode, hasOpenItem: boolean): boolean {
  return row.texts.length > 0 || hasOpenItem || mode === 'interval' || row.lastDone !== null;
}

export function buildCareRows(input: CareRowInput, now: Date): CareRow[] {
  const problems = problemRows(input.attributes);
  const rows: CareRow[] = [];

  for (const key of CARE_TYPES) {
    const { row, hasOpenItems } = buildCareTypeRow(key, input, problems, now);
    if (key === 'prune') {
      const mode: CareMode = input.care === null ? 'none' : input.care.modes.prune;
      if (!pruneVisible(row, mode, hasOpenItems)) {
        continue;
      }
    }
    rows.push(row);
  }

  const light = buildTextRow('light', input, problems);
  if (light.texts.length > 0 || light.alert) {
    rows.push(light);
  }
  const soil = buildTextRow('soil', input, problems);
  if (soil.texts.length > 0) {
    rows.push(soil);
  }
  return rows;
}

export const NEXT_CARE_LIMIT = 2;

const CARE_ROW_KEYS = new Set<RowKey>(CARE_TYPES);

/** Days until the row needs doing: negative when overdue, null when it has nothing to do. */
export function daysUntilCare(row: CareRow, now: Date): number | null {
  switch (row.status.kind) {
    case 'overdue':
      return -row.status.days;
    case 'due_today':
      return 0;
    case 'due':
      return row.status.days;
    case 'prediction':
      return row.alert ? 0 : predictionDays(row.status.at, now);
    case 'none':
      return row.alert ? 0 : null;
  }
}

/** The most urgent care tasks, soonest first; rows that are equally urgent keep their order. */
export function nextCareRows(rows: CareRow[], now: Date): CareRow[] {
  const candidates: { row: CareRow; days: number }[] = [];
  for (const row of rows) {
    if (!isTaskKey(row.key) && !CARE_ROW_KEYS.has(row.key)) {
      continue;
    }
    const days = daysUntilCare(row, now);
    if (days !== null) {
      candidates.push({ row, days });
    }
  }
  candidates.sort((a, b) => a.days - b.days);
  return candidates.slice(0, NEXT_CARE_LIMIT).map((candidate) => candidate.row);
}

export const TASK_PREFIX = 'task:';

export function isTaskKey(key: AnyRowKey): key is TaskKey {
  return key.startsWith(TASK_PREFIX);
}

export interface TaskMarker {
  slug: string;
  plants: string[];
}

/** The `plant.<id> · task:<slug>` lines of an item: its slug and every plant it belongs to. */
export function taskMarkerOf(item: TodoItem, separator: string): TaskMarker | null {
  if (!item.description || separator === '') {
    return null;
  }
  let slug: string | null = null;
  const plants: string[] = [];
  for (const rawLine of item.description.split('\n')) {
    const line = rawLine.trim();
    const at = line.indexOf(separator);
    if (at <= 0) {
      continue;
    }
    const entityId = line.slice(0, at);
    const care = line.slice(at + separator.length);
    if (!entityId.startsWith('plant.') || !care.startsWith(TASK_PREFIX) || care === TASK_PREFIX) {
      continue;
    }
    const lineSlug = care.slice(TASK_PREFIX.length);
    if (slug === null) {
      slug = lineSlug;
    }
    if (lineSlug === slug && !plants.includes(entityId)) {
      plants.push(entityId);
    }
  }
  return slug === null ? null : { slug, plants };
}

interface TaskGroup {
  slug: string;
  open: TodoItem[];
  completed: TodoItem[];
  plants: string[];
}

function taskGroups(input: CareRowInput): TaskGroup[] {
  const care = input.care;
  if (care === null || care.todo_list === null) {
    return [];
  }
  const groups = new Map<string, TaskGroup>();
  for (const rawItem of input.items) {
    const marker = taskMarkerOf(rawItem, care.marker_separator);
    if (marker === null || !marker.plants.includes(input.plantEntityId)) {
      continue;
    }
    const item = withValidDates(rawItem);
    const group = groups.get(marker.slug) ?? { slug: marker.slug, open: [], completed: [], plants: [] };
    if (item.status === 'needs_action') {
      group.open.push(item);
      for (const plant of marker.plants) {
        if (!group.plants.includes(plant)) {
          group.plants.push(plant);
        }
      }
    } else {
      group.completed.push(item);
    }
    groups.set(marker.slug, group);
  }
  return [...groups.values()].filter((group) => group.open.length > 0);
}

function summaryOf(openItems: TodoItem[], due: string | null): string {
  const first = openItems.find((item) => item.due === due) ?? openItems[0];
  return first.summary;
}

/** One row per custom task with open items for this plant, soonest first. An open task without a date is due now. */
export function buildTaskRows(input: CareRowInput, now: Date): CareRow[] {
  const rows: CareRow[] = [];
  for (const group of taskGroups(input)) {
    const due = earliestDue(group.open);
    const status: RowStatus = due === null ? { kind: 'due_today' } : statusOfDue(due, now);
    const overdueOrToday = status.kind === 'overdue' || status.kind === 'due_today';
    const uids = group.open.map((item) => item.uid);
    rows.push({
      key: `${TASK_PREFIX}${group.slug}`,
      alert: overdueOrToday,
      status,
      lastDone: newestCompleted(group.completed),
      intervalDays: null,
      texts: [],
      done: { uids, emphasis: overdueOrToday ? 'solid' : 'outlined' },
      snooze: due !== null && dueInDays(due, now) <= SNOOZE_WINDOW_DAYS ? { uids, due } : null,
      progress: null,
      reading: null,
      task: { slug: group.slug, summary: summaryOf(group.open, due), plants: group.plants },
    });
  }
  return rows.sort((a, b) => (daysUntilCare(a, now) ?? 0) - (daysUntilCare(b, now) ?? 0));
}
