import { validateAndFilter, _validateGameDataForTests } from './schemaValidation.js'

// dataLoader com cache por URL e suporte a dataset dinâmico via env / query.
const _cache = new Map() // url -> data
const _loadingPromises = new Map() // url -> promise
let _schemaLogEnabled = true // pode ser desativado em testes

// Resolve dataset a partir de várias fontes (ordem de precedência controlada externamente).
export function resolveDatasetName(fallback = 'jogo.json') {
  try {
    if (typeof globalThis !== 'undefined') {
      if (globalThis.__DATASET__) return String(globalThis.__DATASET__)
      if (globalThis.GAME_DATASET) return String(globalThis.GAME_DATASET)
    }
  } catch (_) {
    /* noop */
  }
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      if (process.env.GAME_DATASET) return String(process.env.GAME_DATASET)
      if (process.env.VITE_DATASET) return String(process.env.VITE_DATASET)
    }
  } catch (_) {
    /* noop */
  }
  try {
    if (import.meta && import.meta.env && import.meta.env.VITE_DATASET) {
      return String(import.meta.env.VITE_DATASET)
    }
  } catch (_) {
    /* noop */
  }
  return fallback
}

/**
 * Carrega e retorna dados principais do jogo (cache por URL).
 * @param {string} url caminho do JSON (se omitido, tenta resolver via env / fallback)
 */
export async function loadGameData(url) {
  const key = url || resolveDatasetName('jogo.json')
  if (_cache.has(key)) return _cache.get(key)
  if (_loadingPromises.has(key)) return _loadingPromises.get(key)

  const p = (async () => {
    let full
    try {
      const res = await fetch(key, { cache: 'no-cache' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      full = await res.json()
    } catch (netErr) {
      full = mockGameData() // fallback mínimo
    }
    let filtered
    try {
      filtered = validateAndFilter(full)
    } catch (schemaErr) {
      filtered = validateAndFilter(mockGameData())
    }
    _cache.set(key, filtered)
    return filtered
  })().finally(() => {
    _loadingPromises.delete(key)
  })
  _loadingPromises.set(key, p)
  return p
}

/**
 * Invalida o cache em memória (útil em hot-reload ou testes).
 */
export function invalidateGameDataCache(url) {
  if (!url) {
    _cache.clear()
    _loadingPromises.clear()
  } else {
    _cache.delete(url)
    _loadingPromises.delete(url)
  }
}


// Permite silenciar logs de schema em testes unitários
export function setSchemaValidationLogging(enabled) {
  _schemaLogEnabled = !!enabled
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
        Nuvem: 'Condensação',
        Chuva: 'Precipitação',
        Lago: 'Evaporação'
      },
      descricoes: {
        Evaporação: 'Água aquece e vira vapor.',
        Condensação: 'Vapor esfria e forma nuvens.',
        Precipitação: 'Água cai em chuva.',
        Infiltração: 'Água penetra no solo.'
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
  }
}
