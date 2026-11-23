# Plant-care card — design

**Date:** 2026-11-23
**Status:** Ready for Olen's review (builder check done)
**Repos:** `Olen/lovelace-flower-card` (the card) and `Olen/homeassistant-plant` (the data it needs)
**Related:** plant #581 (care-tracking design), draft PR plant #583 (care PoC, branch `feature/care-todo-poc`), plant #582 (conductivity reported low when soil dries), milestone 2026.12
**Location:** committed with its plans, like the other tracked specs in this repo.

## Intent

The flower card shows a plant's *state*: sensor values, threshold bars, problems. The new **plant-care card** shows what the plant *needs*: what to do, when, and how. It covers the OpenPlantbook care text, the predicted next watering, open care items from the plant's to-do list, and a way to mark care as done when no sensor can tell.

Both cards stay side by side on a dashboard: the flower card for values, the care card for tasks.

## Goals

- One card per plant, with the flower card's header and a body of one row per care area.
- Every date the card shows comes from the to-do list or from the plant's per-type care event entities. The card computes and stores nothing of its own.
- Sensor readings that the user trusts drive care items automatically. Users whose sensors are unreliable can switch to time-based tracking with settings that already exist.
- Works in narrow (1 column) and wide (2 columns) placements in every view type.

## Non-goals

- **An overview card** of all plants ("what needs doing today", e.g. per area). Wanted later, as a separate design.
- **Custom care types** (user-defined name + interval, an "Other" row). Later, as a separate design in plant.
- **Clearing a problem from the card.** Problems are measurements; plant keeps no override state.
- **Editing care text or intervals from the card.** That is plant's options flow.

## Anti-goals

