import { remember } from '@methodical-js/core'
import Methodical, { Rect, YSort, on } from '@methodical-js/game'

const canvas = document.getElementById('canvas')! as HTMLCanvasElement

YSort({ id: 'root' }, () => {
  const yellowX = remember(50)
  const yellowY = remember(30)

  Rect({ id: 'rect1', position: { x: 0, y: 20 }, size: { width: 100, height: 100 }, color: 'red' })
  Rect({
    id: 'rect2',
    position: { x: yellowX.value, y: yellowY.value },
    size: { width: 100, height: 100 },
    color: 'yellow',
  })

  on('keydown', (e: KeyboardEvent) => {
    const dist = 0.3 * Methodical.delta
    if (e.key === 'a') {
      yellowX.value -= dist
    } else if (e.key === 'd') {
      yellowX.value += dist
    } else if (e.key === 'w') {
      yellowY.value -= dist
    } else if (e.key === 's') {
      yellowY.value += dist
    }
  })
})

Methodical.init(canvas)
