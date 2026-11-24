# Flower care agenda — design

Agreed with Olen 2026-11-23, from the mockup at https://claude.ai/artifact/EwpmYNFK8C8oHxtYGUxaWp.

## Why

The flower card shows how one plant is doing, and the flower care card shows what one plant needs. Neither answers "what do I need to do today, and where?". auto-entities can stack one care card per plant, but it cannot merge the tasks of several plants into one list sorted by date. The agenda does that. It is a different concept from the other two cards, not a variant of them.

## What it is

`custom:flower-care-agenda`, shipped in the same bundle (`flower-card.js`) as the flower card and the flower care card. It needs Plant Monitor 2026.12 or newer (the `care` block in `plant/get_info`).

One card lists the care tasks of every plant in its scope, soonest first.

## Scope

- No filter: every `plant.*` entity.
- `area`, `floor`, `label`: narrow to plants in that area / on that floor / carrying that label. A plant's area is the entity's own area, else its device's area. Filters combine (all must match).
- `exclude_label`: drop plants carrying this label (e.g. `ingen_plantevarsler`).

## Rows

One row per care task. Only care types (water, fertilize, repot, prune) — Light and Soil are advice, not tasks.

A row comes from the care card's model (`buildCareRows`) for each plant, so status, alert, Done and snooze follow exactly the same rules:

- **Schedule task** (interval mode, open to-do item): due date; solid Done when due or overdue, outlined Done (asks first) when not; snooze when due within 2 days or overdue.
- **Sensor task** (sensor mode): no Done button; closes itself on detection. Marked "sensor".
- **Predicted watering** (next-watering sensor, no open water item): "~Thu 26 Nov at this rate", italic, no button. Hidden with `show_predictions: false`.
- **Active problem without an item** (e.g. plant without a to-do list): shown as due today.
- A row with nothing to do is left out. A plant without a to-do list appears only through a prediction or an active problem.

Each row: plant image (round), plant name, care type with icon, status. In "whole home" or floor scope the area name follows the status. Tapping the image or name opens the plant's more-info. Overdue, due today and active problems get the red band, as on the care card.

`show_care` (same values as the care card, restricted to the four care types) limits which care types are listed.

## Grouping

- `group_by: due` (default): Overdue, Today, Tomorrow, This week (2 … `days`). Rows within a group soonest first, ties in care-type order then plant name.
- `group_by: area`: one block per area, sorted by area name, plants without an area last ("No area"); soonest first within each.
- `days` (default 7): the horizon. Tasks further out fold into "N more later · show".

## Bulk Done

"Water all N" in the Overdue and Today groups (group by due) or in an area's header (group by area), when there are at least two **schedule water tasks that are due or overdue**. It completes those items as their own Done buttons would. No bulk button for sensor tasks (they close themselves) or for fertilize, repot or prune.

## Filters

`show_filters` (default `false`): chips under the header to filter by area (when the scope holds more than one area) and by care type (only types present). A per-viewer convenience: they reset on reload and are never written to the config.

## Header and empty state

The header uses the markup and theme variables of HA's own cards (`.card-header`, `--ha-card-header-font-size`); rows and buttons look like the flower care card's. Title: `title`, else the area's name when `area` is set, else the floor's name when `floor` is set, else "Plants". Right side: "N to do · M overdue" (tasks within the horizon, predictions not counted).

Nothing to show: a leaf and "Nothing to do the next N days".

## Options

| Option | Default | |
|---|---|---|
| `title` | area/floor name or "Plants" | |
| `area`, `floor`, `label` | — | scope |
| `exclude_label` | — | |
| `group_by` | `due` | `due` or `area` |
| `days` | `7` | horizon, whole days ≥ 1 |
| `show_predictions` | `true` | |
| `show_care` | all four | `care_watering`, `care_fertilization`, `care_repotting`, `care_pruning` |
| `show_filters` | `false` | |

Unknown values for `group_by` or `show_care`, or a non-positive `days`, are configuration errors that name the value and the valid ones. All options are in the visual editor.

## Data

- One `plant/get_info` per plant in scope, at most once a minute per plant (care blocks change rarely).
- One `todo/item/subscribe` per distinct to-do list, shared by all plants on that list; unsubscribed when no plant in scope uses it.
- Last-done and next-watering come from `hass.states` as on the care card. Problems come from the plant's state attributes, live.
- Re-renders at midnight so "today" moves.

## Shared with the care card

The to-do subscriptions, Done / snooze service calls, the early-Done dialog and the midnight refresh are shared code, not copies. The pure parts (scope, grouping, ordering, bulk set) live in a tested model module.

## Not now

Custom care types; Light rows; persisting chip selection; a calendar view.
