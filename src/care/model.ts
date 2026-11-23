export type CareType = 'water' | 'fertilize' | 'repot' | 'prune';
export type RowKey = CareType | 'light' | 'soil';
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

export interface CareRow {
  key: RowKey;
  alert: boolean;
  status: RowStatus;
  lastDone: string | null;
  intervalDays: number | null;
  texts: string[];
  done: DoneAction | null;
  snooze: { uids: string[]; due: string | null } | null;
  progress: number | null;
}

export interface CareRowInput {
  plantEntityId: string;
  attributes: Record<string, unknown>;
  care: CareInfo | null;
  items: TodoItem[];
  lastDone: Partial<Record<CareType, string>>;
  nextWatering: string | null;
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
        return { key: 'care_status_prediction_one' };
      }
      return { key: 'care_status_prediction', n: days };
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

export function initiallyExpanded(displayType: string | undefined): boolean {
  return displayType !== 'compact';
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
