import { describe, it, expect, vi } from 'vitest';

describe('card registration', () => {
  it('loads twice without throwing', async () => {
    class OtherCopy extends HTMLElement {}
    customElements.define('flower-card', OtherCopy);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (window as any).customCards = [{ type: 'flower-card' }];

    await expect(import('../src/flower-card')).resolves.toBeDefined();

    const entries = (window as any).customCards.filter((card: { type: string }) => card.type === 'flower-card');
    /* eslint-enable @typescript-eslint/no-explicit-any */
    expect(entries).toHaveLength(1);
    expect(customElements.get('flower-card')).toBe(OtherCopy);
  });
});

describe('care card registration', () => {
  it('registers flower-care-card once, even when loaded twice', async () => {
    vi.resetModules();
    await import('../src/flower-card');
    vi.resetModules();
    await expect(import('../src/flower-card')).resolves.toBeDefined();

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const entries = (window as any).customCards.filter((card: { type: string }) => card.type === 'flower-care-card');
    const oldEntries = (window as any).customCards.filter((card: { type: string }) => card.type === 'plant-care-card');
    /* eslint-enable @typescript-eslint/no-explicit-any */
    expect(oldEntries).toHaveLength(0);
    expect(entries).toHaveLength(1);
    expect(customElements.get('flower-care-card')).toBeDefined();
    expect(customElements.get('plant-care-card')).toBeUndefined();
  });
});
