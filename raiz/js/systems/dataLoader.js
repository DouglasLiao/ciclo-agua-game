// dataLoader com cache por URL e suporte a dataset dinâmico via env / query.
const _cache = new Map(); // url -> data
const _loadingPromises = new Map(); // url -> promise
let _schemaLogEnabled = true; // pode ser desativado em testes

// Resolve dataset a partir de várias fontes (ordem de precedência controlada externamente).
export function resolveDatasetName(fallback = 'jogo.json') {
  try {
    if (typeof globalThis !== 'undefined') {
      if (globalThis.__DATASET__) return String(globalThis.__DATASET__);
      if (globalThis.GAME_DATASET) return String(globalThis.GAME_DATASET);
    }
  } catch (_) { /* noop */ }
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      if (process.env.GAME_DATASET) return String(process.env.GAME_DATASET);
      if (process.env.VITE_DATASET) return String(process.env.VITE_DATASET);
    }
  } catch (_) { /* noop */ }
  try {
    if (import.meta && import.meta.env && import.meta.env.VITE_DATASET) {
      return String(import.meta.env.VITE_DATASET);
    }
  } catch (_) { /* noop */ }
  return fallback;
}

/**
 * Carrega e retorna dados principais do jogo (cache por URL).
 * @param {string} url caminho do JSON (se omitido, tenta resolver via env / fallback)
 */
