// Acesso genérico a qualquer caminho com dot notation a partir da raiz.
export function getPath(root, path, fallback = '') {
  if (!root) return fallback
  const parts = path.split('.')
  let cur = root
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
      cur = cur[p]
    } else {
      return fallback
    }
  }
  return cur === undefined || cur === null ? fallback : cur
}

// getUI limita a busca ao segmento ui.* mantendo compat retro.
export function getUI(gameData, path, fallback = '') {
  if (!gameData || !gameData.ui) return fallback
  return getPath(gameData.ui, path, fallback)
}

export function getArray(root, path, fallback = []) {
  const v = getPath(root, path, fallback)
  return Array.isArray(v) ? v : fallback
}
