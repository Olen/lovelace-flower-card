# Plant-care card — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A second Lovelace card, `flower-care-card`, in the flower-card bundle: flower-card header, one row per care area with care text, status, last done and a Done button where the plant's care mode allows it.

**Architecture:** All decisions live in pure functions in `src/care/model.ts` (rows, marker matching, dates, column split) and are unit-tested. `src/flower-care-card.ts` is a thin Lit element: it fetches `plant/get_info` (for the `care` block), subscribes to the to-do list with `todo/item/subscribe`, reads event/sensor states from `hass.states`, calls `buildCareRows`, and renders. It is imported from `src/flower-card.ts`, so it ships inside the existing `flower-card.js` — no change to plant's resource registration, HACS, or the release scripts.

**Tech Stack:** TypeScript, Lit, webpack, vitest (jsdom).

**Spec:** `docs/superpowers/specs/2026-11-23-plant-care-card-design.md`
**Depends on:** plant plan `home-assistant-plant/docs/superpowers/plans/2026-11-23-plant-care-modes.md`, Task 5 — the `care` block shape in `plant/get_info`.

## Global Constraints

- The card computes and stores no dates of its own: due dates only from to-do items, last done only from the per-type event entities, prediction only from plant's next-watering sensor.
- **No to-do list ⇒ no due dates, no overdue, no Done buttons**, and a hint row pointing to Configure → Care tasks.
- Done = `todo.update_item` with `status: "completed"` for each open item of that care type; nothing else.
- Done only in `interval` mode with at least one open item. **Outlined** when not yet due, **solid** when due today or overdue.
- Red row: plant `problems` has the row's sensor (`moisture` → water, `conductivity` → fertilize, `illuminance`/`dli` → light), or an open item is due today/overdue.
- Rows, fixed order: `water`, `fertilize`, `repot`, `prune`, `light`, `soil`. Care text shown verbatim (`care_watering`, `care_fertilization`, —, `care_pruning`, `care_sunlight`, `care_soil`).
- `display_type: full | compact` (same values as the flower card): full = expanded rows; compact = compact header, rows folded to title + status, tap to toggle. Display type only sets the starting state.
- Wide layout by container query on the card's own width; two columns filled left to right (row-major grid), so pairs share a height: Water | Fertilize, Repot | Prune, Light | Soil.
- Row extras: confirm an early (outlined) Done; progress bar from last done to due on interval rows; snooze only when the open item is overdue or due within `SNOOZE_WINDOW_DAYS = 2` (+1 d / +3 d / +1 w, new due = max(today, current due) + n, via `todo.update_item due_date`); re-render at local midnight.
- Repo rules (CLAUDE.md): branch from `origin/main`; never run `npm run build` locally; verify with `npx vitest run`, `npx tsc --noEmit`, `npm run lint`; unit-test pure functions only (no LitElement instantiation, no TemplateResult assertions); no version bump in this branch; label the PR `enhancement`.
- Strings through `localize` (en, de, nl).

## Review Focus

1. **Due given as a date-only string vs a datetime** (`"2026-11-24"` vs `"2026-11-24T08:00:00+01:00"`) and local midnight — `dueInDays` must count calendar days in local time for both. Test in Task 1.
2. **Markers of plants whose ids share a prefix** (`plant.plant_01` vs `plant.plant_010`) and items with extra description lines — only exact entity-id matches count. Test in Task 1.
3. **Plant without the `care` block** (older plant, or `get_info` returned `{}` because the plant is incomplete) — rows show care text only, no Done, no crash. Test in Task 1 (`care: null`).
4. **Lists without `completed` timestamps** (Todoist etc.) — last done falls back to the event entity only; no "Invalid Date". Test in Task 1.
5. **To-do entity unavailable or subscription error** — card keeps rendering text and last-done rows, logs one `console.warn`, shows no Done buttons. Handled in Task 3 (`items` treated as empty on error); covered by the `items: []` cases in Task 1.

---

### Task 1: Pure care model

**Files:**
- Create: `src/care/model.ts`
- Test: `tests/care-model.test.ts`

