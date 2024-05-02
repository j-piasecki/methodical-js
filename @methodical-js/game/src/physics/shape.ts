import { Vector } from './vector.js'

export class Shape {
  position: Vector = { x: 0, y: 0 }
  offset: Vector = { x: 0, y: 0 }
  size: Vector

  constructor(size: Vector, offset?: Vector) {
    this.size = size
    if (offset) {
      this.offset = offset
    }
  }

  get left() {
    return this.position.x + this.offset.x
  }

  get right() {
    return this.position.x + this.size.x + this.offset.x
  }

  get top() {
    return this.position.y + this.offset.y
  }

  get bottom() {
    return this.position.y + this.size.y + this.offset.y
  }
}
