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

// startQuiz(scene, perguntas, { onAnswer, onFinish })
// pergunta: { text, options: [a,b,c,d], correct }
export function startQuiz(scene, perguntas, { onAnswer, onFinish } = {}) {
  const state = {
    perguntas,
    respostas: [],
    indice: 0,
    concluido: false
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

  function renderPergunta() {
    const p = state.perguntas[state.indice];
    questionText.setText(`Q${state.indice + 1}: ${p.text}`);
    p.options.forEach((opt, idx) => {
      const btn = buttons[idx];
      btn.setText(opt);
      btn.removeAllListeners('pointerup');
      btn.on('pointerup', () => selecionar(idx));
    });
  }

  function selecionar(idx) {
    if (state.concluido) return;
    const p = state.perguntas[state.indice];
    state.respostas[state.indice] = idx;
    if (onAnswer) onAnswer({ index: state.indice, option: idx, correct: idx === p.correct }, state);
    // highlight
    buttons.forEach((b, i) => b.setStyle({ backgroundColor: i === idx ? '#1e7d4e' : '#4ec2f0' }));
    scene.time.delayedCall(400, avancar);
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
    if (onFinish) onFinish({ acertos, total: state.perguntas.length, respostas: state.respostas }, state);
    // Bloquear interação
    buttons.forEach(b => b.disableInteractive());
  }

  renderPergunta();
  return state;
}
