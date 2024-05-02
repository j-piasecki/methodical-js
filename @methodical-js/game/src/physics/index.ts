import { dispatchEvent } from '../events.js'
import { Body } from './body.js'

const MAX_DELTA = 9

class PhysicsSystem {
  private bodies: Body[] = []

  tick(delta: number) {
    do {
      const step = Math.min(delta, MAX_DELTA)
      delta -= MAX_DELTA

      this.bodies.forEach((body) => {
        body.update(step)
      })

      for (const body of this.bodies) {
        for (const other of this.bodies) {
          if (body === other) {
            continue
          }

          if (body.collidesWith(other) && body.resolveCollision(other)) {
            console.log('collision')
            // dispatchEvent(body, '%collision', other)
          }
        }
      }
    } while (delta > 0)

    dispatchEvent('#', '%physics-tick', delta)
  }

  public addBody(body: Body) {
    this.bodies.push(body)
  }

  public removeBody(body: Body) {
    const index = this.bodies.indexOf(body)
    if (index === -1) {
      return
    }

    this.bodies.splice(index, 1)
  }
}

const Physics = new PhysicsSystem()
export default Physics
