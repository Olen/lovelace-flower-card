# Thumbnail Image Lightbox — Design

**Status:** Approved (brainstorm 2026-07-27)

**Goal:** Tapping the plant thumbnail opens the full-size image in a lightbox (`ha-dialog`) with the plant's display name captioned below it. Tapping the name (or elsewhere in the header) still opens more-info. Closes #247.

## Motivation

#247: users with several plants of the same species but different photos want to see the image clearly to tell them apart. Today the entire header — image included — opens the standard more-info dialog, so there is no way to view the image on its own. This adds a dedicated image lightbox, reusing the `@state` + `ha-dialog` pattern introduced for the care-info badge (#309).

## Behavior

- **Default, no config.** Tapping the thumbnail image opens the lightbox; tapping the name / species / empty header area opens more-info.
- **This is a behavior change:** image taps previously opened more-info. It must be documented (see Documentation below).
- **Lightbox content:** the full-size image, centered, `object-fit: contain`, capped height (~80vh), with the plant's **display name** (`config.name || friendly_name`) as a caption below. Close via backdrop click / ESC / close button (`ha-dialog`'s `@closed`).
- **Guard — only a real image is tappable-to-lightbox.** The lightbox is wired only when a real resolved image exists (`_resolvedImageUrl` truthy and `hide_image` false). When the image is missing (the `missingImage` placeholder is shown) or hidden, tapping falls through to the header's more-info handler exactly as today.

## Implementation

### Trigger wiring (`src/flower-card.ts`, `render()` ~line 266)

Keep the header container's existing `@click` → `moreInfo(...)` unchanged. In `render()`, compute the lightbox-enable flag once via the pure helper, then use it for both the class and the click guard:

```ts
const imageLightbox = shouldEnableImageLightbox(hideImage, this._resolvedImageUrl);
```

On the `<img>`, add a click handler that opens the lightbox and stops propagation — active only when `imageLightbox` is true:

```ts
${!hideImage ? html`<img
    src="${this._resolvedImageUrl || missingImage}"
    class="${imageLightbox ? 'has-lightbox' : ''}"
    @click="${(e: Event) => {
        if (!imageLightbox) return;   // placeholder: let it fall through to more-info
        e.stopPropagation();
        this.openImageDialog();
    }}">` : ''}
```

When `imageLightbox` is false the handler returns without stopping propagation, so the container's more-info handler still fires — preserving today's behavior for imageless cards.

### Reactive state + methods (`src/flower-card.ts`)

Mirror the care-dialog pattern added in #309:

```ts
@state() private _imageDialogOpen = false;

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

### Stale-flag guard (`src/flower-card.ts`, `render()` early return)

The `!stateObj` early-return branch already resets `_careDialogOpen` (from #309). Add the image flag alongside it so an unavailable-entity transition can't leave a ghost lightbox:

```ts
if (!this.stateObj) {
    this._careDialogOpen = false;
    this._imageDialogOpen = false;
    return html` ... hui-warning ... `;
}
```

### Mount (`src/flower-card.ts`, end of `render()`)

Alongside the existing care-dialog mount, after `</ha-card>`:

```ts
${this._careDialogOpen ? this.renderCareDialog() : html``}
${this._imageDialogOpen ? this.renderImageDialog() : html``}
```

### Guard helper (pure, testable) (`src/utils/utils.ts`)

Per the repo's "unit-test pure logic only" convention, extract the lightbox-enable predicate so it can be tested without the DOM:

```ts
/** True when the thumbnail should open a lightbox (real image present and not hidden). */
export const shouldEnableImageLightbox = (
    hideImage: boolean,
    resolvedImageUrl: string | undefined,
): boolean => !hideImage && !!resolvedImageUrl;
```

Use it in `render()` for the class assignment / handler guard so the render path and the tested logic agree.

### Styles (`src/styles.ts`)

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

## Documentation (required deliverables)

The behavior change must be documented in both places:

1. **README.md** — add a short "Image Lightbox" subsection (under "🎨 Other Options" or as its own `##` section) plus a Table-of-Contents entry, stating: tapping the thumbnail opens a full-size image with the plant name; tapping the name opens plant info; and noting this changed the previous behavior where tapping the image opened more-info. Imageless / `hide_image` cards are unaffected.

2. **Changelog** — this repo has **no CHANGELOG file**; the changelog is GitHub's native release notes generated from PR titles + labels (`.github/release.yml`). Therefore the **PR title must explicitly convey the behavior change** (it becomes the changelog line), e.g. `feat: tap thumbnail opens image lightbox (changes image-tap behavior) (#247)`, and the PR body must call out the change prominently. No CHANGELOG file is to be created (it would contradict the native-notes convention).

## Testing (`vitest`, pure logic only)

- `shouldEnableImageLightbox`: true only when `hideImage` is false AND `resolvedImageUrl` is a non-empty string; false when hidden, when URL is `undefined`, or when URL is `''`.
- The display-name caption uses the same `config.name || friendly_name` resolution already covered by the existing "display name logic" test in `tests/flower-card.test.ts`; no new test needed for it beyond what exists.
- Dialog open/close and the click wiring are DOM/LitElement behavior — not unit-tested, consistent with #309 and the repo convention.

## Out of scope (YAGNI)

- Zoom / pan / carousel / multiple images.
- Config to toggle the behavior (it is the new default).
- Caption content beyond the display name (no species, no attributes).
- Any change to imageless-card behavior.

## Files touched

- `src/flower-card.ts` — `@state` field, `openImageDialog`/`_closeImageDialog`/`renderImageDialog`, img click wiring, stale-flag guard, dialog mount, use of `shouldEnableImageLightbox`.
- `src/utils/utils.ts` — `shouldEnableImageLightbox` helper.
- `src/styles.ts` — lightbox + caption + `.has-lightbox` rules.
- `README.md` — Image Lightbox section + TOC entry.
- `tests/` — `shouldEnableImageLightbox` unit tests.

Note: `flower-card.js` / `flower-card.js.gz` are build artifacts rebuilt by CI's Auto Release; they are **not** committed in this PR.
