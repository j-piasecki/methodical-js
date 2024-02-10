import { BaseConfig } from './BaseConfig.js'
import { EffectNode, EffectType } from './EffectNode.js'
import { EventNode } from './EventNode.js'
import { EventNodeManager } from './EventNodeManager.js'
import { PrefixTree } from './PrefixTree.js'
import { RebuildingNode } from './RebuildingNode.js'
import { RememberNode } from './RememberNode.js'
import { Renderer } from './Renderer.js'
import { RootNode } from './RootNode.js'
import { Tracing } from './Tracing.js'
import { ViewNode } from './ViewNode.js'
import { ViewNodeManager } from './ViewNodeManager.js'
import { WorkingNode } from './WorkingNode.js'
import { deepEqual } from './utils.js'

export class WorkingTree {
  private static _root: RootNode = new RootNode()
  private static _current: WorkingNode = WorkingTree._root

  private static updatePaths = new PrefixTree()
  private static updateQueued = false

  private static renderer = new Renderer()

  public static get root() {
    return WorkingTree._root
  }

  public static get current() {
    return WorkingTree._current
  }

  public static get hasPendingUpdate() {
    return this.updateQueued
  }

  public static reset() {
    WorkingTree._root = new RootNode()
    WorkingTree._current = WorkingTree._root
    this.updatePaths = new PrefixTree()
    this.updateQueued = false
  }

  public static withContext(context: WorkingNode, fun?: () => void) {
    if (fun !== undefined) {
      const previousContext = WorkingTree.current
      WorkingTree._current = context
      fun()
      WorkingTree._current = previousContext
    }
  }

  public static queueUpdate(node: WorkingNode) {
    this.updatePaths.addPath(node.path)
    this.updateQueued = true
  }

  public static performUpdate() {
    if (!this.updateQueued) {
      return
    }

    // trace starts one microsecond before the actual render starts so the layout is correct
    const startTime = performance.now() - 0.001

    const pathsToUpdate = this.updatePaths.getPaths()
    this.updatePaths.clear()
    this.updateQueued = false

    for (const path of pathsToUpdate) {
      const nodeToUpdate = WorkingTree.root.getNodeFromPath(path) as ViewNode

      if (nodeToUpdate !== null) {
        const rebuildContext = new RebuildingNode(nodeToUpdate)
        // set previous context to the node that is being rebuilt so that remembered values can be restored
        rebuildContext.predecessorNode = nodeToUpdate

        WorkingTree.withContext(rebuildContext, nodeToUpdate.body!)

        this.renderer.renderUpdate(nodeToUpdate, rebuildContext)

        // move children from the rebuilding node to the node that is being rebuilt
        // we also need to reassign the parent of the direct children so it points
        // to the node that is being rebuilt
        nodeToUpdate.children = rebuildContext.children
        for (const child of nodeToUpdate.children) {
          child.parent = nodeToUpdate
        }
      }
    }

    const duration = performance.now() - startTime
    Tracing.traceBuild('update', startTime, duration, { pathsToUpdate })
  }

  public static performInitialRender() {
    // should be called only once, after the initial tree is built
    // we diff the root node with an empty root node to render the initial tree
    this.renderer.renderUpdate(new RootNode(), WorkingTree.root)
  }

  public static setRootViewReference(viewReference: unknown) {
    WorkingTree.root.viewReference = viewReference
  }

  public static createViewNode(
    config: BaseConfig,
    ViewNodeManager: ViewNodeManager,
    body?: () => void
  ) {
    const startTime = performance.now()

    // remember may only be called inside view node
    const currentView = WorkingTree.current as ViewNode
    const view = new ViewNode(config.id, config, body)
    view.viewManager = ViewNodeManager

    // TODO: this may break during rebuild, the parent may be dropped from the current tree, not sure though
    view.parent = currentView

    // propagate predecessor during rebuild, so that remembered values can be restored in children and for
    // optimization purposes, so that we can skip updating the view if the config is the same and the view is pure
    view.predecessorNode = view.findPredecessorNode()
    currentView.children.push(view)

    if (
      view.config.pure !== true ||
      view.predecessorNode === undefined ||
      !deepEqual(view.predecessorNode.config, view.config)
    ) {
      if (body !== undefined) {
        WorkingTree.withContext(view, body)
      }
    } else {
      // TODO: this will break when the body function changes but the config stays the same, TBD whether this is a problem
      // if the config is the same, we can reuse the children from the predecessor
      view.children = view.predecessorNode.children
      for (const child of view.children) {
        child.parent = view
      }

      // if the config stays the same, we can skip updating the view
      view.isRestored = true
    }

    // we don't need to keep the reference to the predecessor after children are calculated
    view.predecessorNode = undefined

    const duration = performance.now() - startTime
    Tracing.traceBuild(config.id, startTime, duration)

    return view
  }

  public static createEventNode<T, U>(
    name: string,
    handler: (event: T) => void,
    eventManager: EventNodeManager<U>,
    dependencies: unknown[]
  ) {
    const startTime = performance.now()

    // effect may only be called inside view node
    const currentView = WorkingTree.current as ViewNode
    const node = new EventNode(currentView._nextActionId++, name)
    node.eventManager = eventManager

    // TODO: this may break during rebuild, the parent may be dropped from the current tree, not sure though
    node.parent = currentView
    currentView.children.push(node)

    node.initializeOrRestore(handler, dependencies)

    const duration = performance.now() - startTime
    Tracing.traceBuild(`create ${name} event`, startTime, duration)

    return node
  }

  public static createRememberNode<T>(initialValue: T) {
    const startTime = performance.now()

    // remember may only be called inside view node
    const currentView = WorkingTree.current as ViewNode
    const node = new RememberNode<T>(currentView._nextActionId++)

    // TODO: this may break during rebuild, the parent may be dropped from the current tree, not sure though
    node.parent = currentView
    currentView.children.push(node)

    node.initializeOrRestore(initialValue)

    const duration = performance.now() - startTime
    Tracing.traceBuild('create remember node', startTime, duration)

    return node
  }

  public static createEffectNode(effect: EffectType, dependencies: unknown[]) {
    const startTime = performance.now()

    // effect may only be called inside view node
    const currentView = WorkingTree.current as ViewNode
    const node = new EffectNode(currentView._nextActionId++)

    // TODO: this may break during rebuild, the parent may be dropped from the current tree, not sure though
    node.parent = currentView
    currentView.children.push(node)

    node.initializeOrRestore(effect, dependencies)

    const duration = performance.now() - startTime
    Tracing.traceBuild('create effect node', startTime, duration)

    return node
  }
}
