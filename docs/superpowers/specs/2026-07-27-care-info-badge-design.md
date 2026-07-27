# Care Info Badge — Design

**Status:** Approved (brainstorm 2026-07-27)

**Goal:** Add an opt-in `extra_badges` entry, `type: care_info`, that renders a
badge which opens the plant's care information in an `ha-dialog` popup when
tapped. This lets users keep the card uncluttered while care details stay one
click away — "some info in the card, more on click on the badge."

Closes #305 (Feature request: allow care information to be folded).

## Motivation

Today care info renders as an always-visible `.care-info` block at the bottom
of the card (`renderCareInfo`, driven by the `show_care` field list). #305 asks
for a less cluttered view with care still one click away. Rather than folding
the inline block, this design offers care as a **badge-triggered popup** — a
cleaner separation that leaves the card body free while giving on-demand access
to the full care detail.

## Design principles

- **Opt-in, no regressions.** Existing cards with inline `show_care` are
  unchanged. The feature only activates when a `type: care_info` badge is added.
- **Independent of inline care.** The popup does not replace or suppress the
  inline block. Both can render. A user can show a small teaser inline via
  `show_care` and the full set in the popup — that is the intended use.
- **DRY.** The popup reuses the exact care-item markup and the existing
  `selectCareInfo` selection logic. No parallel rendering path.
- **YAML-only, consistent with all badges.** `extra_badges` is not in the visual
  editor's `ha-form` schema today; the care badge follows suit. No editor work.

## Config surface

`extra_badges` items are objects. The care badge is discriminated by a new
`type` field:

```yaml
extra_badges:
  # minimal — popup shows ALL care fields the plant has
  - type: care_info

  # curated
  - type: care_info
    fields: [care_watering, care_sunlight, care_soil]  # subset, ordered by careFields
    icon: mdi:sprout          # optional, default mdi:sprout
    color: green              # optional, default var(--secondary-text-color)
    title: "Plant Care"       # optional dialog heading, default "Care"
```

### `ExtraBadge` interface additions (`src/types/flower-card-types.ts`)

```ts
export interface ExtraBadge {
    type?: string;        // NEW: badge-type discriminator, e.g. "care_info"
    fields?: string[];    // NEW: (care_info) care fields for the popup; default = all
    title?: string;       // NEW: (care_info) dialog heading; default "Care"
    entity?: string;
    attribute?: string;
    icon?: string;        // reused: badge icon (care_info default mdi:sprout)
    color?: string;       // reused: badge icon color
    color_on?: string;
    color_off?: string;
    text?: string;
    show_state?: boolean;
}
```

Field semantics for `type: care_info`:

| Field | Default | Meaning |
|-------|---------|---------|
| `fields` | all `careFields` values | Which care fields appear in the popup, filtered to known care fields and to those with non-empty text on the entity. |
| `icon` | `mdi:sprout` | Badge icon. |
| `color` | `var(--secondary-text-color)` | Badge icon color. |
| `title` | `"Care"` | `ha-dialog` heading. |

`fields` is validated the same way inline `show_care` is: only values present in
`careFields` (`care_watering`, `care_sunlight`, `care_soil`, `care_pruning`,
`care_fertilization`) are honored; unknown values are ignored. Order follows
`careFields`, matching inline behavior.

## Rendering

### 1. Reactive state (`src/flower-card.ts`)

`FlowerCard` (a `LitElement`) gains its first component-local UI state:

```ts
@state() private _careDialogOpen = false;
@state() private _careDialogFields?: string[];
@state() private _careDialogTitle = "Care";
```

(Import `state` from `lit/decorators.js` alongside the existing decorators.)

### 2. Badge click path (`src/utils/attributes.ts`)

`renderExtraBadge` checks the care type **first**, before the existing
text/entity/icon branches:

```ts
if (badge.type === 'care_info') {
    return renderCareBadge(card, badge);
}
```

`renderCareBadge` renders a standard `.extra-badge tooltip` with:
- icon = `badge.icon || 'mdi:sprout'`
- color = `badge.color || 'var(--secondary-text-color)'`
- tooltip tip = `badge.title || 'Care'`
- `@click` handler that calls a card method opening the dialog and stashing the
  badge's field list + title:

```ts
@click="${(e: Event) => { e.stopPropagation(); card.openCareDialog(badge); }}"
```

`FlowerCard.openCareDialog(badge)` sets:
```ts
this._careDialogFields = badge.fields ?? careFields.map(f => f.value);
this._careDialogTitle = badge.title ?? "Care";
this._careDialogOpen = true;
```

