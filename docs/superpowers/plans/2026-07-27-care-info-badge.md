# Care Info Badge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in `extra_badges` entry `type: care_info` that renders a badge which opens the plant's care info in an `ha-dialog` popup on tap, independent of the inline care block.

**Architecture:** Push all decision logic into pure, exported helpers in `src/utils/attributes.ts` (this repo unit-tests pure logic only). Rendering functions consume those helpers. The card (`FlowerCard`, a `LitElement`) gains its first `@state` for dialog open/fields/title and renders a native `ha-dialog` on demand. Care-item markup is extracted once and reused by both the inline block and the popup.

**Tech Stack:** TypeScript, Lit (LitElement + `lit/decorators.js`), vitest (jsdom), eslint.

**Spec:** `docs/superpowers/specs/2026-07-27-care-info-badge-design.md`

## Global Constraints

Every task's requirements implicitly include these:

- **Never run `npm run build` / `npm run dev` / webpack.** They regenerate `flower-card.js` and `flower-card.js.gz`. Those built artifacts must **NOT** be committed — CI's Auto Release rebuilds them. If they appear in `git status`, do not stage them.
- **Branch:** `feature/care-info-badge` (already created, based on merged `origin/main`). Do not switch branches.
- **Testing convention (repo-wide):** unit-test **pure exported functions only** — never instantiate the LitElement, never assert on Lit `TemplateResult`/DOM. See `tests/care.test.ts` and `tests/flower-card.test.ts` for the established style. Rendering/markup changes are verified by `npx tsc --noEmit`, `npm run lint`, and the existing regression suite staying green.
- **Per-task verification commands:**
  - Tests: `npx vitest run <file>` (and `npx vitest run` for the full suite)
  - Types: `npx tsc --noEmit` (must exit 0)
  - Lint: `npm run lint` (must pass)
- **Behavior:** the care badge is opt-in; it does **not** suppress or alter the inline `renderCareInfo` block (both may render). No changes to the visual editor (`getConfigForm`) — `extra_badges` is YAML-only.
- **Defaults:** badge icon `mdi:sprout`; badge/dialog color `var(--secondary-text-color)`; dialog title `"Care"`; popup fields = all `careFields` values (in `careFields` order) when `fields` is omitted (`undefined`). An explicitly empty `fields: []` shows nothing (documented).
- **`ha-dialog`** is an ambient Home Assistant custom element — do not import it.

---

### Task 1: Config types + pure care-badge logic

**Files:**
- Modify: `src/types/flower-card-types.ts` (extend `ExtraBadge`)
- Modify: `src/utils/attributes.ts` (add constants + pure helpers)
- Test: `tests/care-badge.test.ts` (new)

**Interfaces:**
- Consumes: `careFields` from `src/utils/constants.ts`; `ExtraBadge`, `CareEntry` types.
- Produces (all exported from `src/utils/attributes.ts`):
  - `CARE_BADGE_TYPE = 'care_info'` (string const)
  - `isCareBadge(badge: ExtraBadge): boolean`
  - `resolveCareBadgeFields(badge: ExtraBadge): string[]`
  - `computeCareDialogState(badge: ExtraBadge): { open: boolean; fields: string[]; title: string }`
  - `careBadgeVisual(badge: ExtraBadge): { icon: string; color: string; tip: string }`

- [ ] **Step 1: Extend the `ExtraBadge` interface**

In `src/types/flower-card-types.ts`, add three optional fields to the top of the `ExtraBadge` interface (keep existing fields):

```ts
export interface ExtraBadge {
    type?: string;        // Badge type discriminator (e.g. "care_info")
    fields?: string[];    // care_info: care fields shown in the popup (default: all)
    title?: string;       // care_info: dialog heading (default: "Care")
    entity?: string;      // Entity ID for sensor/binary_sensor
    attribute?: string;   // Entity attribute to display instead of state (e.g., "last_changed")
    icon?: string;        // Icon to display (default: entity's icon or mdi:information)
    color?: string;       // Color for regular sensors/text
    color_on?: string;    // Color when binary_sensor is "on" (default: green)
    color_off?: string;   // Color when binary_sensor is "off" (default: grey)
    text?: string;        // Static text to display (alternative to entity)
    show_state?: boolean; // Show state value next to icon (default: false)
}
```