**Interfaces:**
- Produces (all exported from `src/care/model.ts`):
```ts
export type CareType = 'water' | 'fertilize' | 'repot' | 'prune';
export type RowKey = CareType | 'light' | 'soil';
export type CareMode = 'sensor' | 'interval' | 'none';
export interface CareInfo {            // plant/get_info result.care
  todo_list: string | null;
  modes: Record<CareType, CareMode>;
  intervals: Record<CareType, number>;
  events: Record<CareType, string>;
  next_watering: string | null;
  marker_separator: string;
}
export interface TodoItem { uid: string; summary: string; status: 'needs_action' | 'completed'; due?: string; description?: string; completed?: string; }
export type RowStatus =
  | { kind: 'none' }
  | { kind: 'prediction'; at: string }
  | { kind: 'due'; days: number; date: string }
  | { kind: 'due_today' }
  | { kind: 'overdue'; days: number };
export interface DoneAction { uids: string[]; emphasis: 'outlined' | 'solid'; }
export interface CareRow { key: RowKey; alert: boolean; status: RowStatus; lastDone: string | null; intervalDays: number | null; texts: string[]; done: DoneAction | null; snooze: { uids: string[]; due: string | null } | null; progress: number | null; }
export interface CareRowInput {
  plantEntityId: string;
  attributes: Record<string, unknown>;     // plant state attributes (care_*, problems)
  care: CareInfo | null;
  items: TodoItem[];                       // whole list; filtered here
  lastDone: Partial<Record<CareType, string>>; // event entity states that are valid ISO timestamps
  nextWatering: string | null;             // next-watering sensor state if a valid timestamp
}
export function careOfItem(item: TodoItem, plantEntityId: string, separator: string): CareType | null;
export function dueInDays(due: string, now: Date): number;   // <0 overdue, 0 today
export function buildCareRows(input: CareRowInput, now: Date): CareRow[];
export function progressFraction(lastDone: string | null, due: string | null, now: Date): number | null; // 0..1, 1 when due/overdue, null when either date missing
export function snoozedDue(currentDue: string | null, days: number, now: Date): string;      // YYYY-MM-DD: max(today, currentDue) + days
export function msUntilMidnight(now: Date): number;                                          // local time
export function initiallyExpanded(displayType: string | undefined): boolean; // false only for 'compact'
```

