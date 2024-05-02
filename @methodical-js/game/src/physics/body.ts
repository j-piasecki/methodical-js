import { Shape } from './shape.js'
import { Vector } from './vector.js'

const DECELERATION = 0.95
const GRAVITY = 0.001

export class Body {
  position: Vector = { x: 0, y: 0 }
  velocity: Vector = { x: 0, y: 0 }
  acceleration: Vector = { x: 0, y: 0 }

  shape?: Shape

  isStatic = false

  constructor(position?: Vector, velocity?: Vector, isStatic?: boolean) {
    if (position) {
      this.position = position
    }
    if (velocity) {
      this.velocity = velocity
    }
    if (isStatic) {
      this.isStatic = isStatic
    }
  }

  update(delta: number) {
    if (!this.isStatic) {
      this.applyForce({ x: 0, y: GRAVITY * delta })
    }

    this.velocity.x = this.acceleration.x * delta + this.velocity.x * DECELERATION
    this.velocity.y = this.acceleration.y * delta + this.velocity.y * DECELERATION

    this.position.x += this.velocity.x * delta
    this.position.y += this.velocity.y * delta

    this.acceleration.x = 0
    this.acceleration.y = 0

    if (this.shape) {
      this.shape.position = this.position
    }
  }

  applyForce(force: Vector) {
    this.acceleration.x += force.x
    this.acceleration.y += force.y
  }

  setShape(shape: Shape) {
    this.shape = shape

    this.shape.position = this.position
  }

  collidesWith(other: Body) {
    if (!this.shape || !other.shape) {
      return false
    }

    return (
      this.shape.left < other.shape.right &&
      this.shape.right > other.shape.left &&
      this.shape.top < other.shape.bottom &&
      this.shape.bottom > other.shape.top
    )
  }

  resolveCollision(other: Body): boolean {
    if (!this.shape || !other.shape) {
      return false
    }

    if (this.isStatic && other.isStatic) {
      // both are static, no need to resolve
      return false
    }

    if (this.isStatic && !other.isStatic) {
      // skip, handled by second if
      return false
    }

    const center = {
      x: this.position.x + this.shape.size.x / 2,
      y: this.position.y + this.shape.size.y / 2,
    }

    const otherCenter = {
      x: other.position.x + other.shape.size.x / 2,
      y: other.position.y + other.shape.size.y / 2,
    }

    const dx = otherCenter.x - center.x
    const dy = otherCenter.y - center.y

    const overlapX = Math.abs(
      Math.max(this.shape.left, other.shape.left) - Math.min(this.shape.right, other.shape.right)
    )
    const overlapY = Math.abs(
      Math.max(this.shape.top, other.shape.top) - Math.min(this.shape.bottom, other.shape.bottom)
    )

    if (!this.isStatic && other.isStatic) {
      if (Math.abs(overlapY) > Math.abs(overlapX)) {
        this.velocity.x = 0
        this.position.x -= overlapX * Math.sign(dx)
      } else {
        this.velocity.y = 0
        this.position.y -= overlapY * Math.sign(dy)
      }

      return true
    }

    const overlapDistance = Math.sqrt(overlapX * overlapX + overlapY * overlapY)
    const normalOverlap = {
      x: overlapX / overlapDistance,
      y: overlapY / overlapDistance,
    }

    const resolvedVelocity = {
      x: this.velocity.x + other.velocity.x,
      y: this.velocity.y + other.velocity.y,
    }

    normalOverlap.x *= normalOverlap.x
    normalOverlap.y *= normalOverlap.y

    this.position.x -= ((overlapX * normalOverlap.y) / 2) * Math.sign(dx)
    this.position.y -= ((overlapY * normalOverlap.x) / 2) * Math.sign(dy)

    this.velocity.x += resolvedVelocity.x / 2
    this.velocity.y += resolvedVelocity.y / 2

    other.position.x += ((overlapX * normalOverlap.y) / 2) * Math.sign(dx)
    other.position.y += ((overlapY * normalOverlap.x) / 2) * Math.sign(dy)

    other.velocity.x -= resolvedVelocity.x / 2
    other.velocity.y -= resolvedVelocity.y / 2

    return true
  }
}
