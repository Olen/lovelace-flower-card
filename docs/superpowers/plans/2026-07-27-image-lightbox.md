# Thumbnail Image Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tapping the plant thumbnail opens the full-size image in an `ha-dialog` lightbox with the plant's display name captioned; tapping the name still opens more-info.

**Architecture:** Reuse the `@state` + `ha-dialog` pattern added for the care-info badge (#309). A pure `shouldEnableImageLightbox` helper (unit-tested) gates whether the image is tappable-to-lightbox; the LitElement holds an `_imageDialogOpen` state and renders the lightbox on demand. The header container's more-info handler is unchanged — the image's own click handler opens the lightbox and stops propagation only when a real image exists.

**Tech Stack:** TypeScript, Lit (LitElement + `lit/decorators.js`), vitest (jsdom), eslint.

**Spec:** `docs/superpowers/specs/2026-07-27-image-lightbox-design.md`

## Global Constraints

Every task's requirements implicitly include these:

- **Never run `npm run build` / `npm run dev` / webpack.** They regenerate `flower-card.js` / `flower-card.js.gz`, which must **NOT** be committed. If they appear in `git status`, do not stage them.
- **Branch:** `feature/image-lightbox` (already created, based on `origin/main` which includes #309). Do not switch branches.
- **Testing convention (repo-wide):** unit-test **pure exported functions only** — never instantiate the LitElement, never assert on Lit `TemplateResult`/DOM. Rendering/state changes are verified by `npx tsc --noEmit`, `npm run lint`, and the existing regression suite staying green.
- **Per-task verification commands:**
  - Tests: `npx vitest run <file>` (and `npx vitest run` for the full suite)
  - Types: `npx tsc --noEmit` (must exit 0)
  - Lint: `npm run lint` (must pass)
- **Behavior change (must be documented):** image taps previously opened more-info; they now open the lightbox. Task 3 documents this in the README. The PR title (controller, post-implementation) must explicitly signal the change — the repo has no CHANGELOG file; the changelog is GitHub native release notes generated from the PR title + label.
- **Scope:** default behavior, no config toggle. Imageless / `hide_image` cards are unaffected (tap falls through to more-info). Caption is the display name only.

---

### Task 1: `shouldEnableImageLightbox` pure helper

**Files:**
- Modify: `src/utils/utils.ts` (add the helper)
- Test: `tests/utils.test.ts` (new)

**Interfaces:**
- Consumes: nothing (pure).
- Produces: `shouldEnableImageLightbox(hideImage: boolean, resolvedImageUrl: string | undefined): boolean` (exported from `src/utils/utils.ts`).

- [ ] **Step 1: Write the failing tests**

Create `tests/utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { shouldEnableImageLightbox } from '../src/utils/utils';

describe('shouldEnableImageLightbox', () => {
  it('is true when not hidden and a real URL is present', () => {
    expect(shouldEnableImageLightbox(false, 'https://example.com/plant.jpg')).toBe(true);
    expect(shouldEnableImageLightbox(false, '/local/plant.jpg')).toBe(true);
  });
  it('is false when the image is hidden, even with a URL', () => {
    expect(shouldEnableImageLightbox(true, 'https://example.com/plant.jpg')).toBe(false);
  });
  it('is false when there is no resolved URL', () => {
    expect(shouldEnableImageLightbox(false, undefined)).toBe(false);
    expect(shouldEnableImageLightbox(false, '')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/utils.test.ts`
Expected: FAIL — `shouldEnableImageLightbox` is not exported yet.

- [ ] **Step 3: Implement the helper**

In `src/utils/utils.ts`, append after the existing `resolveMediaSource` export:

```ts
/** True when the thumbnail should open a lightbox (real image present and not hidden). */
export const shouldEnableImageLightbox = (
    hideImage: boolean,
    resolvedImageUrl: string | undefined,
): boolean => !hideImage && !!resolvedImageUrl;
```

- [ ] **Step 4: Run tests, types, lint**

Run: `npx vitest run tests/utils.test.ts` → Expected: PASS (3 cases)
Run: `npx tsc --noEmit` → Expected: exit 0
Run: `npm run lint` → Expected: pass

- [ ] **Step 5: Commit**

```bash
git add src/utils/utils.ts tests/utils.test.ts
git commit -m "feat: shouldEnableImageLightbox pure helper"
```

---

### Task 2: Lightbox state, dialog, image wiring, and styles

**Files:**
- Modify: `src/flower-card.ts` (import, `@state`, methods, img wiring, stale-flag guard, dialog mount)
- Modify: `src/styles.ts` (lightbox + caption + `.has-lightbox` rules)

**Interfaces:**
- Consumes: `shouldEnableImageLightbox` (Task 1); existing `this._resolvedImageUrl`, `this.stateObj`, `missingImage`, `moreInfo`, the `@state` pattern from #309.
- Produces: `FlowerCard.openImageDialog(): void` (public, for symmetry with `openCareDialog`; called only from the image `@click` in this file).

- [ ] **Step 1: Import the helper**

In `src/flower-card.ts` line 9, add `shouldEnableImageLightbox`:
```ts
import { isMediaSourceUrl, moreInfo, resolveMediaSource, shouldEnableImageLightbox } from './utils/utils';
```

- [ ] **Step 2: Add the reactive state field**

After the existing `@state() private _careDialogTitle = CARE_DIALOG_DEFAULT_TITLE;` (line 48), add:
```ts
    @state() private _imageDialogOpen = false;
```

- [ ] **Step 3: Add open/close/render methods**

Add these methods next to the care-dialog methods (e.g. immediately after `renderCareDialog()` ends, before `render()`):

```ts
    openImageDialog(): void {
        this._imageDialogOpen = true;
    }

    private _closeImageDialog(): void {
        this._imageDialogOpen = false;
    }

    private renderImageDialog(): HTMLTemplateResult {
        const displayName = this.config?.name || this.stateObj?.attributes.friendly_name || '';
        return html`
            <ha-dialog open @closed="${() => this._closeImageDialog()}">
                <div class="image-dialog">
                    <img src="${this._resolvedImageUrl}" alt="${displayName}">
                    ${displayName ? html`<div class="image-dialog-caption">${displayName}</div>` : ''}
                </div>
            </ha-dialog>
        `;
    }
```

- [ ] **Step 4: Reset the flag on entity-unavailable**

In `render()`, the `!this.stateObj` branch already resets `_careDialogOpen` (line 245). Add the image flag beside it:
```ts
        if (!this.stateObj) {
            this._careDialogOpen = false;
            this._imageDialogOpen = false;
            return html`
                <hui-warning>
                Entity not available: ${this.config.entity}
                </hui-warning>
              `;
        }
```

- [ ] **Step 5: Compute the lightbox flag**

In `render()`, immediately after `const hideImage = this.config.hide_image ?? false;` (line 257), add:
```ts
        const imageLightbox = shouldEnableImageLightbox(hideImage, this._resolvedImageUrl);
```

- [ ] **Step 6: Wire the image click**

Replace the current image line (line 266):
```ts
                ${!hideImage ? html`<img src="${this._resolvedImageUrl || missingImage}">` : ''}
```
with:
```ts
                ${!hideImage ? html`<img
                    src="${this._resolvedImageUrl || missingImage}"
                    class="${imageLightbox ? 'has-lightbox' : ''}"
                    @click="${(e: Event) => {
                        if (!imageLightbox) return;
                        e.stopPropagation();
                        this.openImageDialog();
                    }}">` : ''}
