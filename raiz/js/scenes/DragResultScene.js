import { getPath } from '../systems/ui.js'

// Cena intermediária exibida após concluir todos os blocos do drag.
// Mostra acertos e permite prosseguir para o quiz.
export default class DragResultScene extends Phaser.Scene {
  constructor() {
    super('DragResultScene')
  }

  init(data) {
    this.dragAcertos = data?.dragAcertos || 0
    this.dragTotal = data?.dragTotal || 0
    this.gameData = data?.gameData || null
  }

  create() {
    const { centerX, centerY } = this.cameras.main
    const titulo = getPath(
      this.gameData,
      'ui.mensagens.dragResumoTitulo',
      'Fase de Arrastar Concluída'
    )
    const scoreLabel = getPath(this.gameData, 'ui.mensagens.pontuacao', 'Pontuação')
    const continuarLabel = getPath(
      this.gameData,
      'ui.botoes.continuar',
      'Continuar para o Quiz'
    )
    const infoLabel = getPath(
      this.gameData,
      'ui.mensagens.instrucaoContinuar',
      'Pressione ESPAÇO ou ENTER para continuar'
    )

    this.add
      .text(centerX, centerY - 120, titulo, { fontSize: '40px', color: '#ffffff' })
      .setOrigin(0.5)

    const percent = this.dragTotal > 0 ? Math.round((this.dragAcertos / this.dragTotal) * 100) : 0
    this.add
      .text(
        centerX,
        centerY - 40,
        `${scoreLabel}: ${this.dragAcertos}/${this.dragTotal} (${percent}%)`,
        { fontSize: '28px', color: '#4ec2f0' }
      )
      .setOrigin(0.5)

    // Botão simples (texto interativo)
    this.continueText = this.add
      .text(centerX, centerY + 40, continuarLabel, { fontSize: '30px', color: '#4ec2f0' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(centerX, centerY + 100, infoLabel, { fontSize: '16px', color: '#cccccc' })
      .setOrigin(0.5)

    const proceed = () => {
      if (this.transitioning) return
      this.transitioning = true
      this.scene.start('QuizPhaseScene', {
        dragAcertos: this.dragAcertos,
        dragTotal: this.dragTotal,
        gameData: this.gameData
      })
    }

    this.continueText.on('pointerover', () => this.continueText.setColor('#ffffff'))
    this.continueText.on('pointerout', () => this.continueText.setColor('#4ec2f0'))
    this.continueText.on('pointerup', proceed)
    this.input.keyboard.once('keydown-SPACE', proceed)
    this.input.keyboard.once('keydown-ENTER', proceed)
  }
}
