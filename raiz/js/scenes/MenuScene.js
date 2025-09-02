/* global Phaser */
import { loadGameData } from '../systems/dataLoader.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  init(data) {
    // Pode chegar gameData da BootScene; vamos recarregar conforme requisito.
    this.initialGameData = data.gameData || null;
  }

  create() {
    const { centerX, centerY } = this.cameras.main;

    this.titleText = this.add.text(centerX, centerY - 60, 'Carregando...', { fontSize: '42px', color: '#ffffff' }).setOrigin(0.5);
    this.startText = this.add.text(centerX, centerY + 10, 'Iniciar', { fontSize: '32px', color: '#555555' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: false });

    this.startEnabled = false;
    const enableStart = () => {
      this.startEnabled = true;
      this.startText.setColor('#4ec2f0');
      this.startText.input.cursor = 'pointer';
    };

    const attemptStart = async () => {
      if (!this.startEnabled || this.transitioning) return;
      this.transitioning = true;
      this.startText.setColor('#cccccc');
      this.startText.text = 'Iniciando...';
      try {
        if (!this.gameDataPromise) {
          this.gameDataPromise = loadGameData('jogo.json').catch(e => { throw e; });
        }
        const data = await this.gameDataPromise;
        this.scene.start('DragPhaseScene', { gameData: data });
      } catch (e) {
        console.error('[MenuScene] Erro ao iniciar (dados):', e);
        this.startText.setColor('#ff5555');
        this.startText.text = 'Falha - tentar?';
        this.transitioning = false;
      }
    };

    this.startText.on('pointerup', attemptStart);
    this.startText.on('pointerover', () => this.startEnabled && this.startText.setColor('#ffffff'));
    this.startText.on('pointerout', () => this.startEnabled && this.startText.setColor('#4ec2f0'));

    this.input.keyboard.on('keydown-ENTER', attemptStart);

    this.gameDataPromise = loadGameData('jogo.json')
      .then(data => {
        this.gameData = data;
        this.titleText.text = data.nome || 'Ciclo da Água';
        enableStart();
      })
      .catch(e => {
        console.error('[MenuScene] Falha ao carregar jogo.json', e);
        this.titleText.text = 'Erro ao carregar dados';
        this.startText.setColor('#ff5555');
        this.startText.text = 'Recarregar';
        this.startText.on('pointerup', () => {
          this.startText.removeAllListeners('pointerup');
          this.scene.restart();
        });
      });
  }
}
