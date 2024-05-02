import { EventNodeManager, WorkingTree } from '@methodical-js/core'

// TODO: event system

const WebEventNodeManager: EventNodeManager<unknown> = {
  registerHandler(target, name, handler) {
    const canvas = WorkingTree.root.viewReference as HTMLCanvasElement
    canvas.addEventListener(name, handler)
  },
  unregisterHandler(target, name, handler) {
    const canvas = WorkingTree.root.viewReference as HTMLCanvasElement
    canvas.removeEventListener(name, handler)
  },
  updateHandler(target, name, newHandler, oldHandler) {
    const canvas = WorkingTree.root.viewReference as HTMLCanvasElement
    canvas.removeEventListener(name, oldHandler)
    canvas.addEventListener(name, newHandler)
  },
}

export function on(name: string, handler: (event: unknown) => void, ...dependencies: unknown[]) {
  WorkingTree.createEventNode(name, handler, WebEventNodeManager, dependencies)
}
