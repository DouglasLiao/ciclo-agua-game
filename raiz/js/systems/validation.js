// Funções de validação e utilidades relacionadas às fases do jogo.

/**
 * Conta quantos itens da fase de drag já foram colocados.
 * @param {Array<{placed:boolean}>} dragItems
 * @returns {number}
 */
export function validateDragPhase(dragItems) {
  return dragItems.filter((it) => it.placed).length
}

/**
 * Normaliza uma cor que pode vir como número ou string em formato #rrggbb.
 * Retorna sempre um número (inteiro) ou o fallback se não conseguir parsear.
 * @param {number|string|undefined|null} value
 * @param {number} fallback
 * @returns {number}
 */
export function normalizeColor(value, fallback) {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string') {
    const v = value.trim()
    if (v.startsWith('#') && (v.length === 7 || v.length === 4)) {
      // suporta #rgb ou #rrggbb
      let hex = v.substring(1)
      if (hex.length === 3) {
        // expande #rgb -> #rrggbb
        hex = hex.split('').map((c) => c + c).join('')
      }
      const num = parseInt(hex, 16)
      if (!Number.isNaN(num)) return num
    }
  }
  return fallback
}

/**
 * Verifica se o bloco foi colocado sobre o alvo correto segundo o mapa.
 * @param {Object<string,string>} map - mapa labelBloco -> nomeAlvoCorreto
 * @param {string} blockLabel
 * @param {string|undefined|null} targetName
 * @returns {{correct:boolean, expected:string|undefined}}
 */
export function validateBlockPlacement(map, blockLabel, targetName) {
  const expected = map ? map[blockLabel] : undefined
  return { correct: !!expected && targetName === expected, expected }
}

/**
 * Valida uma resposta de quiz para uma única pergunta.
 * @param {{ correct:number }} question
 * @param {number} chosenIndex
 * @returns {{ correct:boolean, expected:number }}
 */
export function validateQuizAnswer(question, chosenIndex) {
  if (!question || typeof question.correct !== 'number') {
    return { correct: false, expected: -1 }
  }
  return { correct: chosenIndex === question.correct, expected: question.correct }
}

/**
 * Consolida pontuação do quiz dado array de perguntas e respostas.
 * @param {Array<{ correct:number }>} questions
 * @param {number[]} answers
 * @returns {{ acertos:number, total:number }}
 */
export function validationQuiz(questions, answers) {
  if (!Array.isArray(questions) || !questions.length) return { acertos: 0, total: 0 }
  let acertos = 0
  questions.forEach((q, i) => {
    const { correct } = validateQuizAnswer(q, answers[i])
    if (correct) acertos++
  })
  return { acertos, total: questions.length }
}

