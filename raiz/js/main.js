// Ponto de entrada principal do jogo
// Usa ES Modules. Certifique-se de importar Phaser de um bundle local ou via CDN ESM.
// Para desenvolvimento rápido podemos usar a versão ESM oficial hospedada.

import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import DragPhaseScene from './scenes/DragPhaseScene.js';
import QuizPhaseScene from './scenes/QuizPhaseScene.js';
import ResultsScene from './scenes/ResultsScene.js';

// CDN ESM de Phaser (alternativamente instale via npm + bundler futuramente)
import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 540,
  backgroundColor: '#0e1e2b',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, DragPhaseScene, QuizPhaseScene, ResultsScene]
};

new Phaser.Game(config);
