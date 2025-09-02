import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js';
import { loadGameData } from '../systems/dataLoader.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Carregamentos iniciais mínimos (ex: logo, atlas, json)
    // this.load.image('logo', 'assets/logo.png');
  }

  async create() {
    try {
      this.gameData = await loadGameData('jogo.json');
    } catch (e) {
      console.warn('Falha ao carregar jogo.json', e);
      this.gameData = {};
    }
    this.scene.start('MenuScene', { gameData: this.gameData });
  }
}
