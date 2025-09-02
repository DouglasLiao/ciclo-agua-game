import { loadGameData } from '../systems/dataLoader.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Preload mínimo. Adicione aqui assets críticos (logo, atlas, fontes, etc.).
    // this.load.image('logo', 'assets/logo.png');
    // Som opcional de conclusão do quiz (coloque pelo menos um dos formatos abaixo)
    // Suporte multi-formato para compatibilidade cross-browser
    this.load.audio('quiz_complete', [
      'assets/sfx/complete.wav'
    ]);

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
    // Removido decodeAudio manual: Phaser já decodifica automaticamente quando necessário.
    if (this.sound && this.cache.audio.exists('quiz_complete')) {
      console.debug('[BootScene] Áudio quiz_complete carregado (decodificação automática)');
    }
    this.scene.start('MenuScene', { gameData: this.gameData });
  }
}