The badge always renders (it does not depend on care content being present); if
the plant has no matching care fields, the opened dialog simply shows an
"empty" state (see §4).

### 3. DRY care-item rendering (`src/utils/attributes.ts`)

Extract the item list from today's `renderCareInfo` into a shared helper so both
the inline block and the popup produce identical markup:

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
```

`renderCareInfo` (inline) becomes:
```ts
const entries = selectCareInfo(attributes, config.show_care);
if (entries.length === 0) return html``;
return html`<div class="care-info">${renderCareItems(entries)}</div>`;
```

Its observable output is unchanged (same `.care-info` wrapper + items).

### 4. The dialog (`src/flower-card.ts`, end of `render()`)

Rendered once, appended after the main card content, active only when open:

```ts
${this._careDialogOpen ? this.renderCareDialog() : html``}
```

`renderCareDialog()`:
```ts
const attributes = this.config?.entity
    ? this._hass.states[this.config.entity]?.attributes
    : undefined;
const entries = selectCareInfo(attributes, this._careDialogFields);
return html`
    <ha-dialog open heading="${this._careDialogTitle}"
        @closed="${() => { this._careDialogOpen = false; }}">
        ${entries.length > 0
            ? html`<div class="care-info care-info--dialog">${renderCareItems(entries)}</div>`
            : html`<div class="care-info-empty">No care information available.</div>`}
    </ha-dialog>
`;
```

`ha-dialog` is an ambient Home Assistant custom element (globally registered by
the frontend); it requires no import and provides the modal, backdrop,
ESC-to-close, and accessibility behavior. `@closed` fires for backdrop click,
ESC, and the close button — the single reset point.

## Styling (`src/styles.ts`)

Reuse `.care-info` / `.care-item` inside the dialog. Add minimal rules only if
needed for dialog padding (e.g. `.care-info--dialog { padding: 4px 0; }`) and a
muted `.care-info-empty`. No changes to existing selectors.

## Interaction with `show_care`

Fully independent:
- Inline `.care-info` renders iff `show_care` lists fields with content (today's
  behavior, untouched).
- The badge popup renders `fields` (default all) regardless of `show_care`.
- Both may show simultaneously — intended (teaser inline, full set in popup).

## Editor

No changes. `extra_badges` is YAML-only (not present in the `getConfigForm`
`ha-form` schema); the care badge is configured in YAML like every other badge.
The docs already state badges are YAML-only.

## Documentation (`EXTRA_BADGES.md`)

Add a "🌿 Care Info Badge" section and a Table-of-Contents entry. Document the
`type`/`fields`/`icon`/`color`/`title` options, the default-all behavior, and
that it is independent of inline `show_care`. Add a `- type: care_info` line to
the Combined Example.

## Testing (`vitest`)

- `selectCareInfo` already covered for `show_care`; add cases proving the popup's
  default-all list (`careFields.map(f => f.value)`) selects every field with
  content, and that an explicit `fields` subset narrows correctly and ignores
  unknown values.
- `renderExtraBadge`: a `{ type: 'care_info' }` badge takes the care branch —
  not the entity/text/icon branches — and renders a click handler; default icon
  is `mdi:sprout`; `icon`/`color`/`title` overrides are honored.
- `openCareDialog(badge)` sets `_careDialogOpen = true`, `_careDialogFields` to
  `badge.fields ?? all`, and `_careDialogTitle` to `badge.title ?? "Care"`.
- The dialog closes (`_careDialogOpen = false`) on the `@closed` event.
- Popup content is independent of `show_care` (a badge with no `show_care`
  configured still yields care entries).

## Out of scope (YAGNI)

- Remembering open/closed state across reloads or navigations.
- A visual (GUI) editor for `extra_badges` / the care badge.
- Per-field ordering beyond the existing `careFields` order.
- Animations beyond what `ha-dialog` provides.

## Files touched

- `src/types/flower-card-types.ts` — `ExtraBadge` gains `type`, `fields`, `title`.
- `src/utils/attributes.ts` — `renderCareItems` extraction; `renderCareBadge`;
  `care_info` branch in `renderExtraBadge`.
- `src/flower-card.ts` — `@state` fields; `openCareDialog`; `renderCareDialog`;
  dialog mount in `render()`.
- `src/styles.ts` — minimal dialog/empty-state rules.
- `EXTRA_BADGES.md` — new section + TOC + combined example.
- `tests/` — new vitest cases per above.

Note: `flower-card.js` / `flower-card.js.gz` are build artifacts rebuilt by CI's
Auto Release; they are **not** committed in this PR.
