import { EventNodeManager } from './EventNodeManager.js'
import { NodeType } from './NodeType.js'
import { ViewNode } from './ViewNode.js'
import { WorkingNode } from './WorkingNode.js'
import { compareDependencies } from './utils.js'

export type EventHandler<T> = (event: T) => void

export class EventNode<T, U> extends WorkingNode {
  private previousHandler?: EventHandler<T>
  private handler: EventHandler<T>
  private dependencies: unknown[]
  private eventName: string

  public eventManager?: EventNodeManager<U>

  constructor(id: string | number, name: string) {
    super(id, NodeType.Event)
    this.eventName = name
  }

  private getEventTarget(): U {
    // event node may only be called inside view node
    let parent = this.parent as ViewNode
    // we want to attach the event handler to the first ancestor with a view reference
    while (parent.viewReference === undefined) {
      parent = parent.parent as ViewNode
    }

    return parent.viewReference as U
  }

  private initialize(handler: EventHandler<T>, dependencies: unknown[]) {
    this.handler = handler
    this.dependencies = dependencies
  }

  private restore(previous: EventNode<T, U>, handler: EventHandler<T>, dependencies: unknown[]) {
    this.dependencies = dependencies
    const areDependenciesEqual = compareDependencies(previous.dependencies, dependencies)

    // if dependencies are equal, we can reuse the handler
    if (areDependenciesEqual) {
      this.handler = previous.handler
    } else {
      // otherwise, we need to cleanup the previous handler and initialize a new one
      this.previousHandler = previous.handler
      this.handler = handler
    }
  }

  public initializeOrRestore(handler: EventHandler<T>, dependencies?: unknown[]) {
    const previousEffectNode = this.findPredecessorNode()

    if (previousEffectNode !== undefined) {
      this.restore(previousEffectNode, handler, dependencies ?? [])
    } else {
      this.initialize(handler, dependencies ?? [])
    }
  }

  public unregisterHandler() {
    this.eventManager?.unregisterHandler(this.getEventTarget(), this.eventName, this.handler)
  }

  public registerHandler() {
    this.eventManager?.registerHandler(this.getEventTarget(), this.eventName, this.handler)
  }

  public updateHandler() {
    // if the previous handler is defined, it means that the handler has changed and we need to update the event manager
    if (this.previousHandler !== undefined) {
      this.eventManager?.updateHandler(
        this.getEventTarget(),
        this.eventName,
        this.handler,
        this.previousHandler
      )

      this.previousHandler = undefined
    }
  }
}
