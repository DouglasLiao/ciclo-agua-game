import { loadGameData } from '../systems/dataLoader.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Preload mínimo. Adicione aqui assets críticos (logo, atlas, fontes, etc.).
    // this.load.image('logo', 'assets/logo.png');

    // Log de erros de carregamento de assets.
    this.load.on('loaderror', (fileObj) => {
      console.error('[BootScene] Erro ao carregar asset:', fileObj?.key, fileObj?.src || fileObj);
    });
  }

  async create() {
    try {
      this.gameData = await loadGameData('jogo.json');
    } catch (e) {
      console.error('[BootScene] Falha ao carregar jogo.json', e);
      this.gameData = {};
    }
    // Transição imediata para o menu após carregamentos mínimos.
    this.scene.start('MenuScene', { gameData: this.gameData });
  }
}
