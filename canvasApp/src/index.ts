import Methodical, {
  Rect,
  YSort,
  on,
  Node,
  rememberNodePosition,
  Body,
  Shape,
  rememberNodeVelocity,
} from '@methodical-js/game'

const canvas = document.getElementById('canvas')! as HTMLCanvasElement

YSort({ id: 'root' }, () => {
  Node(
    {
      id: 'node1',
      position: { x: 100, y: 680 },
    },
    () => {
      const position = rememberNodePosition()

      Rect({
        id: 'rect1',
        position: position,
        size: { width: 1000, height: 50 },
        color: 'red',
      })

      Body({ id: 'body1', isStatic: true }, () => {
        Shape({ id: 'shape1', size: { x: 1000, y: 50 } })
      })
    }
  )

  Node({ id: 'node2', position: { x: 400, y: 100 } }, () => {
    const position = rememberNodePosition()
    const velocity = rememberNodeVelocity()

    Rect({
      id: 'rect2',
      position: position,
      size: { width: 100, height: 100 },
      color: 'yellow',
    })

    Rect({
      id: 'rect1',
      position: position,
      size: { width: 100, height: 100 },
      color: 'yellow',
    })

    Body({ id: 'body1' }, () => {
      Shape({ id: 'shape1', size: { x: 100, y: 100 } })
    })

    on('key', (e: KeyboardEvent) => {
      const velocityChange = Methodical.delta * 0.005

      if (e.key === 'a') {
        velocity.x -= velocityChange
      }
      if (e.key === 'd') {
        velocity.x += velocityChange
      }
      if (e.key === 'w') {
        if (velocity.y === 0) {
          velocity.y -= 3
        }
      }
    })
  })
})

Methodical.init(canvas)
