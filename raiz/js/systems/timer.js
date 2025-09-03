// timer.js - Componente simples de contagem regressiva para cenas Phaser
// Uso:
// const countdown = createCountdown(this, {
//   seconds: 60,
//   x: 760,
//   y: 20,
//   label: 'Tempo',
//   warnThreshold: 10,
//   onTick: ({ remaining, text }) => {...},
//   onExpire: () => {...}
// })
// countdown.stop('motivo-opcional')

export function createCountdown(
  scene,
  { seconds = 60, x = 0, y = 0, label = 'Tempo', warnThreshold = 10, onTick, onExpire, style = {} } = {}
) {
  let total = parseInt(seconds, 10)
  if (Number.isNaN(total) || total <= 0) total = 60
  let remaining = total
  let ended = false

  const textStyle = Object.assign({ fontSize: '18px', color: '#ffffff' }, style)
  const text = scene.add.text(x, y, `${label}: ${remaining}s`, textStyle)

  function updateDisplay() {
    text.setText(`${label}: ${remaining}s`)
    if (remaining <= warnThreshold) {
      text.setColor(remaining % 2 === 0 ? '#ff5555' : '#ffffff')
    }
  }

  const tick = () => {
    if (ended) return
    remaining -= 1
    updateDisplay()
    if (onTick) onTick({ remaining, total, text })
    if (remaining <= 0) {
      stop('tempo-esgotado')
      if (onExpire) onExpire()
    }
  }

  const tickEvent = scene.time.addEvent({ delay: 1000, loop: true, callback: tick })
  // Fallback absoluto (caso algum tick falhe)
  const hardTimeout = scene.time.delayedCall(total * 1000 + 50, () => {
    if (!ended) {
      stop('tempo-esgotado')
      if (onExpire) onExpire()
    }
  })

  function stop(reason) {
    if (ended) return
    ended = true
    tickEvent.remove(false)
    hardTimeout.remove(false)
    // Congela cor final se acabou por tempo
    if (reason === 'tempo-esgotado') text.setColor('#ff5555')
  }

  // Limpeza automática quando a cena for destruída
  scene.events.once('shutdown', () => stop('shutdown'))
  scene.events.once('destroy', () => stop('destroy'))

  return {
    stop,
    getRemaining: () => remaining,
    isEnded: () => ended,
    text
  }
}