- [ ] **Step 2: Write the failing tests**

Create `tests/care-badge.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  CARE_BADGE_TYPE,
  isCareBadge,
  resolveCareBadgeFields,
  computeCareDialogState,
  careBadgeVisual,
} from '../src/utils/attributes';
import { careFields } from '../src/utils/constants';
import { ExtraBadge } from '../src/types/flower-card-types';

const ALL = careFields.map(f => f.value);

describe('care badge logic', () => {
  describe('isCareBadge', () => {
    it('is true only for type care_info', () => {
      expect(isCareBadge({ type: CARE_BADGE_TYPE })).toBe(true);
      expect(isCareBadge({ type: 'care_info' })).toBe(true);
      expect(isCareBadge({ entity: 'sensor.x' })).toBe(false);
      expect(isCareBadge({ text: 'Hi' })).toBe(false);
      expect(isCareBadge({})).toBe(false);
    });
  });

  describe('resolveCareBadgeFields', () => {
    it('defaults to all care fields when fields omitted', () => {
      expect(resolveCareBadgeFields({ type: CARE_BADGE_TYPE })).toEqual(ALL);
    });
    it('returns the given subset when fields provided', () => {
      const badge: ExtraBadge = { type: CARE_BADGE_TYPE, fields: ['care_soil', 'care_watering'] };
      expect(resolveCareBadgeFields(badge)).toEqual(['care_soil', 'care_watering']);
    });
    it('passes an explicit empty array through (shows nothing)', () => {
      expect(resolveCareBadgeFields({ type: CARE_BADGE_TYPE, fields: [] })).toEqual([]);
    });
  });

  describe('computeCareDialogState', () => {
    it('opens with all fields and default title', () => {
      expect(computeCareDialogState({ type: CARE_BADGE_TYPE })).toEqual({
        open: true, fields: ALL, title: 'Care',
      });
    });
    it('honors fields and title overrides', () => {
      const badge: ExtraBadge = { type: CARE_BADGE_TYPE, fields: ['care_watering'], title: 'Plant Care' };
      expect(computeCareDialogState(badge)).toEqual({
        open: true, fields: ['care_watering'], title: 'Plant Care',
      });
    });
  });

  describe('careBadgeVisual', () => {
    it('uses default icon, color and tip', () => {
      expect(careBadgeVisual({ type: CARE_BADGE_TYPE })).toEqual({
        icon: 'mdi:sprout', color: 'var(--secondary-text-color)', tip: 'Care',
      });
    });
    it('honors icon, color and title overrides', () => {
      const badge: ExtraBadge = { type: CARE_BADGE_TYPE, icon: 'mdi:leaf', color: 'green', title: 'Care Guide' };
      expect(careBadgeVisual(badge)).toEqual({
        icon: 'mdi:leaf', color: 'green', tip: 'Care Guide',
      });
    });
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run tests/care-badge.test.ts`
Expected: FAIL — imports `CARE_BADGE_TYPE`, `isCareBadge`, etc. do not exist yet.

- [ ] **Step 4: Implement the helpers**

In `src/utils/attributes.ts`, add the following near the existing `selectCareInfo` / `renderCareInfo` functions (they reference `careFields` and `ExtraBadge`, both already imported in this file):

```ts
/** Discriminator value for the care-info badge (extra_badges: - type: care_info). */
export const CARE_BADGE_TYPE = 'care_info';

/** True when an extra_badges item is the care-info badge. */
export const isCareBadge = (badge: ExtraBadge): boolean => badge.type === CARE_BADGE_TYPE;

/** Popup field list for a care badge: its `fields`, or ALL care fields when omitted. */
export const resolveCareBadgeFields = (badge: ExtraBadge): string[] =>
    badge.fields ?? careFields.map(f => f.value);

/** Open-dialog state derived from a tapped care badge. */
export const computeCareDialogState = (
    badge: ExtraBadge,
): { open: boolean; fields: string[]; title: string } => ({
    open: true,
    fields: resolveCareBadgeFields(badge),
    title: badge.title ?? 'Care',
});

/** Badge icon/color/tooltip for a care badge, with defaults. */
export const careBadgeVisual = (
    badge: ExtraBadge,
): { icon: string; color: string; tip: string } => ({
    icon: badge.icon ?? 'mdi:sprout',
    color: badge.color ?? 'var(--secondary-text-color)',
    tip: badge.title ?? 'Care',
});
```

