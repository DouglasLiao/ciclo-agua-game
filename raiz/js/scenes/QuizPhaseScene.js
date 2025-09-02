import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js';
import { presentQuiz, evaluateQuiz } from '../systems/quizSystem.js';

export default class QuizPhaseScene extends Phaser.Scene {
  constructor() { super('QuizPhaseScene'); }

  init(data) {
    this.dragResult = data.dragResult;
  }

  create() {
    this.add.text(20, 20, 'Fase de Quiz (protótipo)', { fontSize: '20px', color: '#ffffff' });

    this.quizState = presentQuiz(this, []); // TODO: passar perguntas reais

    this.input.keyboard.once('keydown-ENTER', () => {
      const score = evaluateQuiz(this.quizState);
      this.scene.start('ResultsScene', { score });
    });
  }
}