export async function loadGameData(url) {
  const key = url || resolveDatasetName('jogo.json');
  if (_cache.has(key)) return _cache.get(key);
  if (_loadingPromises.has(key)) return _loadingPromises.get(key);

  const p = (async () => {
    let full;
    try {
      const res = await fetch(key, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      full = await res.json();
    } catch (netErr) {
      console.error('[dataLoader] Erro de rede ao buscar', key, netErr);
      full = mockGameData(); // fallback mínimo
    }
    let filtered;
    try {
      filtered = validateAndFilter(full);
    } catch (schemaErr) {
      console.error('[dataLoader] Erro de schema. Usando mock mínimo.', schemaErr);
      filtered = validateAndFilter(mockGameData());
    }
    _cache.set(key, filtered);
    return filtered;
  })().finally(() => { _loadingPromises.delete(key); });
  _loadingPromises.set(key, p);
  return p;
}

/**
 * Invalida o cache em memória (útil em hot-reload ou testes).
 */
export function invalidateGameDataCache(url) {
  if (!url) {
    _cache.clear();
    _loadingPromises.clear();
  } else {
    _cache.delete(url);
    _loadingPromises.delete(url);
  }
}

// ---- Validação de schema ----
function validateAndFilter(full) {
  const errors = [];
  const logErr = (msg) => { errors.push(msg); if (_schemaLogEnabled) console.error('[dataLoader] Schema', msg); };

  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  if (!isObj(full)) logErr('Objeto raiz inválido (esperado objeto)');

  // ui
  if (!isObj(full.ui)) logErr('ui ausente ou não é objeto');
  const ui = isObj(full.ui) ? full.ui : {};
  if (typeof ui.titulo !== 'string') logErr('ui.titulo ausente ou não string');
  if (ui.botoes && !isObj(ui.botoes)) logErr('ui.botoes deve ser objeto');
  if (ui.mensagens && !isObj(ui.mensagens)) logErr('ui.mensagens deve ser objeto');

  // pontuacao
  const pont = isObj(full.pontuacao) ? full.pontuacao : {};
  if (!isObj(full.pontuacao)) logErr('pontuacao ausente ou não objeto');
  if (typeof pont.pesoDrag !== 'number') logErr('pontuacao.pesoDrag deve ser número');
  if (typeof pont.pesoQuiz !== 'number') logErr('pontuacao.pesoQuiz deve ser número');

  // acessibilidade
  const acc = isObj(full.acessibilidade) ? full.acessibilidade : {};
  if (!isObj(full.acessibilidade)) logErr('acessibilidade ausente ou não objeto');
  if (typeof acc.altoContraste !== 'boolean') logErr('acessibilidade.altoContraste deve ser boolean');

  // drag
  const drag = isObj(full.drag) ? full.drag : {};
  if (!isObj(full.drag)) logErr('drag ausente ou não objeto');
  if (!Array.isArray(drag.targets) || drag.targets.length === 0) logErr('drag.targets deve ser array não vazio');
  if (!Array.isArray(drag.blocks) || drag.blocks.length === 0) logErr('drag.blocks deve ser array não vazio');
  if (!isObj(drag.map)) logErr('drag.map ausente ou não objeto');
  if (!isObj(drag.descricoes)) logErr('drag.descricoes ausente ou não objeto');

  // quiz
  const quiz = isObj(full.quiz) ? full.quiz : {};
  if (!isObj(full.quiz)) logErr('quiz ausente ou não objeto');
  if (!Array.isArray(quiz.perguntas) || quiz.perguntas.length === 0) {
    logErr('quiz.perguntas deve ser array não vazio');
  } else {
    quiz.perguntas.forEach((p, idx) => {
      if (!isObj(p)) { logErr(`quiz.perguntas[${idx}] não é objeto`); return; }
      if (typeof p.texto !== 'string') logErr(`quiz.perguntas[${idx}].texto deve ser string`);
      if (!Array.isArray(p.alternativas) || p.alternativas.length < 2) logErr(`quiz.perguntas[${idx}].alternativas deve ter >=2 itens`);
      if (typeof p.correta !== 'number') logErr(`quiz.perguntas[${idx}].correta deve ser número`);
      else if (Array.isArray(p.alternativas) && (p.correta < 0 || p.correta >= p.alternativas.length)) logErr(`quiz.perguntas[${idx}].correta fora do intervalo`);
    });
  }

  if (errors.length) {
    throw new Error('Game data inválido: ' + errors.join('; '));
  }

  return {
    ui,
    pontuacao: pont,
    acessibilidade: acc,
    drag,
    quiz
  };
}

// Export interno apenas para testes unitários (não usar em produção de jogo diretamente)
export function _validateGameDataForTests(obj) {
  return validateAndFilter(obj);
}

// Permite silenciar logs de schema em testes unitários
export function setSchemaValidationLogging(enabled) {
  _schemaLogEnabled = !!enabled;
}

// Mock mínimo usado em fallback de rede/erro de schema
function mockGameData() {
  return {
    ui: {
      titulo: 'Ciclo da Água (Mock)',
      botoes: { iniciar: 'Iniciar', reiniciar: 'Reiniciar' },
      mensagens: {
        carregando: 'Carregando...',
        iniciando: 'Iniciando...',
        falhaCarregar: 'Erro ao carregar dados',
        faseDrag: 'Fase de Arrastar',
        faseQuiz: 'Fase de Quiz',
        todosColocados: 'Todos posicionados! Avançando...',
        resultadoTitulo: 'Resultados'
      }
    },
    pontuacao: { pesoDrag: 50, pesoQuiz: 50 },
    acessibilidade: { altoContraste: false },
    drag: {
      targets: ['Evaporação', 'Condensação', 'Precipitação', 'Infiltração'],
      blocks: ['Água do solo', 'Nuvem', 'Chuva', 'Lago'],
      map: {
        'Água do solo': 'Infiltração',
        'Nuvem': 'Condensação',
        'Chuva': 'Precipitação',
        'Lago': 'Evaporação'
      },
      descricoes: {
        'Evaporação': 'Água aquece e vira vapor.',
        'Condensação': 'Vapor esfria e forma nuvens.',
        'Precipitação': 'Água cai em chuva.',
        'Infiltração': 'Água penetra no solo.'
      }
    },
    quiz: {
      perguntas: [
        {
          texto: 'Qual processo transforma água em vapor?',
          alternativas: ['Condensação', 'Evaporação', 'Infiltração', 'Precipitação'],
          correta: 1
        }
      ]
    }
  };
}
