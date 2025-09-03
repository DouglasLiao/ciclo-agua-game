import { createDragSystem } from '../systems/dragSystem.js'
import { getPath, getArray } from '../systems/ui.js'
import { loadGameData } from '../systems/dataLoader.js'

export default class DragPhaseScene extends Phaser.Scene {
  constructor() { super('DragPhaseScene') }

  init(data) {
    this.gameData = data?.gameData || null
    this.dataset = data?.dataset || null
    // Fallback: tenta inferir dataset via query se não veio.
    if (!this.dataset) {
      try {
        if (typeof window !== 'undefined') {
          const qs = new URLSearchParams(window.location.search)
          this.dataset = qs.get('data') || qs.get('jogo') || 'jogo.json'
        }
      } catch (_) {
        this.dataset = 'jogo.json'
      }
    }
  }

  create() {
    // Se gameData não chegou (ex: cena iniciada diretamente ou perda de estado), recarrega.
    if (!this.gameData) {
      this.add.text(20, 20, 'Carregando dados...', { fontSize: '18px', color: '#ffffff' })
      loadGameData(this.dataset || 'jogo.json')
        .then(data => {
          this.scene.restart({ gameData: data, dataset: this.dataset })
        })
  .catch(_err => {
          this.add.text(20, 50, 'Erro ao carregar dados', { fontSize: '16px', color: '#ff5555' })
        })
      return // evita continuar sem dados
    }
  // HUD / Score
  this.score = 0
  const dragTitle = getPath(this.gameData, 'ui.mensagens.faseDrag', 'Fase de Arrastar')
  this.add.text(20, 48, dragTitle, { fontSize: '20px', color: '#4ec2f0' })
  const scoreLabel = getPath(this.gameData, 'ui.mensagens.pontuacao', 'Pontuação')


    // Área de alvos (4 alvos nomeados)
    // Layout: linha superior centralizada
  const targetNames = getArray(this.gameData, 'drag.targets')
    const startX = 120
    const gapX = 200
    const yTargets = 140
    this.targets = targetNames.map((name, i) => {
      const x = startX + i * gapX
      const box = this.add.rectangle(x, yTargets, 160, 80, 0x123347, 0.6).setStrokeStyle(2, 0x4ec2f0)
      this.add.text(x, yTargets - 10, name, { fontSize: '16px', color: '#ffffff', align: 'center', wordWrap: { width: 150 } }).setOrigin(0.5, 0.5)
      return { name, rect: box }
    })

    // Blocos de origem (4 blocos com texto) na parte inferior
  const blockLabels = getArray(this.gameData, 'drag.blocks')
  // Score text (mostra total conhecido)
  this.scoreText = this.add.text(20, 20, `${scoreLabel}: 0/${blockLabels.length}` , { fontSize: '18px', color: '#ffffff' })
    const yBlocks = 420
    this.blocks = blockLabels.map((label, i) => {
      const x = startX + i * gapX
      const rect = this.add.rectangle(x, yBlocks, 150, 60, 0x345b7d, 0.8).setStrokeStyle(2, 0xffffff)
      this.add.text(x, yBlocks, label, { fontSize: '16px', color: '#ffffff', align: 'center', wordWrap: { width: 140 } }).setOrigin(0.5)
      return { label, rect }
    })

    // Mapeamento correto (exemplo) label->target
  const mapping = getPath(this.gameData, 'drag.map', {})

    // Sistema de drag
    this.dragState = createDragSystem(
      this,
      { targets: this.targets, blocks: this.blocks, map: mapping },
      {
        onScoreChange: (score, state, meta) => {
          // Atualiza HUD; meta.correct boolean (pode ser ignorado por enquanto)
          this.scoreText.setText(`${scoreLabel}: ${score}/${state.total}`)
          if (meta && meta.error) {
            // (Opcional) pequeno flash poderia ser adicionado aqui
          }
        },
        onAllPlaced: (state) => {
          // Pequeno feedback visual antes da transição
          const msg = getPath(this.gameData, 'ui.mensagens.todosColocados', 'Todos posicionados! Avançando...')
          this.add.text(20, 80, msg, { fontSize: '18px', color: '#ffffff' })
          this.time.delayedCall(1000, () => {
            this.scene.start('QuizPhaseScene', { dragAcertos: state.score, dragTotal: state.total, gameData: this.gameData })
          })
        }
      }
    )
  }
}