Row rules `buildCareRows` must implement (from the spec's case tables):
- `water`, `fertilize`, `repot` always present. `prune` present when it has text, an open item, mode `interval`, or a last done. `light` present when it has sunlight text or a light problem. `soil` present when it has soil text.
- With `care` null or `care.todo_list` null, `items` are ignored entirely (no due dates without a list).
- Open items = items with `careOfItem === key` and `status === 'needs_action'`. Status from the earliest open `due`: `<0` overdue, `0` due_today, `>0` due. No open item: water with `nextWatering` ⇒ `prediction`; else `none`.
- `done` only when `care?.todo_list` and `care.modes[key] === 'interval'` and open items exist; `uids` = all open items; `emphasis` solid when status is due_today/overdue.
- `lastDone` = `input.lastDone[key]`, else the newest `completed` of this care's completed items, else null.
- `intervalDays` = `care.intervals[key]` when mode is `interval`, else null.
- `alert` per Global Constraints. `light` and `soil` never have status, lastDone or done; `soil` is never alert.

- [ ] **Step 1: Write failing tests** in `tests/care-model.test.ts`. Fix `now = new Date(2026, 10, 23, 12, 0)` (local). Build input with a helper `input(overrides)` whose defaults are: `plantEntityId 'plant.plant_004'`, separator `' · '`, all modes `none`, intervals 0, list `todo.plant_care`, no items, no problems. One `it` per case:
  - `careOfItem`: `'plant.plant_004 · water'` ⇒ `'water'`; `'plant.plant_0040 · water'` ⇒ null; `'plant.plant_004 · weed'` ⇒ null; marker on the second line of a multi-line description ⇒ match; missing description ⇒ null (Review Focus 2).
  - `dueInDays`: `'2026-11-23'` ⇒ 0, `'2026-11-20'` ⇒ -3, `'2026-12-02'` ⇒ 9, `'2026-11-24T00:30:00+01:00'` ⇒ 1 (Review Focus 1).
  - W1 no list (`care.todo_list: null`, water mode `interval`, an open water item due today present in `items`): water `done` null, `alert` false, status `prediction` when `nextWatering` is set, else `none`.
  - W2 sensor mode, no item, `nextWatering '2026-11-25T10:00:00+01:00'` ⇒ status `{kind:'prediction', at: …}`, `alert` false, `done` null.
  - W3 sensor mode, open water item due `'2026-11-23'`, problems `[{sensor_type:'moisture'}]` ⇒ `alert` true, status due_today, `done` null.
  - W4 interval mode, open item due `'2026-11-23'` ⇒ `done {uids:[uid], emphasis:'solid'}`, `intervalDays` = interval.
  - F2 interval, due `'2026-12-02'` ⇒ status `{kind:'due', days:9, date:'2026-12-02'}`, `emphasis 'outlined'`, `alert` false.
  - F3 interval, due `'2026-11-20'` ⇒ overdue 3, `alert` true, solid.
  - F4 mode none, a completed item with `completed '2026-10-30T09:00:00+01:00'`, no event ⇒ `lastDone` that value, `done` null.
  - F5 sensor mode, open fertilize item due today + conductivity problem ⇒ alert, no done.
  - F6 sensor mode, no item ⇒ status none, no alert.
  - Two open items of the same type ⇒ `done.uids` has both.
  - Light: problems `[{sensor_type:'dli'}]` ⇒ light alert true; texts `[care_sunlight]`; no sunlight text and no problem ⇒ no light row.
  - Soil: texts `[care_soil]`, never alert (even with every problem set); no soil text ⇒ no soil row.
  - Prune hidden when no text, mode none, no last done, no item.
  - `care: null` (Review Focus 3) ⇒ five-or-fewer rows with texts only, every `done` null, every status none.
  - Completed item without `completed` and no event ⇒ `lastDone` null (Review Focus 4).
  - Event value wins over a completed item for `lastDone`.
  - `progressFraction('2026-11-17', '2026-12-02', now)` ⇒ 0.4 (6 of 15 days); due in the past ⇒ 1; either null ⇒ null.
  - `snoozedDue('2026-11-20', 3, now)` ⇒ `'2026-11-26'` (overdue: from today); `snoozedDue('2026-12-02', 1, now)` ⇒ `'2026-12-03'`; `snoozedDue(null, 7, now)` ⇒ `'2026-11-30'`.
  - `msUntilMidnight(new Date(2026, 10, 23, 23, 59, 30))` ⇒ 30000.
  - Rows: interval row with lastDone and due ⇒ `progress` set; sensor-mode row ⇒ `progress` null; `snooze` set when there is a list and an open item due within `SNOOZE_WINDOW_DAYS` (2) days or overdue, in both modes; null otherwise — test due in 2 days ⇒ set, due in 3 days ⇒ null, overdue ⇒ set.
  - `initiallyExpanded('compact')` false; `'full'` and undefined true.

- [ ] **Step 2: Run** `npx vitest run tests/care-model.test.ts` — FAIL (module missing).

- [ ] **Step 3: Implement** `src/care/model.ts`. Parse date-only `due` as a local calendar date; datetime `due` via `new Date()` then take its local calendar date; day difference from calendar dates, not milliseconds.

- [ ] **Step 4: Run** `npx vitest run`, `npx tsc --noEmit`, `npm run lint` — PASS.

- [ ] **Step 5: Commit**
```bash
git add src/care/model.ts tests/care-model.test.ts
git commit -m "Care card: pure row model"
```

---

### Task 2: Shared header renderer

**Files:**
- Create: `src/utils/header.ts`
- Modify: `src/flower-card.ts` (`render()` lines ~289-335: replace the inline header with the helper)

**Interfaces:**
- Produces:
```ts
export interface HeaderParams {
  hass: any; stateObj: any;
  displayType: string | undefined; hideImage: boolean; hideSpecies: boolean;
  name?: CardName;
  badges: TemplateResult | typeof nothing;   // flower card: extra badges + battery; care card: nothing
  imageLightbox: boolean; onImageClick?: () => void;
  onClick: () => void;                        // more-info
}
export function renderPlantHeader(p: HeaderParams): TemplateResult;
```
  Output markup and CSS classes identical to today (`header`/`header-compact`, `no-image`, `#name` with the problem `ha-icon`, `#battery`, `#species`).

- [ ] **Step 1: Run** `npx vitest run` and note the passing count (baseline; this is a refactor with no new pure logic).
- [ ] **Step 2: Move** the header template into `renderPlantHeader`; flower card calls it with its current values.
- [ ] **Step 3: Run** `npx vitest run`, `npx tsc --noEmit`, `npm run lint` — same count passes.
- [ ] **Step 4: Commit**
```bash
git add src/utils/header.ts src/flower-card.ts
git commit -m "Extract the plant header so the care card can share it"
```

---

### Task 3: The `flower-care-card` element

**Files:**
- Create: `src/flower-care-card.ts`, `src/care/styles.ts`
- Modify: `src/flower-card.ts` (add `import './flower-care-card';` at the top level), `src/utils/constants.ts` (`CARE_CARD_NAME = "flower-care-card"`, `careRowIcons`), `src/types/flower-card-types.ts` (`FlowerCareCardConfig`), `src/localize/languages/{en,de,nl}.json`
- Test: `tests/care-card-config.test.ts`, extend `tests/register.test.ts`

**Interfaces:**
- Consumes: Task 1 model, Task 2 `renderPlantHeader`, `style` from `src/styles.ts`, `localize`.
- Produces:
  - `export interface FlowerCareCardConfig extends LovelaceCardConfig { entity: string; display_type?: DisplayType; }`
  - `export function validateCareCardConfig(config: Partial<FlowerCareCardConfig>): FlowerCareCardConfig` — throws `Error("You need to define an entity")` without `entity`; returned config keeps `display_type` as given (pure; used by `setConfig`).
  - `careRowIcons: Record<RowKey, string>` — water `mdi:watering-can-outline`, fertilize `mdi:bottle-tonic-outline`, repot `mdi:flower-pot-outline`, prune `mdi:content-cut`, light `mdi:white-balance-sunny`, soil `mdi:shovel` (reuse `careIcons` values where they exist).
  - Localize keys (en shown; de/nl translated): `care_row_water` "Water", `care_row_fertilize` "Fertilize", `care_row_repot` "Repot", `care_row_prune` "Prune", `care_row_light` "Light", `care_row_soil` "Soil", `care_status_prediction` "~{n} days at this rate", `care_status_due` "due in {n} days ({date})", `care_status_due_today` "due today", `care_status_overdue` "overdue {n} d", `care_last` "Last {date}", `care_not_recorded` "Not recorded yet", `care_every` "every {n} days", `care_done` "Done", `care_no_list` "Choose a to-do list under Configure → Care tasks to track care.", `care_needs_plant` "Update the Plant integration to see care tasks.", `care_card_name` "Flower care card", `care_confirm_early` "Not due until {date}. Mark as done now?", `care_confirm_done` "Mark as done", `care_cancel` "Cancel", `care_snooze` "Snooze", `care_snooze_1d` "1 day", `care_snooze_3d` "3 days", `care_snooze_1w` "1 week".

Element behaviour (not determined by the model):
- `set hass`: store; read `stateObj`; fetch `plant/get_info` with the same 1 s throttle as the flower card; `care = result.care ?? null`.
- When `care.todo_list` changes: unsubscribe the old one, then `hass.connection.subscribeMessage(msg => this.items = msg.items, {type: 'todo/item/subscribe', entity_id})`; on rejection `console.warn` once and keep `items = []`. Unsubscribe in `disconnectedCallback`.
- `lastDone[care]` = `hass.states[care.events[care]]?.state` when it parses as a date; `nextWatering` likewise from `care.next_watering`.
- Rows from `buildCareRows(...)`, rendered in order inside `.care-rows`; CSS (`src/care/styles.ts`) sets `:host { container-type: inline-size }`, `.care-rows { display: grid; grid-template-columns: 1fr }` and `@container (min-width: 600px) { .care-rows { grid-template-columns: 1fr 1fr; column-gap: 28px } }` — row-major, so pairs share a height. *(600 px breakpoint is Claude's call.)*
- Done on an outlined button opens an `ha-dialog` (the repo's dialog pattern: `@state _confirmDialogOpen`, `renderConfirmDialog()` mounted only while open, one `@closed` handler) with the text `care_confirm_early` and two buttons: **Mark as done** (`care_confirm_done`, completes the item(s)) and **Cancel** (`care_cancel`, closes without changes; Escape and clicking outside do the same). Not the browser's `confirm()`. A solid Done completes at once.
- Snooze: ⏰ button opening a small menu (+1 day, +3 days, +1 week); each choice calls `todo.update_item` with `{item: uid, due_date: snoozedDue(...)}` for every uid.
- Progress: a thin bar under the status when `row.progress` is not null (red and full when overdue).
- Midnight: in `connectedCallback` start a `setTimeout(msUntilMidnight(new Date()))` that calls `requestUpdate()` and re-arms itself; clear it in `disconnectedCallback`.
- Expanded state: `@state() expanded: Set<RowKey>`; on first render filled with all keys when `initiallyExpanded(display_type)`; row title click toggles. Folded rows show icon, title, status, Done; alert colour regardless.
- Done click: for each uid `hass.callService('todo', 'update_item', {item: uid, status: 'completed'}, {entity_id: care.todo_list})`.
- `care === null` ⇒ a hint row `care_needs_plant`; `care.todo_list === null` ⇒ hint row `care_no_list`.
- `static getConfigForm()`: `entity` (domain plant, required) and `display_type` select (`full`/`compact`, labels `settings_full`/`settings_compact`), same pattern as the flower card.
- `getStubConfig`: first `plant.*` entity, `display_type: 'full'`. `getCardSize()`: 6. `getGridOptions()`: `{ columns: 6, min_columns: 4, rows: 'auto' }`.
- Registration exactly like the flower card: guarded `customElements.define(CARE_CARD_NAME, FlowerCareCard)` and a de-duplicated `window.customCards` entry (`name: localize(..., 'care_card_name')`, `preview: true`, `getEntitySuggestion` returning a full and a compact suggestion for `plant.*`).

- [ ] **Step 1: Write failing tests**:
  - `tests/care-card-config.test.ts`: `validateCareCardConfig({})` throws "You need to define an entity"; `validateCareCardConfig({entity:'plant.x', display_type:'compact'})` returns it unchanged.
  - `tests/register.test.ts`: after importing `src/flower-card.ts`, `customElements.get('flower-care-card')` is defined and `window.customCards` contains exactly one entry with `type: 'flower-care-card'` (import twice, still one).
  - `tests/localize.test.ts` (existing style): every `care_*` key above exists in en, de and nl.
- [ ] **Step 2: Run** `npx vitest run` — FAIL.
- [ ] **Step 3: Implement** the element, styles, constants, types and translations as above.
- [ ] **Step 4: Run** `npx vitest run`, `npx tsc --noEmit`, `npm run lint` — PASS.
- [ ] **Step 5: Commit**
```bash
git add src tests
git commit -m "Add the plant-care card"
```

---

### Task 4: README and PR

**Files:**
- Modify: `README.md` (new "Plant care card" section)
- Add: `docs/superpowers/specs/2026-11-23-plant-care-card-design.md`, this plan

- [ ] **Step 1: Write** the README section: config (`type: custom:flower-care-card`, `entity`, `display_type`), what each row shows, sensor vs interval mode via plant's problem-trigger checkboxes, **no to-do list ⇒ no due dates and no Done buttons**, compact vs full, wide layout, required plant version (the 2026.12 release carrying the `care` block).
- [ ] **Step 2: Run** `npx vitest run`, `npx tsc --noEmit`, `npm run lint` — PASS.
- [ ] **Step 3: Commit, push, open the PR** (label `enhancement`), watch CI to green: `gh pr checks <n> --watch`.
```bash
git add README.md docs/superpowers
git commit -m "Document the plant-care card"
git push -u origin feature/plant-care-card
```
- [ ] **Step 4: Manual check on octopus** after plant's PR #583 is deployed there: deploy a test build with `ha-config/scripts/deploy_custom_card.py`, put the card for Monstéra (`plant.plant_004`) and Sølvamarant (`plant.plant_003`) on the test-width view in full, compact and a wide (12-column) placement; tick a Done and confirm the item completes in `todo.plant_care` and the row updates.
