import { WorkingTree } from '@methodical-js/core'
import { RenderFunction } from './types.js'
import { renderChildren } from './utils.js'

declare module '@methodical-js/core' {
  interface ViewNodeManager {
    render: RenderFunction
  }
}

class MethodicalGame {
  private _delta = 0
  private _lastTimestamp = -1

  public get delta() {
    return this._delta
  }

  public init(canvas: HTMLCanvasElement) {
    WorkingTree.setRootViewReference(canvas)
    WorkingTree.performInitialRender()

    // TODO: makes canvas focusable and handle keyboard events, possibly remove this
    // when implementing a real event system
    canvas.tabIndex = 1

    const ctx = canvas.getContext('2d')!

    const render = (timestamp: number) => {
      this.updateDelta(timestamp)

      WorkingTree.performUpdate()

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      renderChildren(WorkingTree.root, ctx)

      requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
  }

  private updateDelta(timestamp: number) {
    if (this._lastTimestamp === -1) {
      this._lastTimestamp = timestamp
    }
    this._delta = timestamp - this._lastTimestamp
    this._lastTimestamp = timestamp
  }
}

const Methodical = new MethodicalGame()
export default Methodical

export { on } from './on.js'
export { Rect } from './Rect.js'
export { YSort } from './YSort.js'
