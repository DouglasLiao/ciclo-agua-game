import { startQuiz, computeScoreQuiz, computeScoreDrag } from '../systems/quizSystem.js'
import { getPath, getArray } from '../systems/ui.js'

export default class QuizPhaseScene extends Phaser.Scene {
  constructor() {
    super('QuizPhaseScene')
  }

  init(data) {
    this.dragAcertos = data.dragAcertos || 0
    this.dragTotal = data.dragTotal || 0
    this.gameData = data.gameData || null
  }

  create() {
    const quizTitle = getPath(this.gameData, 'ui.mensagens.faseQuiz', 'Fase de Quiz')
    this.add.text(20, 20, quizTitle, { fontSize: '20px', color: '#ffffff' })

    const perguntasDemo = getArray(this.gameData, 'quiz.perguntas')

    startQuiz(this, perguntasDemo, {
      onFinish: (res) => {
        const pesos = this.gameData?.pontuacao || { pesoDrag: 50, pesoQuiz: 50 }
        const dragScore = computeScoreDrag(this.dragAcertos, this.dragTotal, pesos.pesoDrag)
        const quizScore = computeScoreQuiz(res, perguntasDemo.length, pesos.pesoQuiz)
        let scoreTotal = dragScore + quizScore
        if (scoreTotal > 100) scoreTotal = 100
        if (scoreTotal < 0) scoreTotal = 0
        // Tocar som somente se asset carregado (evita 404 se não existir)
        if (this.sound && this.cache.audio.exists('quiz_complete')) {
          try {
            const s = this.sound.play('quiz_complete')
            if (!s) {
              /* som não iniciou */
            }
          } catch (_err) {
            /* ignore */
          }
        }
        this.scene.start('ResultsScene', { scoreTotal, gameData: this.gameData })
      }
    })
  }
}
