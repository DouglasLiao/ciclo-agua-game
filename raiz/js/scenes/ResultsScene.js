import { getUI } from '../systems/ui.js';

export default class ResultsScene extends Phaser.Scene {
  constructor() { super('ResultsScene'); }

  init(data) {
    this.score = data.score || 0;
  }

  create() {
    const { centerX, centerY } = this.cameras.main;
    const gameData = this.scene.settings?.data?.gameData || this.gameData || {};
    const title = getUI(gameData, 'results.title', 'Resultados');
    const scoreLabel = getUI(gameData, 'common.scoreLabel', 'Pontuação');
    this.add.text(centerX, centerY - 20, title, { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(centerX, centerY + 40, `${scoreLabel}: ${this.score}`, { fontSize: '32px', color: '#4ec2f0' }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    });
  }
}
