import { remember, sideEffect } from '@methodical-js/core'
import Methodical, { Rect, YSort, on } from '@methodical-js/game'

const canvas = document.getElementById('canvas')! as HTMLCanvasElement

YSort({ id: 'root' }, () => {
  const yellowX = remember(50)
  const yellowY = remember(30)

  sideEffect(() => {
    setTimeout(() => {
      yellowY.value = yellowY.value === 30 ? 10 : 30
    }, 250)
  }, yellowY.value)

  Rect({ id: 'rect1', position: { x: 0, y: 20 }, size: { width: 100, height: 100 }, color: 'red' })
  Rect({
    id: 'rect2',
    position: { x: yellowX.value, y: yellowY.value },
    size: { width: 100, height: 100 },
    color: 'yellow',
  })

  on('keydown', (e: KeyboardEvent) => {
    console.log(Methodical.delta)
    if (e.key === 'a') {
      yellowX.value -= 5
    } else if (e.key === 'd') {
      yellowX.value += 5
    }
  })
})

Methodical.init(canvas)
