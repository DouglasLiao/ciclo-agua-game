import { startQuiz, computeScoreQuiz } from '../systems/quizSystem.js';
import { getUI, getArray } from '../systems/ui.js';

export default class QuizPhaseScene extends Phaser.Scene {
  constructor() { super('QuizPhaseScene'); }

  init(data) {
    this.scoreParcial = data.scoreParcial || 0;
    this.gameData = data.gameData || null;
  }

  create() {
  const quizTitle = getUI(this.gameData, 'quiz.title', 'Fase de Quiz');
  const partialLabel = getUI(this.gameData, 'quiz.partialLabel', 'Parcial');
  const acertosLabel = getUI(this.gameData, 'quiz.acertosLabel', 'Acertos Quiz');
  this.add.text(20, 20, quizTitle, { fontSize: '20px', color: '#ffffff' });
  this.partialText = this.add.text(20, 48, `${partialLabel}: ${this.scoreParcial}`, { fontSize: '18px', color: '#4ec2f0' });
  this.quizScoreText = this.add.text(20, 72, `${acertosLabel}: 0`, { fontSize: '18px', color: '#4ec2f0' });

    const perguntasDemo = getArray(this.gameData, 'quiz.questions', [
      { text: 'Processo em que a água retorna à atmosfera em forma de vapor.', options: ['Infiltração', 'Evaporação', 'Condensação', 'Precipitação'], correct: 1 },
      { text: 'Formação de nuvens a partir do vapor de água.', options: ['Condensação', 'Transpiração', 'Infiltração', 'Evaporação'], correct: 0 },
      { text: 'Queda de água para a superfície em forma de chuva.', options: ['Precipitação', 'Condensação', 'Evaporação', 'Sublimação'], correct: 0 }
    ]);

    startQuiz(this, perguntasDemo, {
      onScoreChange: ({ acertos }) => {
        const acertosLabel2 = getUI(this.gameData, 'quiz.acertosLabel', 'Acertos Quiz');
        this.quizScoreText.setText(`${acertosLabel2}: ${acertos}`);
      },
      onFinish: (res) => {
        const scoreQuiz = computeScoreQuiz(res);
        const scoreTotal = this.scoreParcial + scoreQuiz;
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
