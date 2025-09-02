import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js';

export default class ResultsScene extends Phaser.Scene {
  constructor() { super('ResultsScene'); }

  init(data) {
    this.score = data.score || 0;
  }

  create() {
    const { centerX, centerY } = this.cameras.main;
    this.add.text(centerX, centerY - 20, 'Resultados', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(centerX, centerY + 40, `Pontuação: ${this.score}`, { fontSize: '32px', color: '#4ec2f0' }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    });
  }
}
