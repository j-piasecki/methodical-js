import { EventNodeManager, WorkingTree } from '@methodical-js/core'
import { registerHandler, unregisterHandler, updateHandler } from './events.js'

const WebEventNodeManager: EventNodeManager<string> = {
  registerHandler(target, name, handler) {
    registerHandler(target, name, handler)
  },
  unregisterHandler(target, name, handler) {
    unregisterHandler(target, name, handler)
  },
  updateHandler(target, name, newHandler, oldHandler) {
    updateHandler(target, name, newHandler, oldHandler)
  },
}

export function on(name: string, handler: (event: unknown) => void, ...dependencies: unknown[]) {
  WorkingTree.createEventNode(name, handler, WebEventNodeManager, dependencies)
}
