// Sistema de drag & drop para blocos em alvos nomeados.
// createDragSystem(scene, { targets, blocks, map }, callbacks)
// - targets: [{ name, rect }]
// - blocks:  [{ label, rect }]
// - map: { [blockLabel]: targetNameCorreto }
// callbacks: { onScoreChange(score, state, meta), onAllPlaced(state) }
// Retorna objeto de estado com blocks enriquecidos.
export function createDragSystem(scene, { targets, blocks, map }, { onScoreChange, onAllPlaced } = {}) {
  const state = {
    score: 0,
    total: blocks.length,
    blocks: [],
    targets,
    map
  }

  // Cor da borda de acerto (pode vir como string '#rrggbb' ou número)
  let corBordaAcerto = scene?.gameData?.drag?.cores?.acerto
  let corBordaErro = scene?.gameData?.drag?.cores?.erro
  if (typeof corBordaAcerto === 'string') {
    if (corBordaAcerto.startsWith('#')) {
      const hex = corBordaAcerto.substring(1)
      const num = parseInt(hex, 16)
      if (!Number.isNaN(num)) corBordaAcerto = num
    }
  }
  if (typeof corBordaErro === 'string') {
    if (corBordaErro.startsWith('#')) {
      const hex = corBordaErro.substring(1)
      const num = parseInt(hex, 16)
      if (!Number.isNaN(num)) corBordaErro = num
    }
  }
  if (typeof corBordaAcerto !== 'number') {
    corBordaAcerto = 0x1e7d4e // default
  }
  if (typeof corBordaErro !== 'number') {
    corBordaErro = 0xb33939 // default vermelho
  }

  const _targetByName = Object.fromEntries(targets.map(t => [t.name, t])) // reservado para uso futuro

  // Facilita teste de overlap
  function getOverlapTarget(blockRect) {
    const bBounds = blockRect.getBounds()
    return targets.find(t => Phaser.Geom.Intersects.RectangleToRectangle(bBounds, t.rect.getBounds()))
  }

  function clampToCanvas(displayObj) {
    const w = scene.scale.width
    const h = scene.scale.height
    const halfW = displayObj.displayWidth / 2
    const halfH = displayObj.displayHeight / 2
    if (displayObj.x < halfW) displayObj.x = halfW
    if (displayObj.x > w - halfW) displayObj.x = w - halfW
    if (displayObj.y < halfH) displayObj.y = halfH
    if (displayObj.y > h - halfH) displayObj.y = h - halfH
  }

  blocks.forEach((b, idx) => {
    const rect = b.rect // Phaser.GameObjects.Rectangle
    rect.setInteractive({ draggable: true, useHandCursor: true })
    const label = b.label
    const originalPos = { x: rect.x, y: rect.y }
    const blockState = {
      id: idx,
      label,
      rect,
      originalPos,
      placed: false,
      target: null,
      originalStrokeColor: rect.strokeColor,
      originalLineWidth: rect.lineWidth || 2
    }
    state.blocks.push(blockState)
  })

  // Eventos globais de drag
  scene.input.on('dragstart', (_pointer, gameObject) => {
    const blk = state.blocks.find(b => b.rect === gameObject)
    if (blk && blk.placed) {
      // Evita re-drag se já colocado
      gameObject.disableInteractive()
    }
  })

  scene.input.on('drag', (_pointer, gameObject, dragX, dragY) => {
    const blk = state.blocks.find(b => b.rect === gameObject)
    if (!blk || blk.placed) return
    gameObject.x = dragX
    gameObject.y = dragY
    clampToCanvas(gameObject)
  })

  scene.input.on('dragend', (_pointer, gameObject) => {
    const blk = state.blocks.find(b => b.rect === gameObject)
    if (!blk || blk.placed) return
    const overlap = getOverlapTarget(gameObject)
    if (overlap) {
      const expectedTargetName = map[blk.label]
      if (expectedTargetName && overlap.name === expectedTargetName) {
        // Snap ao alvo
        gameObject.x = overlap.rect.x
        gameObject.y = overlap.rect.y
        blk.placed = true
        blk.target = overlap.name
        // Apenas borda verde (sem alterar fill existente)
        gameObject.setStrokeStyle(4, corBordaAcerto, 1)
  state.score += 1
  if (onScoreChange) onScoreChange(state.score, state, { correct: true })
        // Desativa interação futura
        gameObject.disableInteractive()
        // Check all placed
        if (state.score === state.total) {
          if (onAllPlaced) onAllPlaced(state)
        }
        return
      }
    }
  // Caso incorreto ou sem alvo: shake simples + retorno à origem + borda vermelha temporária
    const origin = blk.originalPos
    const originalX = gameObject.x
    const shakeAmp = 12
    // aplica borda vermelha mais grossa
    gameObject.setStrokeStyle(4, corBordaErro, 1)
  if (onScoreChange) onScoreChange(state.score, state, { correct: false, error: true })
    scene.tweens.add({
      targets: gameObject,
      x: originalX + shakeAmp,
      duration: 60,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        scene.tweens.add({
          targets: gameObject,
          x: origin.x,
          y: origin.y,
            duration: 200,
            ease: 'Sine.easeOut'
        , onComplete: () => {
            // restaura borda original se ainda não colocado
            if (!blk.placed) {
              gameObject.setStrokeStyle(blk.originalLineWidth, blk.originalStrokeColor, 1)
            }
          }
        })
      }
    })
  })

  return state
}
