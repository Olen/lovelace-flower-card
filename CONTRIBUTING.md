# Contributing

Thanks for helping improve the **Lovelace Flower Card**! This guide covers the
pull-request workflow and the **PR labels** that drive our release notes.

## Development

This is a TypeScript Lovelace card bundled with webpack.

```bash
npm ci              # install dependencies
npm test            # run the vitest suite
npm run lint        # eslint
npm run build       # lint + webpack → flower-card.js (+ .gz)
```

> **Do not commit rebuilt `flower-card.js` / `flower-card.js.gz` in a feature PR.**
> The **Auto Release** workflow rebuilds and commits the bundle at release time
> (it opens and auto-merges a `build/v<version>` PR with the artifact). Change the
> TypeScript sources under `src/`; leave the built files to CI.

## Pull requests

- Branch from `main`, open your PR against `main`.
- CI (**Test & Lint**) must pass.
- Add tests for new behavior and bug fixes.

## PR labels (please add one)

Release notes are generated automatically from **merged-PR labels** (GitHub's
native generator, configured in [`.github/release.yml`](.github/release.yml)).
Add a label so your change lands in the right section of the changelog:

| Label | Release-notes section |
|-------|-----------------------|
| `enhancement` or `feature` | 🚀 Features & Enhancements |
| `bug` or `fix` | 🐛 Bug Fixes |
| `documentation` | 📚 Documentation |
| `dependencies`, `github_actions`, `ci`, `chore` | 🧹 Maintenance & CI |
| _(no label)_ | Other Changes |

Pick the single label that best describes the PR's primary intent. Unlabeled PRs
still appear under **Other Changes**, but a label makes the changelog readable.

### For automated agents (Claude Code, etc.)

When you open a PR, apply the matching label in the same step, e.g.:

```bash
gh pr edit <number> --add-label enhancement   # or bug / documentation / dependencies ...
```

## Releases (maintainers)

Releases are automated. Bump the version in **`package.json`** on `main`; on the
next green **Test & Lint** run the **Auto Release** workflow rebuilds
`flower-card.js`, tags `v<version>`, and publishes a GitHub release (prerelease
when the version contains `beta`) with the bundle attached and notes categorized
from the merged-PR labels. Version format: `YYYY.M.P` (stable) or `YYYY.M.P-betaN`.
