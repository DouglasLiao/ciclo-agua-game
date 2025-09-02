// Sistema de quiz: apresenta perguntas e avalia respostas.
export function presentQuiz(scene, questions) {
  return { questions, answers: [] };
}

export function evaluateQuiz(state) {
  if (!state.questions) return 0;
  let score = 0;
  state.questions.forEach((q, i) => {
    if (state.answers[i] && state.answers[i] === q.correct) score++;
  });
  return score;
}

// Função utilitária para calcular score final do quiz a partir do resultado ({ acertos })
export function computeScoreQuiz(result) {
  if (!result || typeof result.acertos !== 'number') return 0;
  return result.acertos; // Futuro: aplicar pesos ou normalização
}

// startQuiz(scene, perguntas, { onAnswer, onFinish, onScoreChange, debug })
// pergunta: { text, options: [a,b,c,d], correct }
export function startQuiz(scene, perguntas, { onAnswer, onFinish, onScoreChange, debug = false } = {}) {
  // Copiar e opcionalmente embaralhar alternativas preservando índice correto.
  let shuffledPerguntas;
  if (debug) {
    shuffledPerguntas = perguntas.map(p => ({ ...p }));
    // Log em modo debug para confirmar não embaralhado
    console.debug('[quizSystem] Debug ON: perguntas não embaralhadas');
  } else {
    shuffledPerguntas = perguntas.map(orig => {
      const optionsWithIndex = orig.options.map((opt, idx) => ({ opt, originalIndex: idx }));
      // Fisher-Yates
      for (let i = optionsWithIndex.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
      }
      const newOptions = optionsWithIndex.map(o => o.opt);
      const newCorrect = optionsWithIndex.findIndex(o => o.originalIndex === orig.correct);
      return { text: orig.text, options: newOptions, correct: newCorrect };
    });
  }

  const state = {
    perguntas: shuffledPerguntas,
    respostas: [],
    indice: 0,
    concluido: false,
  debug,
  acertosParciais: 0
  };

  const area = { x: 480, y: 140, width: 820 };
  const questionText = scene.add.text(area.x, area.y, '', {
    fontSize: '28px', color: '#ffffff', wordWrap: { width: area.width }
  }).setOrigin(0.5, 0);

  const buttonStyle = (enabled = true) => ({
    fontSize: '22px', color: enabled ? '#222222' : '#555555', backgroundColor: '#4ec2f0', padding: { x: 14, y: 8 }
  });

  const buttons = [];
  const baseY = 280;
  const gapY = 70;
  for (let i = 0; i < 4; i++) {
    const btn = scene.add.text(area.x, baseY + i * gapY, '---', buttonStyle(), { align: 'center' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => btn.setStyle({ backgroundColor: '#6ed2ff' }))
      .on('pointerout', () => btn.setStyle({ backgroundColor: '#4ec2f0' }));
    buttons.push(btn);
  }

  const focusColors = {
    default: '#4ec2f0',
    hover: '#6ed2ff',
    focus: '#ffcc4d'
  };
  state.focusIndex = 0;

  function updateFocusVisual() {
    if (state.locked || state.concluido) return; // não alterar após resposta
    buttons.forEach((b, i) => {
      if (i === state.focusIndex) {
        b.setStyle({ backgroundColor: focusColors.focus });
      } else {
        b.setStyle({ backgroundColor: focusColors.default });
      }
    });
  }

  function getQuestionPrefix(scene) {
    const gd = scene?.gameData;
    const qPrefix = gd?.ui?.questionPrefix;
    return qPrefix !== undefined ? qPrefix : 'Q';
  }

  const questionPrefix = getQuestionPrefix(scene);

  function renderPergunta() {
  const p = state.perguntas[state.indice];
    questionText.setText(`${questionPrefix}${state.indice + 1}: ${p.text}`);
    p.options.forEach((opt, idx) => {
      const btn = buttons[idx];
      btn.setText(opt);
      btn.removeAllListeners('pointerup');
      btn.on('pointerup', () => selecionar(idx));
    });
  state.focusIndex = 0;
  updateFocusVisual();
  }

  function selecionar(idx) {
    if (state.concluido || state.locked) return;
    const p = state.perguntas[state.indice];
    state.respostas[state.indice] = idx;
    state.locked = true;
    const isCorrect = idx === p.correct;
    if (onAnswer) onAnswer({ index: state.indice, option: idx, correct: isCorrect }, state);
    if (isCorrect) {
      state.acertosParciais += 1;
      if (onScoreChange) onScoreChange({ acertos: state.acertosParciais, indice: state.indice, total: state.perguntas.length }, state);
    }

    // Feedback de cores imediato:
    // - Botão correto: verde
    // - Botão escolhido errado (se houver): vermelho
    // - Demais: manter azul padrão
    const COLOR_CORRECT = '#1e7d4e';
    const COLOR_WRONG = '#b33939';
    const COLOR_DEFAULT = '#4ec2f0';

    // Mostrar feedback imediato e seguir independente de acerto
    buttons.forEach((b, i) => {
      if (i === p.correct) {
        b.setStyle({ backgroundColor: COLOR_CORRECT });
      } else if (i === idx && !isCorrect) {
        b.setStyle({ backgroundColor: COLOR_WRONG });
      } else {
        b.setStyle({ backgroundColor: COLOR_DEFAULT });
      }
    });
    scene.time.delayedCall(800, () => {
      state.locked = false;
      avancar();
    });
  }

  function avancar() {
    state.indice++;
    if (state.indice >= state.perguntas.length) {
      finalizar();
    } else {
      buttons.forEach(b => b.setStyle({ backgroundColor: '#4ec2f0' }));
      renderPergunta();
    }
  }

  function finalizar() {
    state.concluido = true;
    const acertos = state.perguntas.reduce((acc, p, i) => acc + (state.respostas[i] === p.correct ? 1 : 0), 0);
  if (onFinish) onFinish({ acertos }, state);
    // Bloquear interação
    buttons.forEach(b => b.disableInteractive());
  }

  renderPergunta();
  // Navegação por teclado (setas/enter)
  const keyEvents = [
    scene.input.keyboard.on('keydown-UP', () => {
      if (state.locked || state.concluido) return;
      state.focusIndex = (state.focusIndex + buttons.length - 1) % buttons.length;
      updateFocusVisual();
    }),
    scene.input.keyboard.on('keydown-DOWN', () => {
      if (state.locked || state.concluido) return;
      state.focusIndex = (state.focusIndex + 1) % buttons.length;
      updateFocusVisual();
    }),
    scene.input.keyboard.on('keydown-LEFT', () => {
      if (state.locked || state.concluido) return;
      state.focusIndex = (state.focusIndex + buttons.length - 1) % buttons.length;
      updateFocusVisual();
    }),
    scene.input.keyboard.on('keydown-RIGHT', () => {
      if (state.locked || state.concluido) return;
      state.focusIndex = (state.focusIndex + 1) % buttons.length;
      updateFocusVisual();
    }),
    scene.input.keyboard.on('keydown-ENTER', () => {
      if (state.locked || state.concluido) return;
      selecionar(state.focusIndex);
    })
  ];
  // Opcional: limpar handlers ao finalizar (não estritamente necessário pois a Scene sairá)
  state.cleanup = () => keyEvents.forEach(ev => ev.removeListener && ev.removeListener());
  return state;
}
