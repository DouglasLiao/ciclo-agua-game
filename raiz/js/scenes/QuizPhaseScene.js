import { startQuiz } from '../systems/quizSystem.js';

export default class QuizPhaseScene extends Phaser.Scene {
  constructor() { super('QuizPhaseScene'); }

  init(data) {
    this.scoreParcial = data.scoreParcial || 0;
    this.gameData = data.gameData || null;
  }

  create() {
  this.add.text(20, 20, 'Fase de Quiz', { fontSize: '20px', color: '#ffffff' });
  this.partialText = this.add.text(20, 48, `Parcial: ${this.scoreParcial}`, { fontSize: '18px', color: '#4ec2f0' });
  this.quizScoreText = this.add.text(20, 72, 'Acertos Quiz: 0', { fontSize: '18px', color: '#4ec2f0' });

    const perguntasDemo = [
      { text: 'Processo em que a água retorna à atmosfera em forma de vapor.', options: ['Infiltração', 'Evaporação', 'Condensação', 'Precipitação'], correct: 1 },
      { text: 'Formação de nuvens a partir do vapor de água.', options: ['Condensação', 'Transpiração', 'Infiltração', 'Evaporação'], correct: 0 },
      { text: 'Queda de água para a superfície em forma de chuva.', options: ['Precipitação', 'Condensação', 'Evaporação', 'Sublimação'], correct: 0 }
    ];

    startQuiz(this, perguntasDemo, {
      onScoreChange: ({ acertos }) => {
        this.quizScoreText.setText(`Acertos Quiz: ${acertos}`);
      },
      onFinish: (res) => {
        const totalScore = this.scoreParcial + res.acertos;
        this.scene.start('ResultsScene', { score: totalScore, detalhesQuiz: res, gameData: this.gameData });
      }
    });
  }
}
