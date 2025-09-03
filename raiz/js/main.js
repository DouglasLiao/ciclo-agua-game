// Ponto de entrada principal do jogo
// Usa ES Modules. Certifique-se de importar Phaser de um bundle local ou via CDN ESM.
// Para desenvolvimento rápido podemos usar a versão ESM oficial hospedada.

import BootScene from './scenes/BootScene.js'
import MenuScene from './scenes/MenuScene.js'
import DragPhaseScene from './scenes/DragPhaseScene.js'
import QuizPhaseScene from './scenes/QuizPhaseScene.js'
import ResultsScene from './scenes/ResultsScene.js'

// Dimensões internas base (16:9)
const BASE_WIDTH = 960
const BASE_HEIGHT = 540

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: BASE_WIDTH,
  height: BASE_HEIGHT,
  backgroundColor: '#0e1e2b',
  physics: {
    default: 'arcade',
    arcade: { debug: false, gravity: { y: 0 } }
  },
  scene: [BootScene, MenuScene, DragPhaseScene, QuizPhaseScene, ResultsScene]
}

function applyLetterbox(game) {
  const canvas = game.canvas
  const w = window.innerWidth
  const h = window.innerHeight
  const targetRatio = BASE_WIDTH / BASE_HEIGHT
  let displayWidth, displayHeight
  if (w / h > targetRatio) {
    // Janela mais larga que o alvo -> limitar pela altura
    displayHeight = h
    displayWidth = Math.floor(h * targetRatio)
  } else {
    // Janela mais estreita -> limitar pela largura
    displayWidth = w
    displayHeight = Math.floor(w / targetRatio)
  }
  canvas.style.width = displayWidth + 'px'
  canvas.style.height = displayHeight + 'px'
  canvas.style.display = 'block'
  canvas.style.margin = '0 auto'
  // Centralização vertical manual (letterbox top/bottom)
  const topOffset = (h - displayHeight) / 2
  canvas.style.position = 'absolute'
  canvas.style.left = ((w - displayWidth) / 2) + 'px'
  canvas.style.top = topOffset + 'px'
  // Background letterbox já é a cor do body / container.
}

export function initGame() {
  const game = new Phaser.Game(config)
  // Ajusta inicialmente quando o canvas existir
  window.addEventListener('load', () => applyLetterbox(game))
  window.addEventListener('resize', () => applyLetterbox(game))
  return game
}

// Inicializa imediatamente ao carregar o módulo
initGame()
