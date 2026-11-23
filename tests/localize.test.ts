import { describe, expect, it, vi } from 'vitest';
import { getHassLanguage, localize, localizeReading, localizeWith } from '../src/localize/localize';
import en from '../src/localize/languages/en.json';
import de from '../src/localize/languages/de.json';
import nl from '../src/localize/languages/nl.json';

const CARE_CARD_KEYS = [
  'care_row_water', 'care_row_fertilize', 'care_row_repot', 'care_row_prune', 'care_row_light', 'care_row_soil',
  'care_status_prediction', 'care_status_prediction_today', 'care_status_prediction_one',
  'care_status_due', 'care_status_due_tomorrow', 'care_status_due_today', 'care_status_overdue',
  'care_last', 'care_not_recorded', 'care_every', 'care_done', 'care_no_list', 'care_needs_plant',
  'care_card_name', 'care_confirm_early', 'care_confirm_early_undated', 'care_confirm_done', 'care_cancel',
  'care_snooze', 'care_snooze_1d', 'care_snooze_3d', 'care_snooze_1w',
];

describe('localize', () => {
  it('uses the locale language before the legacy language property', () => {
    expect(getHassLanguage({
      locale: { language: 'de-DE' },
      language: 'en',
    })).toBe('de-DE');
  });

  it('translates a card string for a supported language', () => {
    expect(localize({ language: 'de' }, 'settings_compact')).toBe('Kompakt');
  });

  it('translates a card string for Dutch', () => {
    expect(localize({ language: 'nl' }, 'settings_full')).toBe('Volledig');
  });

  it('falls back to English for an unsupported language', () => {
    // qaa is reserved for local use in ISO 639, so no translation will ever claim it
    expect(localize({ language: 'qaa' }, 'settings_compact')).toBe('Compact');
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

describe('care card strings', () => {
  const languages: Record<string, Record<string, string>> = { en, de, nl };
  for (const [language, strings] of Object.entries(languages)) {
    it(`has every care card string in ${language}`, () => {
      const missing = CARE_CARD_KEYS.filter((key) => !strings[key]);
      expect(missing).toEqual([]);
    });
  }
});

describe('localizeWith', () => {
  it('fills every placeholder in the translated string', () => {
    expect(localizeWith({ language: 'en' }, 'care_status_due', { n: 9, date: '2 Dec' })).toBe('due in 9 days (2 Dec)');
  });
});