- [ ] **Step 5: Run tests, types, lint**

Run: `npx vitest run tests/care-badge.test.ts` → Expected: PASS (all cases)
Run: `npx tsc --noEmit` → Expected: exit 0
Run: `npm run lint` → Expected: pass

- [ ] **Step 6: Commit**

```bash
git add src/types/flower-card-types.ts src/utils/attributes.ts tests/care-badge.test.ts
git commit -m "feat: care-badge config types and pure logic helpers"
```

---

### Task 2: Care-item DRY extraction + badge rendering

**Files:**
- Modify: `src/utils/attributes.ts` (add `renderCareItems`, refactor `renderCareInfo`, add `renderCareBadge`, add `care_info` branch to `renderExtraBadge`)

**Interfaces:**
- Consumes: `isCareBadge`, `careBadgeVisual` (Task 1); `selectCareInfo`, `CareEntry` (existing); `FlowerCard` type (existing param type of `renderExtraBadge`); `card.openCareDialog(badge)` (added in Task 3 — a public method `openCareDialog(badge: ExtraBadge): void`).
- Produces: `renderCareItems(entries: CareEntry[]): TemplateResult`; `renderCareBadge(card: FlowerCard, badge: ExtraBadge): TemplateResult`.

**Note on ordering:** `renderCareBadge`'s click handler calls `card.openCareDialog(badge)`, which is defined in Task 3. TypeScript resolves this only after Task 3 adds the method. Therefore **run `npx tsc --noEmit` for this task only after Task 3**, OR (preferred) implement Task 2 and Task 3 back-to-back and typecheck once at the end of Task 3. Within Task 2, the regression check is the existing suite; the full typecheck gate lives at the end of Task 3. This is called out so the reviewer does not treat the deferred typecheck as a defect.

- [ ] **Step 1: Extract `renderCareItems` and refactor `renderCareInfo`**

In `src/utils/attributes.ts`, add the shared item renderer and rewrite `renderCareInfo` to use it. The rendered markup must be **byte-for-byte equivalent** to today's output (same `.care-info` wrapper, same `.care-item`/`.care-heading`/`.care-text` structure).

```ts
export const renderCareItems = (entries: CareEntry[]): TemplateResult => html`
    ${entries.map(entry => html`
        <div class="care-item">
            <div class="care-heading">
                <ha-icon .icon="${entry.icon}"></ha-icon>
                <span>${entry.label}</span>
            </div>
            <div class="care-text">${entry.text}</div>
        </div>
    `)}
`;

export const renderCareInfo = (card: FlowerCard): TemplateResult => {
    const config = card.config;
    if (!config) return html``;

    const entity = config.entity;
    const attributes = entity ? card._hass.states[entity]?.attributes : undefined;
    const entries = selectCareInfo(attributes, config.show_care);
    if (entries.length === 0) return html``;

    return html`
        <div class="care-info">
            ${renderCareItems(entries)}
        </div>
    `;
};
```

- [ ] **Step 2: Add `renderCareBadge`**

Add near `renderExtraBadge` in `src/utils/attributes.ts`:

```ts
export const renderCareBadge = (card: FlowerCard, badge: ExtraBadge): TemplateResult => {
    const { icon, color, tip } = careBadgeVisual(badge);
    return html`
        <div class="extra-badge tooltip" @click="${(e: Event) => { e.stopPropagation(); card.openCareDialog(badge); }}">
            <div class="tip" style="text-align:center;">${tip}</div>
            <ha-icon .icon="${icon}" style="color: ${color}"></ha-icon>
        </div>
    `;
};
```

- [ ] **Step 3: Route care badges in `renderExtraBadge`**

