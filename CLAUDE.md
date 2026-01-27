# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Project Overview

Custom Lovelace card for Home Assistant plant monitoring. Displays plant health status with visual indicators for various measurements.

**Card name:** `flower-card`
**Framework:** Lit (LitElement)
**Build tool:** Webpack

## Related Repositories

- **[homeassistant-plant](https://github.com/Olen/homeassistant-plant)** - Plant integration that provides the data
- **[home-assistant-openplantbook](https://github.com/Olen/home-assistant-openplantbook)** - OpenPlantbook API integration

## Quick Commands

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Build
npm run build
```

## Git Workflow

**Always use feature branches for code changes.** Do not commit directly to master.

```bash
git checkout -b feature-name
# make changes
git push -u origin feature-name
gh pr create --fill
```

## Architecture

| File | Purpose |
|------|---------|
| `src/flower-card.ts` | Main LitElement component |
| `src/editor.ts` | Card configuration editor |
| `src/styles.ts` | CSS styling |
| `src/types/flower-card-types.ts` | TypeScript interfaces |
| `src/utils/attributes.ts` | Attribute rendering helpers |
| `src/utils/constants.ts` | Configuration constants |
| `src/utils/utils.ts` | General utilities |

## WebSocket API

The card fetches plant data via Home Assistant WebSocket:

```typescript
hass.callWS({ type: "plant/get_info", entity_id: "plant.my_plant" })
```

This returns plant info including current readings, min/max thresholds, icons, and sensors.
