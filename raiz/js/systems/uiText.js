import { t } from './i18n.js'

// getUI(scene, key, fallback?) -> uses gameData.ui overrides first, then i18n t(), then fallback
export function getUI(scene, key, fallback) {
  const ui = scene?.gameData?.ui
  if (ui && Object.prototype.hasOwnProperty.call(ui, key)) return ui[key]
  return t(key, fallback !== undefined ? fallback : key)
}