At the very top of `renderExtraBadge` (before the existing text/entity/icon branches), add:

```ts
    // Care info badge - opens a dialog with care details
    if (isCareBadge(badge)) {
        return renderCareBadge(card, badge);
    }
```

- [ ] **Step 4: Verify existing suite + lint still pass**

Run: `npx vitest run` → Expected: PASS (existing `care.test.ts` and all others unchanged — proves the `renderCareInfo` refactor preserved selection behavior)
Run: `npm run lint` → Expected: pass
(Defer `npx tsc --noEmit` to the end of Task 3 per the note above.)

- [ ] **Step 5: Commit**

```bash
git add src/utils/attributes.ts
git commit -m "feat: render care badge and extract shared care-item markup"
```

---

### Task 3: Dialog state, open/close, and styles

**Files:**
- Modify: `src/flower-card.ts` (imports, `@state` fields, `openCareDialog`, `_closeCareDialog`, `renderCareDialog`, mount in `render()`)
- Modify: `src/styles.ts` (dialog padding + empty-state rules)

**Interfaces:**
- Consumes: `computeCareDialogState`, `selectCareInfo`, `renderCareItems` (Tasks 1–2); `ExtraBadge` type; `careFields` (already imported).
- Produces: `FlowerCard.openCareDialog(badge: ExtraBadge): void` (public — called by `renderCareBadge`).

- [ ] **Step 1: Update imports in `src/flower-card.ts`**

Line 2 — add `state`:
```ts
import { customElement, property, state } from 'lit/decorators.js';
```
Line 5 — add `ExtraBadge`:
```ts
import { DisplayType, EntitySuggestion, ExtraBadge, FlowerCardConfig, HomeAssistantEntity, PlantInfo } from './types/flower-card-types';
```
Line 7 — add `computeCareDialogState`, `renderCareItems`, and `selectCareInfo`:
```ts
import { computeCareDialogState, renderAttributes, renderBattery, renderCareInfo, renderCareItems, renderExtraBadges, selectCareInfo } from './utils/attributes';
```

- [ ] **Step 2: Add reactive state fields**

Immediately after the existing `@property() config?: FlowerCardConfig;` (around line 45), add:

```ts
    @state() private _careDialogOpen = false;
    @state() private _careDialogFields: string[] = [];
    @state() private _careDialogTitle = 'Care';
```

- [ ] **Step 3: Add open/close methods**

Add these methods to the `FlowerCard` class (e.g. just before `render()`):

```ts
    openCareDialog(badge: ExtraBadge): void {
        const { open, fields, title } = computeCareDialogState(badge);
        this._careDialogFields = fields;
        this._careDialogTitle = title;
        this._careDialogOpen = open;
    }

    private _closeCareDialog(): void {
        this._careDialogOpen = false;
    }
```

(`computeCareDialogState`, `selectCareInfo`, and `renderCareItems` were already added to the line 7 import in Step 1.)

- [ ] **Step 4: Add `renderCareDialog`**

Add this method to the `FlowerCard` class:

```ts
    private renderCareDialog(): HTMLTemplateResult {
        const entity = this.config?.entity;
        const attributes = entity ? this._hass?.states[entity]?.attributes : undefined;
        const entries = selectCareInfo(attributes, this._careDialogFields);
        return html`
            <ha-dialog open heading="${this._careDialogTitle}" @closed="${() => this._closeCareDialog()}">
                ${entries.length > 0
                    ? html`<div class="care-info care-info--dialog">${renderCareItems(entries)}</div>`
                    : html`<div class="care-info-empty">No care information available.</div>`}
            </ha-dialog>
        `;
    }
```

- [ ] **Step 5: Mount the dialog in `render()`**

In `render()`, insert the dialog as the last node of the returned template — after `</ha-card>` (currently line 250) and before the closing backtick:

```ts
            </ha-card>
            ${this._careDialogOpen ? this.renderCareDialog() : html``}
            `;
```

- [ ] **Step 6: Add styles**

In `src/styles.ts`, insert after the `.care-text { ... }` rule (ends at the `}` on the line before the closing `` `; `` of the `css` template):

