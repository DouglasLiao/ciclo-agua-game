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

export function getArray(root, path, fallback = []) {
  const v = getPath(root, path, fallback)
  return Array.isArray(v) ? v : fallback
}
