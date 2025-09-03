import { loadGameData, resolveDatasetName } from '../systems/dataLoader.js';

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
    // Detecta dataset via query (?data=arquivo.json ou ?jogo=arquivo.json)
  let dataset = resolveDatasetName('jogo.json');
    try {
      if (typeof window !== 'undefined') {
        const qs = new URLSearchParams(window.location.search);
        dataset = qs.get('data') || qs.get('jogo') || dataset;
      }
    } catch (e) { /* ignore */ }
    this.datasetFile = dataset;
    try {
      this.gameData = await loadGameData(dataset);
    } catch (e) {
      console.error('[BootScene] Falha ao carregar', dataset, e);
      this.gameData = {};
    }
    // Acessibilidade: alto contraste
    try {
      const alto = this.gameData?.acessibilidade?.altoContraste;
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.toggle('alto-contraste', !!alto);
      }
    } catch (e) {
      console.warn('[BootScene] Não foi possível aplicar alto contraste', e);
    }
    // Removido decodeAudio manual: Phaser já decodifica automaticamente quando necessário.
    if (this.sound && this.cache.audio.exists('quiz_complete')) {
      console.debug('[BootScene] Áudio quiz_complete carregado (decodificação automática)');
    }
  this.scene.start('MenuScene', { gameData: this.gameData, dataset });
  }
}
