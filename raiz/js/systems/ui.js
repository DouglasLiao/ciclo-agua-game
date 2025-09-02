// Simple UI text accessor without i18n.
// getUI(gameData, path, fallback) => traverses gameData.ui using dot path.
export function getUI(gameData, path, fallback = '') {
  if (!gameData || !gameData.ui) return fallback;
  const parts = path.split('.');
  let cur = gameData.ui;
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
      cur = cur[p];
    } else {
      return fallback;
    }
  }
  return (cur === undefined || cur === null) ? fallback : cur;
}

export function getArray(gameData, path, fallback = []) {
  const v = getUI(gameData, path, fallback);
  return Array.isArray(v) ? v : fallback;
}
