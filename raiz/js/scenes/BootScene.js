import { loadGameData, resolveDatasetName } from '../systems/dataLoader.js'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    // Preload mínimo. Adicione aqui assets críticos (logo, atlas, fontes, etc.).
    // this.load.image('logo', 'assets/logo.png');
    // Som opcional de conclusão do quiz (coloque pelo menos um dos formatos abaixo)
    // Suporte multi-formato para compatibilidade cross-browser
  this.load.audio('quiz_complete', ['assets/sfx/complete.wav'])
  this.load.audio('timer_countdown', ['assets/sfx/timer_countdown.wav'])
  this.load.audio('success', ['assets/sfx/success.wav'])
  this.load.audio('wrong', ['assets/sfx/wrong.wav'])
  this.load.audio('ui_start', ['assets/sfx/start.wav'])
  }
  async create() {
    // Detecta dataset via query (?data=arquivo.json ou ?jogo=arquivo.json)
    let dataset = resolveDatasetName('jogo.json')
    try {
      if (typeof window !== 'undefined') {
        const qs = new URLSearchParams(window.location.search)
        dataset = qs.get('data') || qs.get('jogo') || dataset
      }
    } catch (e) {
      /* ignore */
    }
    this.datasetFile = dataset
    try {
      this.gameData = await loadGameData(dataset)
    } catch (_) {
      this.gameData = {}
    }
    // Acessibilidade: alto contraste
    try {
      const alto = this.gameData?.acessibilidade?.altoContraste
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.toggle('alto-contraste', !!alto)
      }
    } catch (_) {
      /* alto contraste falhou */
    }
    // Removido decodeAudio manual: Phaser já decodifica automaticamente quando necessário.
    // Áudio opcional carregado
    this.scene.start('MenuScene', { gameData: this.gameData, dataset })
  }
}
