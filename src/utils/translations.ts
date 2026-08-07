export interface Translation {
  [key: string]: string;
}

export interface Translations {
  [language: string]: Translation;
}

export interface HassLanguageContext {
  language?: string;
  selectedLanguage?: string;
  locale?: {
    language?: string;
  };
}

export const translations: Translations = {
  en: {
    moisture: 'Moisture',
    conductivity: 'Conductivity',
    temperature: 'Temperature',
    illuminance: 'Illuminance',
    humidity: 'Humidity',
    dli: 'Daily Light Integral',
    dli_24h: 'DLI (24h rolling)',
    co2: 'CO2',
    soil_temperature: 'Soil Temperature',
    vpd: 'VPD',
    care: 'Care',
    care_watering: 'Watering',
    care_sunlight: 'Sunlight',
    care_soil: 'Soil',
    care_pruning: 'Pruning',
    care_fertilization: 'Fertilization',
    no_care_info: 'No care information available.',
    settings_bars: 'Bars',
    settings_care_info: 'Care Info',
    settings_appearance: 'Appearance',
    settings_entity: 'Entity',
    settings_display_name: 'Display Name',
    settings_display_type: 'Display Type',
    settings_battery_sensor: 'Battery Sensor',
    settings_show_bars: 'Show Bars',
    settings_show_care_info: 'Show Care Info',
    settings_hide_species: 'Hide Species',
    settings_hide_image: 'Hide Image',
    settings_hide_units: 'Hide Units',
    settings_full: 'Full',
    settings_compact: 'Compact',
  },
  de: {
    moisture: 'Bodenfeuchtigkeit',
    conductivity: 'Leitfähigkeit',
    temperature: 'Temperatur',
    illuminance: 'Helligkeit',
    humidity: 'Luftfeuchtigkeit',
    dli: 'Tägliche Lichtmenge',
    dli_24h: 'Tägliche Lichtmenge (24h rollierend)',
    co2: 'CO2',
    soil_temperature: 'Bodentemperatur',
    vpd: 'VPD',
    care: 'Pflege',
    care_watering: 'Bewässerung',
    care_sunlight: 'Sonnenlicht',
    care_soil: 'Erde',
    care_pruning: 'Rückschnitt',
    care_fertilization: 'Düngung',
    no_care_info: 'Keine Pflegeinformationen verfügbar.',
    settings_bars: 'Balken',
    settings_care_info: 'Pflegeinfo',
    settings_appearance: 'Darstellung',
    settings_entity: 'Entität',
    settings_display_name: 'Anzeigename',
    settings_display_type: 'Darstellungstyp',
    settings_battery_sensor: 'Batteriesensor',
    settings_show_bars: 'Balken anzeigen',
    settings_show_care_info: 'Pflegeinfos anzeigen',
    settings_hide_species: 'Spezies ausblenden',
    settings_hide_image: 'Bild ausblenden',
    settings_hide_units: 'Einheiten ausblenden',
    settings_full: 'Voll',
    settings_compact: 'Kompakt',
  },
};

const germanToEnglishMapping: Translation = {
  helligkeit: 'illuminance',
  leitfaehigkeit: 'conductivity',
  leitfahigkeit: 'conductivity',
  leitfähigkeit: 'conductivity',
  bodenfeuchtigkeit: 'moisture',
  temperatur: 'temperature',
  luftfeuchtigkeit: 'humidity',
  bodentemperatur: 'soil_temperature',
  ppfd: 'ppfd',
  dli: 'dli',
};

export const getTranslation = (key: string, language: string = 'en'): string => {
  const lang = language.toLowerCase().replace('_', '-').split('-')[0];
  const normalizedKey = key.toLowerCase();
  const englishKey = germanToEnglishMapping[normalizedKey] || key;

  return translations[lang]?.[englishKey] || translations.en[englishKey] || key;
};

export const getHassLanguage = (hass: HassLanguageContext | undefined, fallback = 'en'): string => {
  const language = typeof hass?.language === 'string' ? hass.language : undefined;
  const selectedLanguage = typeof hass?.selectedLanguage === 'string' ? hass.selectedLanguage : undefined;
  const localeLanguage = hass?.locale?.language;

  return language || selectedLanguage || localeLanguage || fallback;
};