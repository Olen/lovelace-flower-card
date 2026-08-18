import { describe, expect, it, vi } from 'vitest';
import { getHassLanguage, localize, localizeReading } from '../src/localize/localize';

describe('localize', () => {
  it('uses the locale language before legacy language properties', () => {
    expect(getHassLanguage({
      locale: { language: 'de-DE' },
      language: 'en',
      selectedLanguage: 'en',
    })).toBe('de-DE');
  });

  it('falls back to English for an unsupported language', () => {
    expect(localize({ language: 'nl' }, 'settings_compact')).toBe('Compact');
  });

  it('falls back to the key for an unknown card string', () => {
    expect(localize({ language: 'de' }, 'unknown_key')).toBe('unknown_key');
  });
});

describe('localizeReading', () => {
  it('uses the plant integration translation when available', () => {
    const hass = {
      language: 'de',
      localize: vi.fn().mockReturnValue('Bodenfeuchtigkeit'),
    };

    expect(localizeReading(hass, 'moisture')).toBe('Bodenfeuchtigkeit');
    expect(hass.localize).toHaveBeenCalledWith('component.plant.entity.sensor.moisture.name');
  });

  it('falls back to the card translation when the integration has no translation', () => {
    const hass = {
      language: 'de',
      localize: vi.fn().mockReturnValue(''),
    };

    expect(localizeReading(hass, 'moisture')).toBe('Bodenfeuchtigkeit');
  });
});
