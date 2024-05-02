import type { EventHandler } from './EventNode.js'

export interface EventNodeManager<T> {
  registerHandler(target: T, name: string, handler: EventHandler<unknown>): void
  unregisterHandler(target: T, name: string, handler: EventHandler<unknown>): void
  updateHandler(
    target: T,
    name: string,
    newHandler: EventHandler<unknown>,
    oldHandler: EventHandler<unknown>
  ): void
}
