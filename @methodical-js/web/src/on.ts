import { EventNodeManager, WorkingTree } from '@methodical-js/core'

const WebEventNodeManager: EventNodeManager<HTMLElement> = {
  registerHandler(target, name, handler) {
    target.addEventListener(name, handler)
  },
  unregisterHandler(target, name, handler) {
    target.removeEventListener(name, handler)
  },
  updateHandler(target, name, newHandler, oldHandler) {
    target.removeEventListener(name, oldHandler)
    target.addEventListener(name, newHandler)
  },
}

export function on(name: 'click', handler: (event: PointerEvent) => void, ...dependencies: unknown[]): void
export function on(name: string, handler: (event: unknown) => void, ...dependencies: unknown[]): void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function on(name: string, handler: (event: any) => void, ...dependencies: unknown[]) {
  WorkingTree.createEventNode(name, handler, WebEventNodeManager, dependencies)
}
