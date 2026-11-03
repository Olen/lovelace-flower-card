import { describe, it, expect } from 'vitest';

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
