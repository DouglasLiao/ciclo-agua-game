// Ponto de entrada principal do jogo
// Usa ES Modules. Certifique-se de importar Phaser de um bundle local ou via CDN ESM.
// Para desenvolvimento rápido podemos usar a versão ESM oficial hospedada.

import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import DragPhaseScene from './scenes/DragPhaseScene.js';
import QuizPhaseScene from './scenes/QuizPhaseScene.js';
import ResultsScene from './scenes/ResultsScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#0e1e2b',
  physics: {
    default: 'arcade',
    arcade: { debug: false, gravity: { y: 0 } }
  },
  scene: [BootScene, MenuScene, DragPhaseScene, QuizPhaseScene, ResultsScene]
};

export function initGame() {
  return new Phaser.Game(config);
}

// Inicializa imediatamente ao carregar o módulo
initGame();
