// Sistema de quiz: apresenta perguntas e avalia respostas.
export function presentQuiz(scene, questions) {
  // Placeholder: criar state com perguntas e respostas do jogador
  return { questions, answers: [] };
}

export function evaluateQuiz(state) {
  // Placeholder: conta acertos (assumindo answers alinhadas)
  if (!state.questions) return 0;
  let score = 0;
  state.questions.forEach((q, i) => {
    if (state.answers[i] && state.answers[i] === q.correct) score++;
  });
  return score;
}
