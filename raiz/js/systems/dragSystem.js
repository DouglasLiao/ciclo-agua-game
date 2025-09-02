// Sistema de drag & drop para blocos em alvos nomeados.
// createDragSystem(scene, { targets, blocks, map }, callbacks)
// - targets: [{ name, rect }]
// - blocks:  [{ label, rect }]
// - map: { [blockLabel]: targetNameCorreto }
// callbacks: { onScoreChange(score), onAllPlaced(state) }
// Retorna objeto de estado com blocks enriquecidos.
export function createDragSystem(scene, { targets, blocks, map }, { onScoreChange, onAllPlaced } = {}) {
  const state = {
    score: 0,
    total: blocks.length,
    blocks: [],
    targets,
    map
  };

  const targetByName = Object.fromEntries(targets.map(t => [t.name, t]));

  // Facilita teste de overlap
  function getOverlapTarget(blockRect) {
    const bBounds = blockRect.getBounds();
    return targets.find(t => Phaser.Geom.Intersects.RectangleToRectangle(bBounds, t.rect.getBounds()));
  }

  function clampToCanvas(displayObj) {
    const w = scene.scale.width;
    const h = scene.scale.height;
    const halfW = displayObj.displayWidth / 2;
    const halfH = displayObj.displayHeight / 2;
    if (displayObj.x < halfW) displayObj.x = halfW;
    if (displayObj.x > w - halfW) displayObj.x = w - halfW;
    if (displayObj.y < halfH) displayObj.y = halfH;
    if (displayObj.y > h - halfH) displayObj.y = h - halfH;
  }

  blocks.forEach((b, idx) => {
    const rect = b.rect; // Phaser.GameObjects.Rectangle
    rect.setInteractive({ draggable: true, useHandCursor: true });
    const label = b.label;
    const originalPos = { x: rect.x, y: rect.y };
    const blockState = {
      id: idx,
      label,
      rect,
      originalPos,
      placed: false,
      target: null
    };
    state.blocks.push(blockState);
  });

  // Eventos globais de drag
  scene.input.on('dragstart', (_pointer, gameObject) => {
    const blk = state.blocks.find(b => b.rect === gameObject);
    if (blk && blk.placed) {
      // Evita re-drag se já colocado
      gameObject.disableInteractive();
    }
  });

  scene.input.on('drag', (_pointer, gameObject, dragX, dragY) => {
    const blk = state.blocks.find(b => b.rect === gameObject);
    if (!blk || blk.placed) return;
    gameObject.x = dragX;
    gameObject.y = dragY;
    clampToCanvas(gameObject);
  });

  scene.input.on('dragend', (_pointer, gameObject) => {
    const blk = state.blocks.find(b => b.rect === gameObject);
    if (!blk || blk.placed) return;
    const overlap = getOverlapTarget(gameObject);
    if (overlap) {
      const expectedTargetName = map[blk.label];
      if (expectedTargetName && overlap.name === expectedTargetName) {
        // Snap ao alvo
        gameObject.x = overlap.rect.x;
        gameObject.y = overlap.rect.y;
        blk.placed = true;
        blk.target = overlap.name;
        gameObject.setFillStyle(0x1e7d4e, 0.85);
        state.score += 1;
        if (onScoreChange) onScoreChange(state.score, state);
        // Desativa interação futura
        gameObject.disableInteractive();
        // Check all placed
        if (state.score === state.total) {
          if (onAllPlaced) onAllPlaced(state);
        }
        return;
      }
    }
    // Caso incorreto ou sem alvo: shake simples + retorno à origem
    const origin = blk.originalPos;
    const originalX = gameObject.x;
    const shakeAmp = 12;
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
        });
      }
    });
  });

  return state;
}
