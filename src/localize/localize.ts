import en from './languages/en.json';
import de from './languages/de.json';

export interface HassLanguageContext {
  language?: string;
  locale?: {
    language?: string;
  };
  localize?: (key: string) => string;
}

type Language = Record<string, string>;

const languages: Record<string, Language> = { en, de };

export const getHassLanguage = (hass: HassLanguageContext | undefined, fallback = 'en'): string => {
  const language = hass?.locale?.language || hass?.language;
  return language || fallback;
};

export const localize = (hass: HassLanguageContext | undefined, key: string): string => {
  const language = getHassLanguage(hass).toLowerCase().replace('_', '-').split('-')[0];
  return languages[language]?.[key] || languages.en[key] || key;
};

export const localizeReading = (hass: HassLanguageContext | undefined, key: string): string => {
  const plantTranslation = hass?.localize?.(`component.plant.entity.sensor.${key}.name`);
  return plantTranslation || localize(hass, key);
};
