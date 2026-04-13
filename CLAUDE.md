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

**Default branch is `main`.** Always create feature branches from `origin/main`. Never commit directly to `main`.

```bash
git checkout -b feature-name origin/main
# make changes
git push -u origin feature-name
gh pr create --base main --fill
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

## Releases

Releases are fully automated via GitHub Actions. **Do NOT manually create tags, build, or push built files.**

**How the CI release pipeline works:**

1. The "Test & Lint" workflow runs on every push to `main`
2. If tests pass, the "Auto Release" workflow triggers and checks if `package.json` version changed
3. If version changed and the tag doesn't exist yet, CI will:
   - Run `npm ci && npm run build`
   - If `flower-card.js` changed, create a PR with built files, auto-merge it
   - Create a git tag `v{version}`
   - Generate a changelog and create a GitHub Release (stable or prerelease based on version string)

**To create a new release:**

1. Create a branch from `origin/main` (e.g., `release/v2026.4.0`)
2. Update the version in `package.json` only — do NOT run `npm run build` locally
3. Commit, push, and merge the PR to `main`
4. CI handles everything else: build, tag, release

**Version format:**
- Stable: `YYYY.M.P` (e.g., `2026.4.0`)
- Beta: `YYYY.M.P-betaN` (e.g., `2026.4.0-beta1`)