```css
.care-info--dialog {
  padding: 4px 4px 8px;
}
.care-info-empty {
  padding: 8px 4px;
  color: var(--secondary-text-color);
}
```

- [ ] **Step 7: Full verification gate (Tasks 2 + 3 together)**

Run: `npx tsc --noEmit` → Expected: exit 0 (now that `openCareDialog` exists, `renderCareBadge`'s call resolves)
Run: `npx vitest run` → Expected: PASS (full suite, incl. `care-badge.test.ts`)
Run: `npm run lint` → Expected: pass
Run: `git status --porcelain` → confirm **no** `flower-card.js` / `flower-card.js.gz` are staged or modified. If webpack was never run, they will be untouched.

- [ ] **Step 8: Commit**

```bash
git add src/flower-card.ts src/styles.ts
git commit -m "feat: care-info dialog opened from the care badge"
```

---

### Task 4: Documentation

**Files:**
- Modify: `EXTRA_BADGES.md` (TOC entry, new section, combined example)

**Interfaces:** none (docs only).

- [ ] **Step 1: Add a Table-of-Contents entry**

In `EXTRA_BADGES.md`, in the `## 📑 Table of Contents` list, add a line for the new section immediately after the "Action Button Badge" entry:

```md
  - [🌿 Care Info Badge](#-care-info-badge)
```

- [ ] **Step 2: Add the badge to the Options table**

In the `## ⚙️ Badge Options` table, add rows for the care-badge options (append after `show_state`):

```md
| `type` | string | Badge type discriminator. Set to `care_info` for the care popup badge. |
| `fields` | string[] | (`care_info`) Care fields shown in the popup. Default: all care fields. |
| `title` | string | (`care_info`) Dialog heading. Default: `Care`. |
```

- [ ] **Step 3: Add the "Care Info Badge" section**

Add this section immediately before the `## 🧩 Combined Example` section:

````md
## 🌿 Care Info Badge

Show the plant's care information in a popup dialog instead of inline on the card — keeps the card uncluttered while care details stay one tap away. Independent of the inline [Care Info](README.md) (`show_care`) block: you can show a short teaser inline and the full set in the popup.

Minimal — the popup shows **all** available care fields:

```yaml
extra_badges:
  - type: care_info
```

Customized — curate the fields, icon, color, and dialog title:

```yaml
extra_badges:
  - type: care_info
    fields:
      - care_watering
      - care_sunlight
      - care_soil
    icon: mdi:sprout        # default: mdi:sprout
    color: green            # default: theme secondary text color
    title: Plant Care       # default: "Care"
```

Available `fields` values: `care_watering`, `care_sunlight`, `care_soil`, `care_pruning`, `care_fertilization`. Only fields the plant actually provides are shown; an explicit empty list (`fields: []`) shows nothing.

Tapping the badge opens a modal dialog with the selected care text. The badge is fully independent of the inline `show_care` setting.

---
````

- [ ] **Step 4: Add to the Combined Example**

In the `## 🧩 Combined Example` YAML block, add a care badge entry to `extra_badges`:

```yaml
  - type: care_info
    icon: mdi:sprout
```

- [ ] **Step 5: Verify links and render**

Confirm the new TOC anchor `#-care-info-badge` matches the heading `## 🌿 Care Info Badge` (GitHub lowercases, drops emoji, and hyphenates: `care-info-badge`). No build/test needed for docs.

- [ ] **Step 6: Commit**

```bash
git add EXTRA_BADGES.md
git commit -m "docs: document the care_info badge in EXTRA_BADGES.md"
```

---

## Post-implementation (controller / final review)

- Full suite green: `npx vitest run`; types clean: `npx tsc --noEmit`; lint clean: `npm run lint`.
- **Do not** run `npm run build`; confirm `flower-card.js` / `flower-card.js.gz` are **not** in the diff.
- Open a PR to `main`, label it `enhancement` (and/or `feature`) so the release notes categorize it under 🚀 Features & Enhancements. Reference #305.
- Version bump (`package.json`) is a **separate** release step, not part of this feature PR — a version bump is what triggers CI's Auto Release.
