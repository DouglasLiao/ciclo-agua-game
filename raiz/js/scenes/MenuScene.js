import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  init(data) {
    this.gameData = data.gameData || {};
  }

  create() {
    const { centerX, centerY } = this.cameras.main;

    this.add.text(centerX, centerY - 40, this.gameData.nome || 'Ciclo da Água', { fontSize: '42px', color: '#ffffff' }).setOrigin(0.5);

    const playText = this.add.text(centerX, centerY + 20, 'Iniciar', { fontSize: '32px', color: '#4ec2f0' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => {
        this.scene.start('DragPhaseScene');
      });

    playText.on('pointerover', () => playText.setColor('#ffffff'));
    playText.on('pointerout', () => playText.setColor('#4ec2f0'));
  }
}
