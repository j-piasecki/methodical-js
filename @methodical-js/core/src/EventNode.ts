import { EventNodeManager } from './EventNodeManager.js'
import { NodeType } from './NodeType.js'
import { ViewNode } from './ViewNode.js'
import { WorkingNode } from './WorkingNode.js'
import { compareDependencies } from './utils.js'

export type EventHandler<T> = (event: T) => void

export class EventNode<T, U> extends WorkingNode {
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
    const parent = this.parent as ViewNode
    // we want to attach the event handler to the view reference of the parent
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
      // NOTE: this will break in case where updateView method drops the existing view and creates a new one
      // this is called before the tree diffing stage
      this.eventManager?.updateHandler(
        this.getEventTarget(),
        this.eventName,
        handler,
        previous.handler
      )
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
}
