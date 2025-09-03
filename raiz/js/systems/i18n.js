// i18n simple registry
// loadTranslations(data) expects structure { locales: { "pt-BR": { key: "texto" }, "en-US": { ... } }, defaultLocale }

const I18N_STATE = {
  locales: {},
  locale: 'pt-BR',
  defaultLocale: 'pt-BR'
}

export function loadI18nFromGameData(gameData) {
  if (gameData?.i18n?.locales) {
    I18N_STATE.locales = gameData.i18n.locales
    I18N_STATE.defaultLocale = gameData.i18n.defaultLocale || Object.keys(gameData.i18n.locales)[0] || 'pt-BR'
  }
  if (gameData?.i18n?.locale) {
    I18N_STATE.locale = gameData.i18n.locale
  } else {
    I18N_STATE.locale = I18N_STATE.defaultLocale
  }
}

export function setLocale(locale) {
  if (I18N_STATE.locales[locale]) I18N_STATE.locale = locale
}

export function t(key, fallback) {
  const loc = I18N_STATE.locale
  const def = I18N_STATE.defaultLocale
  if (I18N_STATE.locales[loc] && key in I18N_STATE.locales[loc]) return I18N_STATE.locales[loc][key]
  if (I18N_STATE.locales[def] && key in I18N_STATE.locales[def]) return I18N_STATE.locales[def][key]
  return fallback !== undefined ? fallback : key
}

export function getCurrentLocale() { return I18N_STATE.locale }
export function getI18nState() { return { ...I18N_STATE } }
