import { loadGameData, invalidateGameDataCache } from '../systems/dataLoader.js';
import { /* getUI */ getPath } from '../systems/ui.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  init(data) {
    this.initialGameData = data.gameData || null;
    this.currentDataset = data.dataset || 'jogo.json';
  }

  create() {
    const { centerX, centerY } = this.cameras.main;
  const gd = this.initialGameData;
  const loadingLabel = getPath(gd, 'ui.mensagens.carregando', 'Carregando...');
  const startBtnLabel = getPath(gd, 'ui.botoes.iniciar', 'Iniciar');
    this.titleText = this.add.text(centerX, centerY - 60, loadingLabel, { fontSize: '42px', color: '#ffffff' }).setOrigin(0.5);
    this.startText = this.add.text(centerX, centerY + 10, startBtnLabel, { fontSize: '32px', color: '#555555' })
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
      this.startText.text = getPath(this.gameData || this.initialGameData, 'ui.mensagens.iniciando', 'Iniciando...');
      try {
        if (!this.gameDataPromise) this.gameDataPromise = loadGameData(this.currentDataset).catch(err => { throw err; });
        const data = await this.gameDataPromise;
        this.scene.start('DragPhaseScene', { gameData: data });
      } catch (_err) {
        this.startText.setColor('#ff5555');
        this.startText.text = getPath(this.gameData, 'ui.mensagens.falhaCarregar', 'Falha - tentar?');
              this.transitioning = false;
            }
          };

        this.startText.on('pointerup', attemptStart);
        this.startText.on('pointerover', () => this.startEnabled && this.startText.setColor('#ffffff'));
        this.startText.on('pointerout', () => this.startEnabled && this.startText.setColor('#4ec2f0'));

        this.input.keyboard.on('keydown-ENTER', attemptStart);

        this.gameDataPromise = loadGameData(this.currentDataset)
          .then(data => {
            this.gameData = data;
            this.titleText.text = getPath(data, 'ui.titulo', 'Título');
            this.startText.setText(getPath(data, 'ui.botoes.iniciar', 'Iniciar'));
            enableStart();
          })
          .catch(() => {
            // falha ao carregar dataset
            this.titleText.text = getPath(this.initialGameData, 'ui.mensagens.falhaCarregar', 'Erro ao carregar');
            this.startText.setColor('#ff5555');
            this.startText.text = 'Recarregar';
            this.startText.on('pointerup', () => {
              this.startText.removeAllListeners('pointerup');
              this.scene.restart();
            });
          });

    // Atalho para alternar dataset (D). Lista simples; pode ser expandida.
    this.datasets = ['jogo.json', 'jogo_temasolar.json'];
    this.input.keyboard.on('keydown-D', () => {
      const idx = this.datasets.indexOf(this.currentDataset);
      const next = this.datasets[(idx + 1) % this.datasets.length];
      if (next === this.currentDataset) return;
      this.currentDataset = next;
      invalidateGameDataCache(next); // garante recarregamento
      this.startEnabled = false;
      this.titleText.text = `Dataset: ${next} (carregando...)`;
      this.startText.setText('...');
      this.startText.setColor('#555555');
      this.gameDataPromise = null;
      this.gameData = null;
      this.gameDataPromise = loadGameData(this.currentDataset)
        .then(data => {
          this.gameData = data;
          this.titleText.text = getPath(data, 'ui.titulo', `Dataset: ${next}`);
          this.startText.setText(getPath(data, 'ui.botoes.iniciar', 'Iniciar'));
          enableStart();
        })
  .catch(() => {
          // erro ao alternar dataset
          this.titleText.text = 'Erro ao alternar dataset';
          this.startText.setColor('#ff5555');
          this.startText.setText('Falhou');
        });
    });
      }
}
