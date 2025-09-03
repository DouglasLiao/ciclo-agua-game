import { getPath } from '../systems/ui.js'

export default class ResultsScene extends Phaser.Scene {
  constructor() { super('ResultsScene') }

  init(data) {
  this.score = (data && (data.scoreTotal ?? data.score)) || 0
  this.gameData = data?.gameData || null
  }

  create() {
    const { centerX, centerY } = this.cameras.main
    const gameData = this.scene.settings?.data?.gameData || this.gameData || {}
    const title = getPath(gameData, 'ui.mensagens.resultadoTitulo', 'Resultado')
    const scoreLabel = getPath(gameData, 'ui.mensagens.pontuacao', 'Pontuação')
    this.add.text(centerX, centerY - 20, title, { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5)
    const scoreDisplay = Math.round(this.score)
    this.add.text(centerX, centerY + 40, `${scoreLabel}: ${scoreDisplay}`, { fontSize: '32px', color: '#4ec2f0' }).setOrigin(0.5)

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MenuScene')
    })
  }
}
