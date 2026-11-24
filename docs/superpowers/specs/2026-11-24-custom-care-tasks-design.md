# Custom care tasks — design

Agreed with Olen 2026-11-24. Builds on the flower care card (#403) and the care agenda (#404).

## Why

The plant tracks four care types itself: water, fertilize, repot, prune. People also have care jobs the plant cannot know about: filling a reservoir or cistern, covering pots before frost, moving them into shade, wiping leaves every month. Those should show up in the care card and the agenda next to the built-in tasks, with the same Done and snooze, without the plant integration growing a rule system for them.

## The idea

A custom task is an ordinary item in the plant's to-do list. An automation (from one of two blueprints, or written by hand) decides when it opens and closes. The cards show it. The plant integration does nothing with it.

## Marker

Each item carries one description line per plant it belongs to:

```
plant.<plant entity id> · task:<slug>
```

- `<slug>` is the task name slugified ("Fill reservoir" → `fill_reservoir`). The blueprints generate it with HA's `slugify` filter; nobody types it.
- The slug is the task's identity: automations find their item by the marker, never by the summary. The summary is free text, may be edited or translated, and is what the cards show.
- One item can belong to several plants (one line each), e.g. a cistern that waters three pots.
- The `task:` prefix keeps custom tasks apart from the built-in types: a plant may have both `water` (sensor-based) and `task:water` (e.g. a timed one the user wants anyway). Plant's own parser only accepts `water`, `fertilize`, `repot`, `prune` after the separator, so it ignores `task:` lines already — no plant code change.

## Plant integration

No code change. README (Olen writes it): the four types are built in and handled by the plant; `task:` items are extra tasks added by the user or a blueprint; the marker format; links to the two blueprints with "Import blueprint" buttons. The blueprints live in the plant repo (`blueprints/automation/plant/`), since they write the plant's list in the plant's marker format.

## Blueprint 1: threshold task

Opens a task when a sensor crosses a level and closes it when it crosses back.

Inputs:

| Input | Selector | Default |
|---|---|---|
| Sensor | entity (numeric) | — |
| Plants | entity, domain `plant`, multiple | — |
| To-do list | entity, domain `todo` | — (the plants' care list) |
| Task name | text | — |
| Open when the value | select: *drops below* / *rises above* | drops below |
| Open at | number | — |
| Close at | number | — |
| Due, days after the trigger | number, 0–30, whole days | 0 (due the day it opens) |

Behaviour:

- *Drops below*: opens when the value crosses below **Open at**, closes when it crosses above **Close at**. *Rises above*: the mirror image.
- Opens only when no open item with this task's marker exists in the list; closing completes every open item with the marker.
- Triggers are crossings (`numeric_state`), so Done or snooze from a card sticks: a new item comes only on the next crossing.
- **Flipped levels are an error.** For *drops below*, Close at must be above Open at; for *rises above*, below it. Equal levels are flipped too (no gap against flapping). The blueprint checks this when the automation is saved/reloaded and at HA start, and raises a persistent notification naming the automation, both values and the rule; every run checks again and stops with `error: true` (red trace) without touching the list.

Examples: fill reservoir (below 20 % / above 25 %), cover pots (below 2 °C / above 4 °C), move into shade (above 30 °C / below 27 °C).

## Blueprint 2: repeating task

A task every N days, counted from when it was last done.

Inputs: plants, to-do list, task name, interval (days, ≥ 1).

Behaviour: triggers when the list changes and once a day. When no open item with the marker exists, it adds one due on *last completed + N days*, or today if the list keeps no completion times (same rule as the plant's interval tasks). Completion dates are taken in local time.

Its description says the four built-in types have their own intervals in the plant's Care tasks options, and `task:` names that match them are allowed but separate.

## Care card

- One row per open `task:` item for this plant, after the built-in care rows, in due order.
- Title = item summary; icon `mdi:clipboard-check-outline`; status, red band, Done (outlined + confirm when not due), snooze when due within 2 days or overdue — the same rules as interval rows.
- No progress bar (the card does not know the start date) and no sub-line.
- Not affected by `show_care` (that selects built-in areas); a new option `show_tasks` (default `true`) hides them.

## Flower card `show_next_care`

Custom tasks compete for the two slots like built-in ones (most urgent first), shown with their summary.

## Agenda

- `task:` items become agenda tasks like the built-in ones, sorted in by due date, grouped the same way.
- An item that belongs to several plants in scope is shown **once**: thumbnail of the first plant, title "<plant>, <plant>, … · <summary>" (plants first, as for built-in rows); it counts once in the summary; Done/snooze act on the one item.
- In scope if at least one of its plants is in scope. With `group_by: area` it goes under the first plant's area.
- Filter chips get a "Tasks" chip when any are present. `show_care` does not apply; `show_tasks` (default `true`) hides them.
- Not counted in "Water all".

## Card model changes

- `careOfItem` keeps returning only the four built-in types; a new parser returns `{ slug, plants: string[] }` for `task:` lines.
- Rows for custom tasks are a new row kind (key = `task:<slug>`, label = summary) so `buildCareRows`, `nextCareRows` and the agenda can tell them apart; the built-in row rules are unchanged.

## Not in this

- Plant-side events or `plant.*` triggers for custom tasks.
- Custom tasks with their own sensor-detected completion beyond what the threshold blueprint does.
- Editing tasks from the card (create/rename/delete stay in the to-do app or automation).