- The card inventing a due date, "last done" date or interval of its own. Every date must trace back to a to-do item or one of the plant's care event entities.
- Shortening or rewriting OpenPlantbook care text. It is shown as written.
- Plant storing care state of its own (the hard rule from #581: only HA built-ins persist anything — to-do list, event entity restore, recorder).

## Constraints

- Plant keeps no runtime state. The to-do list is the store; the per-type care event entities are the "last done" record.
- Due dates exist only as `due` on to-do items. **No to-do list ⇒ no due dates, no overdue, no Done buttons.** This must be documented in the card README, and the card shows a short hint pointing to plant's Configure → Care tasks.
- Plant-side items are matched by the description marker `plant.<id> · <care>` (`care.py`, `MARKER_SEPARATOR = " · "`). The card must match exactly the same format.
- `completed` timestamps exist only on local_todo, caldav, google_tasks and icloud lists (from #581). Other backends still work for open items.
- HA minimum for the 2026.12 release is 2026.8 (plant #584).

## Where it lives

A second card in the **flower-card repo**, built and bundled into plant the same way as the flower card (see the bundling design in plant, `docs/superpowers/specs/2026-11-03-bundle-flower-card-design.md`). It reuses the flower card's header rendering, styles, localisation and `careFields` constants (icons, labels) instead of copying them.

## The card

### Header

Same as the flower card: round image, name, species, problem badge. With `display_type: compact` the header is the flower card's compact header.

### Body: one row per care area, fixed order

| # | Row | Care text (attribute) | Action type | Sensor / trigger that can drive it |
|---|---|---|---|---|
| 1 | 💧 Water | `care_watering` | yes | moisture, `moisture_trigger` |
| 2 | 🧪 Fertilize | `care_fertilization` | yes | conductivity, `conductivity_trigger` |
| 3 | 🪴 Repot | — | yes | none |
| 4 | ✂️ Prune | `care_pruning` | yes (new) | none |
| 5 | ☀️ Light | `care_sunlight` | no, text only | illuminance / DLI, `illuminance_trigger`, `dli_trigger` (red only) |
| 6 | 🪨 Soil | `care_soil` | no, text only | none |

Each row: icon, title, a status after the title ("~2 days at this rate", "due in 9 days (2 Dec)", "overdue 3 d", "due today"), a sub-line (last done, interval, current reading), the care text, and a Done button where the rules below give one.

Row shown or hidden: *builder's call*, with this guidance — a row with nothing to say (no care text, no item, never done, no sensor) may be hidden; Water, Fertilize and Repot are always shown so "not recorded yet" is visible.

### Data sources

| What | Source |
|---|---|
| Care text | `care_*` attributes on `plant.<id>`, shown verbatim; missing attribute ⇒ no text |
| Which to-do list | `care_todo_list` attribute on `plant.<id>` (null ⇒ no list) |
| Problems (red rows) | `problems` attribute on `plant.<id>` (list of `{sensor_type, status, …}`) |
| Last done | **one event entity per care type**: `event.<plant>_watered`, `_fertilized`, `_repotted`, `_pruned` (HA restores each, so per-type dates survive restarts and recorder purges). Replaces the PoC's single `event.<plant>_care` |
| Open items, due dates | the to-do list's items with this plant's marker |
| Predicted watering | a timestamp sensor from plant: when moisture reaches its min at the linear 96 h slope since the last watering (#581, backtested). Unavailable until there is enough data. Shown with or without a list, worded as information, not a deadline. Only for plants with a moisture sensor *(Claude's call; details belong in plant's design)* |
| Current moisture / trend | the plant's moisture sensor |
| Tracking mode per care type | must be exposed by plant (see "Changes in plant") |

How the card finds the event entity, the moisture sensor and the prediction for a given plant (extend `plant/get_info`, new attributes, or the entity/device registry) is *builder's call*; prefer whatever plant already uses for the flower card.

The card must update live when items change in the list, including ticks made elsewhere (to-do panel, a CalDAV client). HA's `todo/item/subscribe` websocket command is the obvious mechanism.

### Tracking mode: the existing trigger checkboxes decide

Plant already has per-plant checkboxes "Use … as problem trigger". They now also mean "I trust this sensor for care":

- **Trigger checked (and the sensor exists):** sensor mode. The sensor opens and closes the to-do item; the card shows **no Done button**.
- **Trigger unchecked, or no sensor:** interval mode, if an interval is set. Plant keeps the next item open; the card shows a Done button.
- **Both trigger checked and interval set:** the sensor wins; the interval is ignored until the trigger is unchecked. *(Claude's call.)*
- **Trusting a sensor means accepting what it reports.** Neither plant nor the card works around flaky sensors (Olen). If conductivity rises after a plain watering, sensor mode closes the fertilize item and records `fertilized` — the sensor saw enough nutrients. Users who don't trust the sensor uncheck its trigger and use an interval.
- **Switching mode** (a trigger checkbox changes): plant removes this plant's open items of that care type, and the new mode plans its own. No open item is ever left without something that can close it. *(Claude's call.)*

### Case by case

**💧 Water**

| Case | Situation | Row | Done |
|---|---|---|---|
| W1 | No to-do list | Prediction (if moisture sensor), current moisture, last watered (detected waterings — the event entities work without a list), care text, hint to choose a list | no |
| W2 | List, sensor mode, moisture above min | Prediction as information, last watered | no |
| W3 | List, sensor mode, moisture went low | Plant opens "Water X" due today ⇒ red, "due today". Plant ticks it off itself when it detects the watering | **no** (sensor closes it) |
| W4 | List, interval mode (no sensor, or `moisture_trigger` unchecked) | As F2/F3 below, with the new watering interval. A detected watering still ticks the item off and records `watered` — the moisture jump is reliable even when thresholds are not *(Claude's call)* | yes |

**🧪 Fertilize** (same pattern; sensor = conductivity)

| Case | Situation | Row | Done |
|---|---|---|---|
| F1 | No to-do list | Care text; last fertilized is never recorded (fertilizing can't be detected) | no |
| F2 | List, interval mode, item not due | "due in 9 days (2 Dec)", last done, "every N days" | yes, outlined |
| F3 | List, interval mode, due or overdue | Red, "overdue 3 d" | yes, solid |
| F4 | List, no interval, sensor mode not active | Last done only | no |
| F5 | List, sensor mode, conductivity went low | Plant opens "Fertilize X" ⇒ red; plant closes it when conductivity is back above min, and that records `fertilized` like any completed item | **no** |
| F6 | List, sensor mode, conductivity fine | Information only (current reading) | no |

**🪴 Repot** and **✂️ Prune**: interval mode only (no sensor). Same as F1–F4.

**☀️ Light**: text only, never an item or Done. The row is **red when `problems` contains an illuminance or DLI problem** (which only happens when those triggers are checked).

**🪨 Soil**: text only, never red, never an item or Done.

### Done button

- Exists only on a row with an open item for this plant and care type, in interval mode.
- **Outlined** when the item is not yet due; **solid** when due or overdue.
- Pressing it completes the item: `todo.update_item` with `status: completed`. Nothing else. Plant reacts exactly as if the item were ticked off in the to-do panel: reports the care event and plans the next item (due = completed date + interval).
- If several open items of the same care type exist, Done completes all of them (matches `care.py` `_async_complete_open`).
- Pressing an **outlined** (not yet due) Done asks first: "Not due until 2 Dec. Mark as done now?" with **Mark as done** and **Cancel** (Cancel, Escape or clicking outside changes nothing). A solid one completes at once.

### Row extras (Olen: all four)

- **Progress bar on schedule rows:** from last done to due, like the moisture bar on Water. Only in interval mode with both a last-done date and a due date; full and red when overdue.
- **Snooze:** rows with an open item that is overdue, due today or due within 2 days (either mode, list required; Olen) get a ⏰ button with +1 day, +3 days and +1 week. It moves the item's due date with `todo.update_item` (`due_date`) to the later of today and the current due date, plus the chosen days. Stateless: only the item changes. *(Claude's call on the choices and the base date.)*
- **Midnight refresh:** the card re-renders when the local date changes, so "due tomorrow" becomes "due today" without waiting for a state change.

### Red rows

A row is red when either:
- the plant's `problems` contains a problem for that row's sensor (moisture → Water, conductivity → Fertilize, illuminance/DLI → Light), or
- an open item for that row is due today or overdue.

### Display types

`display_type: full | compact`, same names and editor control as the flower card.

- `full`: flower-card header; rows expanded (care text visible).
- `compact`: compact header; rows folded to their title + status line. Folded rows still turn red. A row can be tapped to expand or fold.
- The display type only sets the starting state. Whether expand/fold is remembered across reloads is *builder's call* (default: not remembered).

### Width

The card adapts to its own rendered width with a CSS container query (`container-type: inline-size`), not to config, so it behaves the same in Sections, Masonry and Panel views, and on a phone.

- **Narrow:** one column, rows in order.
- **Wide:** two columns, filled left to right in pairs, so each pair shares a height: Water | Fertilize, Repot | Prune, Light | Soil. Water and Fertilize usually carry the longest texts, so they sit side by side. (Olen)
- The breakpoint is *builder's call* (roughly where two rows of ~300 px fit).
- Implement `getGridOptions()` so a Sections view gets sensible default and minimum sizes.

### Card config (minimum)

```yaml
type: custom:plant-care-card   # exact name is builder's call; must not clash with flower-card
entity: plant.plant_004
display_type: full             # or compact
```

A visual editor (`getConfigForm`) like the flower card's. Further options are *builder's call*; keep them few.

### Localisation

All card strings go through the flower card's `localize` (en, de, nl today). Care text is shown in whatever language OpenPlantbook returned.

## Changes in plant (on top of PoC #583)

1. **Watering interval** option (Configure → Care tasks), used in interval mode.
2. **Prune** as a care type: `CARE_PRUNE`, a prune interval option, event type `pruned`, summary "Prune {name}".
3. **One event entity per care type** (`watered`, `fertilized`, `repotted`, `pruned`) instead of the single `event.<plant>_care`. The PoC's `plant.watered/fertilized/repotted` triggers follow.
4. **Trigger checkboxes as the mode switch**: `moisture_trigger` / `conductivity_trigger` checked ⇒ sensor mode for water / fertilize; unchecked ⇒ interval mode.
   - Water sensor mode: as the PoC does now (open on moisture low, close on detected watering).
   - Water interval mode: plant does not open moisture-low items; detected waterings still close the open item and record `watered`.
   - Fertilize sensor mode (new): open "Fertilize X" when conductivity goes low; close it when conductivity is back above min, recording `fertilized`.
   - On a mode change: remove the open items of that care type; the new mode plans its own.
5. **Expose the per-care mode** (and interval) so the card can tell whether to show Done. Attribute vs `plant/get_info` is builder's call.
6. **Moisture prediction** as a timestamp sensor (see Data sources).
7. Keep the marker format in one place and document it, since the card depends on it.

Note: #582 (moisture-gated conductivity) is not a blocker — users with unreliable conductivity sensors uncheck `conductivity_trigger` and get interval-based fertilizing — but it makes fertilize sensor mode trustworthy for those who keep it on.

## Documentation

- Card README: what each row shows, the no-list rule (no due dates, no Done), sensor vs interval mode via the trigger checkboxes, compact vs full, wide layout.
- Plant README / docs: the new interval options and the meaning the trigger checkboxes take on for care.

## Testing

Card, following `flower-card-conventions` (pure-logic tests only, no LitElement instantiation):
- marker parsing and matching (`plant.<id> · <care>`; foreign plants and unknown care types ignored);
- row state from inputs: problems, open items, due dates, mode, list present or not — one test per case W1–W4, F1–F6, Light red/not, Soil text only;
- early-Done confirmation, progress fraction and snooze dates (see "Row extras").

Plant: behaviour tests for the new interval and prune paths, the trigger-as-mode switch, and fertilize sensor mode.

## Left to the builder

Card element name, entity discovery mechanism, breakpoint, row hide rules within the guidance above, expand/fold memory, exact wording of statuses and the no-list hint, icons (reuse `careFields`).

## Calls Claude made (for Olen to check)

- Sensor wins when a trigger is checked and an interval is also set.
- Switching mode removes the old mode's open items.
- In water interval mode, detected waterings still close the item and record `watered`.
- Moisture prediction is a plant timestamp sensor (min reached at the 96 h slope since the last watering).
- Done completes all open items of that care type.
- Column split rounds up.
- The card is a second element in the existing `flower-card.js` bundle (no second file, no change to plant's resource registration).
