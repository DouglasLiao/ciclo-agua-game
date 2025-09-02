// dataLoader com cache simples em nível de módulo.
let _cachedData = null;
let _loadingPromise = null;

/**
 * Carrega e retorna dados principais do jogo.
 * - Faz fetch apenas uma vez (cache em memória).
 * - Retorna somente { ui, pontuacao, acessibilidade, drag, quiz }.
 * @param {string} url caminho do JSON (default 'jogo.json')
 */
export async function loadGameData(url = 'jogo.json') {
  if (_cachedData) return _cachedData;
  if (_loadingPromise) return _loadingPromise;

  _loadingPromise = (async () => {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Falha ao carregar ${url}: ${res.status}`);
    const full = await res.json();
    const filtered = {
      ui: full.ui || {},
      pontuacao: full.pontuacao || { pesoDrag: 50, pesoQuiz: 50 },
      acessibilidade: full.acessibilidade || { altoContraste: false },
      drag: full.drag || {},
      quiz: full.quiz || { perguntas: [] }
    };
    _cachedData = filtered;
    return filtered;
  })().finally(() => { _loadingPromise = null; });

  return _loadingPromise;
}

/**
 * Invalida o cache em memória (útil em hot-reload ou testes).
 */
export function invalidateGameDataCache() {
  _cachedData = null;
  _loadingPromise = null;
}
