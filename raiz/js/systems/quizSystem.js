import { validateQuizAnswer, validationQuiz } from './validation.js'

// Sistema de quiz: apresenta perguntas e avalia respostas.
export function presentQuiz(scene, questions) {
  return { questions, answers: [] }
}

export function evaluateQuiz(state) {
  if (!state.questions) return 0
  const r = validationQuiz(state.questions, state.answers || [])
  return r.acertos
}

// Função utilitária para calcular score final do quiz a partir do resultado ({ acertos })
export function computeScoreQuiz(result, totalPerguntas, pesoQuiz = 50) {
  if (!result || typeof result.acertos !== 'number' || !totalPerguntas) return 0
  const ratio = Math.max(0, Math.min(1, result.acertos / totalPerguntas))
  return ratio * pesoQuiz
}

// Drag: score bruto = acertos (itens corretos). totalDrag = total blocos.
export function computeScoreDrag(acertosDrag, totalDrag, pesoDrag = 50) {
  if (!totalDrag) return 0
  const ratio = Math.max(0, Math.min(1, acertosDrag / totalDrag))
  return ratio * pesoDrag
}

// startQuiz(scene, perguntas, { onAnswer, onFinish, onScoreChange, debug })
// Aceita formato interno { text, options, correct } ou JSON { texto, alternativas, correta }.
export function startQuiz(
  scene,
  perguntas,
  { onAnswer, onFinish, onScoreChange, debug = false } = {}
) {
  if (!Array.isArray(perguntas) || !perguntas.length) {
    // Nenhuma pergunta disponível
    if (onFinish) onFinish({ acertos: 0 }, { perguntas: [], respostas: [], concluido: true })
    return { perguntas: [], respostas: [], concluido: true }
  }
  const normalizadas = perguntas.map((p, i) => {
    const text =
      p.text !== undefined ? p.text : p.texto !== undefined ? p.texto : `Pergunta ${i + 1}`
    const options = Array.isArray(p.options)
      ? p.options
      : Array.isArray(p.alternativas)
        ? p.alternativas
        : []
    let correct = p.correct !== undefined ? p.correct : p.correta
    if (!Array.isArray(options) || options.length < 2) {
      // aviso: alternativas insuficientes
    }
    if (typeof correct !== 'number' || correct < 0 || correct >= options.length) {
      // índice incorreto ajustado para 0
      correct = 0
    }
    return { text, options, correct }
  })
  // Embaralha a ordem das perguntas (mantendo índice da correta) e também as alternativas de cada uma.
  let shuffledPerguntas
  if (debug) {
    shuffledPerguntas = normalizadas.map((p) => ({ ...p }))
  } else {
    // Shuffle de perguntas (Fisher-Yates)
    const questionsShuffled = [...normalizadas]
    for (let i = questionsShuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[questionsShuffled[i], questionsShuffled[j]] = [questionsShuffled[j], questionsShuffled[i]]
    }
    // Agora shuffle de alternativas por pergunta
    shuffledPerguntas = questionsShuffled.map((orig) => {
      const optionsWithIndex = orig.options.map((opt, idx) => ({ opt, originalIndex: idx }))
      for (let i = optionsWithIndex.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]]
      }
      const newOptions = optionsWithIndex.map((o) => o.opt)
      const newCorrect = optionsWithIndex.findIndex((o) => o.originalIndex === orig.correct)
      return { text: orig.text, options: newOptions, correct: newCorrect }
    })
  }

  const state = {
    perguntas: shuffledPerguntas,
    respostas: [],
    indice: 0,
    concluido: false,
    debug,
    acertosParciais: 0,
    disposed: false
  }

  // Recursos rastreados para limpeza
  const keyHandlers = []
  const buttonHandlers = new Map() // btn -> { over, out, up }
  const tweens = []
  const timers = []

  const area = { x: 480, y: 140, width: 820 }
  const questionText = scene.add
    .text(area.x, area.y, '', {
      fontSize: '28px',
      color: '#ffffff',
      wordWrap: { width: area.width }
    })
    .setOrigin(0.5, 0)
  // Preparar para animações de entrada
  questionText.setAlpha(0).setScale(0.95)

  const buttonStyle = (enabled = true) => ({
    fontSize: '22px',
    color: enabled ? '#222222' : '#555555',
    backgroundColor: '#4ec2f0',
    padding: { x: 14, y: 8 }
  })

  const buttons = []
  const baseY = 280
  const gapY = 70
  for (let i = 0; i < 4; i++) {
    const btn = scene.add
      .text(area.x, baseY + i * gapY, '---', buttonStyle(), { align: 'center' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
    const over = () => !state.disposed && btn.setStyle({ backgroundColor: '#6ed2ff' })
    const out = () => !state.disposed && btn.setStyle({ backgroundColor: '#4ec2f0' })
    btn.on('pointerover', over)
    btn.on('pointerout', out)
    buttonHandlers.set(btn, { over, out })
    btn.setAlpha(0).setScale(0.95) // estado inicial para animação
    buttons.push(btn)
  }

  const focusColors = {
    default: '#4ec2f0',
    hover: '#6ed2ff',
    focus: '#ffcc4d'
  }
  state.focusIndex = 0

  function updateFocusVisual() {
    if (state.locked || state.concluido) return // não alterar após resposta
    buttons.forEach((b, i) => {
      b.setStyle({ backgroundColor: focusColors.default })
      if (i === state.focusIndex) {
        b.setStyle({ backgroundColor: focusColors.focus })
      }
    })
  }

  function getQuestionPrefix(scene) {
    const gd = scene?.gameData
    const qPrefix = gd?.ui?.questionPrefix
    return qPrefix !== undefined ? qPrefix : 'Q'
  }

  const questionPrefix = getQuestionPrefix(scene)

  function renderPergunta() {
    if (state.disposed) return
    const p = state.perguntas[state.indice]
    // Reset visual base antes de aplicar texto/animar
    questionText.setAlpha(0).setScale(0.95)
    buttons.forEach((b) => b.setAlpha(0).setScale(0.95))
    questionText.setText(`${questionPrefix}${state.indice + 1}: ${p.text}`)
    p.options.forEach((opt, idx) => {
      const btn = buttons[idx]
      btn.setText(opt)
      btn.removeAllListeners('pointerup')
      const up = () => selecionar(idx)
      btn.on('pointerup', up)
      const existing = buttonHandlers.get(btn) || {}
      existing.up = up
      buttonHandlers.set(btn, existing)
    })
    // Animação de entrada (fade + leve scale up) com pequeno escalonamento
    const targets = [questionText, ...buttons]
    targets.forEach((obj, i) => {
      const tw = scene.tweens.add({
        targets: obj,
        alpha: 1,
        scale: 1,
        duration: 220,
        ease: 'Quad.Out',
        delay: i * 40
      })
      tweens.push(tw)
    })
    state.focusIndex = -1
    updateFocusVisual()
  }

  function selecionar(idx) {
    if (state.disposed || state.concluido || state.locked) return
    const p = state.perguntas[state.indice]
    state.respostas[state.indice] = idx
    state.locked = true
  const { correct: isCorrect } = validateQuizAnswer(p, idx)
    if (onAnswer) onAnswer({ index: state.indice, option: idx, correct: isCorrect }, state)
    if (isCorrect) {
      state.acertosParciais += 1
      if (onScoreChange)
        onScoreChange(
          { acertos: state.acertosParciais, indice: state.indice, total: state.perguntas.length },
          state
        )
    }

    // Feedback de cores imediato:
    // - Botão correto: verde
    // - Botão escolhido errado (se houver): vermelho
    // - Demais: manter azul padrão
    const highContrast =
      typeof document !== 'undefined' && document.body.classList.contains('alto-contraste')
    const COLOR_CORRECT = highContrast ? '#00aa00' : '#1e7d4e' // verde mais claro para contraste AA
    const COLOR_WRONG = highContrast ? '#ff2222' : '#b33939' // vermelho mais vivo
    const COLOR_DEFAULT = highContrast ? '#0088ff' : '#4ec2f0'

    // Mostrar feedback imediato e seguir independente de acerto
    buttons.forEach((b, i) => {
      if (i === p.correct) {
        b.setStyle({ backgroundColor: COLOR_CORRECT })
      } else if (i === idx && !isCorrect) {
        b.setStyle({ backgroundColor: COLOR_WRONG })
      } else {
        b.setStyle({ backgroundColor: COLOR_DEFAULT })
      }
    })
    // Animações de feedback leves
    const correctBtn = buttons[p.correct]
    if (correctBtn) {
      const tw = scene.tweens.add({
        targets: correctBtn,
        scale: 1.08,
        yoyo: true,
        repeat: 1,
        duration: 140,
        ease: 'Sine.Out'
      })
      tweens.push(tw)
    }
    if (!isCorrect) {
      const wrongBtn = buttons[idx]
      if (wrongBtn) {
        const baseX = wrongBtn.x
        const tw2 = scene.tweens.add({
          targets: wrongBtn,
          x: baseX + 5,
          yoyo: true,
          repeat: 3,
          duration: 50,
          ease: 'Sine.InOut',
          onComplete: () => wrongBtn.setX(baseX)
        })
        tweens.push(tw2)
      }
    }
    const timer = scene.time.delayedCall(800, () => {
      if (state.disposed) return
      state.locked = false
      avancar()
    })
    timers.push(timer)
  }

  function avancar() {
    if (state.disposed) return
    state.indice++
    if (state.indice >= state.perguntas.length) {
      finalizar()
    } else {
      buttons.forEach((b) => b.setStyle({ backgroundColor: '#4ec2f0' }))
      renderPergunta()
    }
  }

  function finalizar() {
    if (state.disposed) return
    state.concluido = true
  const { acertos } = validationQuiz(state.perguntas, state.respostas)
  if (onFinish) onFinish({ acertos }, state)
    // Bloquear interação
    buttons.forEach((b) => b.disableInteractive())
  }

  renderPergunta()
  // Navegação por teclado (setas/enter)
  function addKey(event, handler) {
    scene.input.keyboard.on(event, handler)
    keyHandlers.push({ event, handler })
  }
  addKey('keydown-UP', () => {
    if (state.locked || state.concluido || state.disposed) return
    state.focusIndex = (state.focusIndex + buttons.length - 1) % buttons.length
    updateFocusVisual()
  })
  addKey('keydown-DOWN', () => {
    if (state.locked || state.concluido || state.disposed) return
    state.focusIndex = (state.focusIndex + 1) % buttons.length
    updateFocusVisual()
  })
  addKey('keydown-LEFT', () => {
    if (state.locked || state.concluido || state.disposed) return
    state.focusIndex = (state.focusIndex + buttons.length - 1) % buttons.length
    updateFocusVisual()
  })
  addKey('keydown-RIGHT', () => {
    if (state.locked || state.concluido || state.disposed) return
    state.focusIndex = (state.focusIndex + 1) % buttons.length
    updateFocusVisual()
  })
  addKey('keydown-ENTER', () => {
    if (state.locked || state.concluido || state.disposed) return
    selecionar(state.focusIndex)
  })

  function dispose() {
    if (state.disposed) return
    state.disposed = true
    // Teclado
    keyHandlers.forEach(({ event, handler }) => scene.input.keyboard.off(event, handler))
    // Timers
    timers.forEach((t) => t && !t.hasDispatched && t.remove(false))
    // Tweens
    tweens.forEach((tw) => tw && tw.stop())
    // Botões
    buttons.forEach((btn) => {
      // Se a cena já está destruída, evitar tocar no objeto
      if (!btn || !btn.scene) return
      const h = buttonHandlers.get(btn)
      if (h) {
        if (h.over) btn.off && btn.off('pointerover', h.over)
        if (h.out) btn.off && btn.off('pointerout', h.out)
        if (h.up) btn.off && btn.off('pointerup', h.up)
      }
      // removeAllListeners pode tentar acessar sistemas internos; proteger
      if (btn.removeAllListeners && btn.scene && btn.scene.sys && !btn.scene.sys.isDestroyed) {
        try {
          btn.removeAllListeners()
        } catch (_) {
          /* noop */
        }
      }
      if (
        btn.disableInteractive &&
        btn.scene &&
        btn.scene.sys &&
        !btn.scene.sys.isDestroyed &&
        btn.input
      ) {
        try {
          btn.disableInteractive()
        } catch (_) {
          /* noop */
        }
      }
    })
    // Texto da pergunta
    if (
      questionText &&
      questionText.removeAllListeners &&
      questionText.scene &&
      questionText.scene.sys &&
      !questionText.scene.sys.isDestroyed
    ) {
      try {
        questionText.removeAllListeners()
      } catch (_) {
        /* noop */
      }
    }
  }
  state.dispose = dispose
  scene.events.once('shutdown', dispose)
  scene.events.once('destroy', dispose)

  return state
}