```
When `imageLightbox` is false the handler returns without `stopPropagation`, so the header container's `@click` (more-info) still fires — preserving today's behavior for imageless/placeholder cards.

- [ ] **Step 7: Mount the dialog**

After the care-dialog mount (line 279), add the image-dialog mount:
```ts
            ${this._careDialogOpen ? this.renderCareDialog() : html``}
            ${this._imageDialogOpen ? this.renderImageDialog() : html``}
```

- [ ] **Step 8: Add styles**

In `src/styles.ts`, insert after the `.care-info-empty { ... }` block (the last rule before the closing `` `; `` of the `css` template):
```css
.has-lightbox {
  cursor: pointer;
}
.image-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.image-dialog img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}
.image-dialog-caption {
  margin-top: 8px;
  text-align: center;
  color: var(--primary-text-color);
  font-weight: 500;
}
```

- [ ] **Step 9: Verification gate**

Run: `npx tsc --noEmit` → Expected: exit 0
Run: `npx vitest run` → Expected: full suite passes (existing + Task 1's `tests/utils.test.ts`)
Run: `npm run lint` → Expected: pass
Run: `git status --porcelain` → confirm no `flower-card.js` / `flower-card.js.gz`.

- [ ] **Step 10: Commit**

```bash
git add src/flower-card.ts src/styles.ts
git commit -m "feat: open image lightbox on thumbnail tap"
```

---

### Task 3: Document the behavior change (README)

**Files:**
- Modify: `README.md` (new section + TOC entry)

**Interfaces:** none (docs only).

- [ ] **Step 1: Add a Table-of-Contents entry**

In `README.md`'s `## 📑 Table of Contents` list, add an entry between the "Extra Badges" and "Other Options" lines:
```md
  - [🔍 Image Lightbox](#-image-lightbox)
```

- [ ] **Step 2: Add the "Image Lightbox" section**

Insert this section immediately before `## 🎨 Other Options`:

````md
## 🔍 Image Lightbox

Tap the plant's thumbnail to open the full-size image in a popup, with the plant's name shown below it — handy for telling apart multiple plants of the same species that have different photos. Tap the plant **name** (or anywhere else in the header) to open the standard more-info dialog.

> **Note:** This changed the previous behavior, where tapping the image opened more-info. Cards with no image or with `hide_image: true` are unaffected — tapping still opens more-info.

No configuration is needed; the lightbox is enabled automatically whenever the card shows an image.

---
````

- [ ] **Step 3: Verify the TOC anchor**

Confirm the TOC anchor `#-image-lightbox` matches the heading `## 🔍 Image Lightbox` (GitHub lowercases, drops the emoji, hyphenates spaces → `-image-lightbox`), consistent with sibling entries like `[🌿 Care Info](#-care-info)`. No build/test needed for docs.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: document thumbnail image lightbox behavior change"
```

---

## Post-implementation (controller / final review)

- Full suite green: `npx vitest run`; types clean: `npx tsc --noEmit`; lint clean: `npm run lint`.
- **Do not** run `npm run build`; confirm `flower-card.js` / `flower-card.js.gz` are **not** in the diff.
- Open a PR to `main` whose **title explicitly signals the behavior change** (it becomes the changelog line via native release notes), e.g. `feat: tap thumbnail opens image lightbox (changes image-tap behavior) (#247)`. Label it `enhancement` (and/or `feature`). Reference #247 and call out the behavior change prominently in the PR body.
- Version bump (`package.json`) is a **separate** release step, not part of this feature PR.
