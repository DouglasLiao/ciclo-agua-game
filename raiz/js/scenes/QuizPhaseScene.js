import { startQuiz, computeScoreQuiz, computeScoreDrag } from '../systems/quizSystem.js';
import { getUI, getArray } from '../systems/ui.js';

export default class QuizPhaseScene extends Phaser.Scene {
  constructor() { super('QuizPhaseScene'); }

  init(data) {
  this.dragAcertos = data.dragAcertos || 0;
  this.dragTotal = data.dragTotal || 0;
    this.gameData = data.gameData || null;
  }

  create() {
  const quizTitle = getUI(this.gameData, 'quiz.title', 'Fase de Quiz');
  this.add.text(20, 20, quizTitle, { fontSize: '20px', color: '#ffffff' });

    const perguntasDemo = getArray(this.gameData, 'quiz.questions', [
      { text: 'Processo em que a água retorna à atmosfera em forma de vapor.', options: ['Infiltração', 'Evaporação', 'Condensação', 'Precipitação'], correct: 1 },
      { text: 'Formação de nuvens a partir do vapor de água.', options: ['Condensação', 'Transpiração', 'Infiltração', 'Evaporação'], correct: 0 },
      { text: 'Queda de água para a superfície em forma de chuva.', options: ['Precipitação', 'Condensação', 'Evaporação', 'Sublimação'], correct: 0 }
    ]);

    startQuiz(this, perguntasDemo, {
      onScoreChange: ({ acertos }) => {
      },
      onFinish: (res) => {
        const pesos = this.gameData?.pontuacao || { pesoDrag: 50, pesoQuiz: 50 };
        const dragScore = computeScoreDrag(this.dragAcertos, this.dragTotal, pesos.pesoDrag);
        const quizScore = computeScoreQuiz(res, perguntasDemo.length, pesos.pesoQuiz);
        let scoreTotal = dragScore + quizScore;
        if (scoreTotal > 100) scoreTotal = 100;
        if (scoreTotal < 0) scoreTotal = 0;
        // Tocar som somente se asset carregado (evita 404 se não existir)
        if (this.sound && this.cache.audio.exists('quiz_complete')) {
          try {
            const s = this.sound.play('quiz_complete');
            if (!s) console.warn('[QuizPhaseScene] Falha ao iniciar som quiz_complete');
          } catch (e) {
            console.warn('[QuizPhaseScene] Erro ao tocar som quiz_complete', e);
          }
        } else {
          // console.debug('[QuizPhaseScene] Som quiz_complete ausente ou não carregado');
        }
        this.scene.start('ResultsScene', { scoreTotal, gameData: this.gameData });
      }
    });
  }
}
