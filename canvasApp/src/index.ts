import { remember, sideEffect } from '@methodical-js/core'
import Methodical, { Rect, YSort } from '@methodical-js/game'

const canvas = document.getElementById('canvas')! as HTMLCanvasElement

YSort({ id: 'root' }, () => {
  const yellowY = remember(30)

  sideEffect(() => {
    setTimeout(() => {
      yellowY.value = yellowY.value === 30 ? 10 : 30
    }, 250)
  }, yellowY.value)

  Rect({ id: 'rect1', x: 0, y: 20, width: 100, height: 100, color: 'red' })
  Rect({ id: 'rect2', x: 50, y: yellowY.value, width: 100, height: 100, color: 'yellow' })
})

Methodical.init(canvas)
