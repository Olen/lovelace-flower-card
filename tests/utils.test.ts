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
