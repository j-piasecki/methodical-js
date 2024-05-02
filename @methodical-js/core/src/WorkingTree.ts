import { BaseConfig } from './BaseConfig.js'
import { DeferNode } from './DeferNode.js'
import { EffectNode, EffectType } from './EffectNode.js'
import { EventNode } from './EventNode.js'
import { EventNodeManager } from './EventNodeManager.js'
import { PrefixTree } from './PrefixTree.js'
import { RebuildingNode } from './RebuildingNode.js'
import { RememberNode } from './RememberNode.js'
import { Renderer } from './Renderer.js'
import { RootNode } from './RootNode.js'
import { SuspendNode } from './SuspendNode.js'
import { SuspenseBoundaryNode } from './SuspenseBoundaryNode.js'
import { Tracing } from './Tracing.js'
import { ViewNode } from './ViewNode.js'
import { ViewNodeManager } from './ViewNodeManager.js'
import { WorkingNode } from './WorkingNode.js'
import { deepEqual } from './utils.js'

export class WorkingTree {
  private static _root: RootNode = new RootNode()
  private static _current: WorkingNode = WorkingTree._root

  private static currentUpdatePaths = new PrefixTree()
  private static queuedUpdatePaths = new PrefixTree()
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
    this.queuedUpdatePaths = new PrefixTree()
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
    // in case of SuspenseBoundaryNode we need to queue the update on the parent, so it does not become RebuildingNode
    if (node instanceof SuspenseBoundaryNode) {
      this.queuedUpdatePaths.addPath(node.parent!.path)
    } else {
      this.queuedUpdatePaths.addPath(node.path)
    }

    this.updateQueued = true
  }

  private static _performUpdateInternal() {
    const pathsToUpdate = this.queuedUpdatePaths.getPaths()
    this.currentUpdatePaths = this.queuedUpdatePaths
    this.queuedUpdatePaths = new PrefixTree()
    this.updateQueued = false

    for (const path of pathsToUpdate) {
      const nodeToUpdate = WorkingTree.root.getNodeFromPath(path) as ViewNode | undefined

      if (nodeToUpdate !== undefined) {
        const rebuildContext = new RebuildingNode(nodeToUpdate)
        // set previous context to the node that is being rebuilt so that remembered values can be restored
        rebuildContext.predecessorNode = nodeToUpdate
        // set the parent reference, so tree traversal works correctly
        rebuildContext.parent = nodeToUpdate.parent

        WorkingTree.withContext(rebuildContext, nodeToUpdate.body!)

        this.renderer.renderUpdate(nodeToUpdate, rebuildContext)

        // move children from the rebuilding node to the node that is being rebuilt
        // we also need to reassign the parent of the direct children so it points
        // to the node that is being rebuilt
        nodeToUpdate.setChildren(rebuildContext.children)
      }
    }
  }

  public static performUpdate() {
    // trace starts one microsecond before the actual render starts so the layout is correct
    const startTime = performance.now() - 0.001

    let updateCount = 0
    while (this.updateQueued) {
      this._performUpdateInternal()

      if (updateCount++ > 128) {
        console.error('Update loop limit reached, possible infinite loop detected.')
        break
      }
    }

    const duration = performance.now() - startTime
    Tracing.traceBuild('update', startTime, duration, { updateCount })
  }

  public static performInitialRender() {
    // should be called only once, after the initial tree is built

    // mark the root node as created in case any view manager tries to copy the flags
    WorkingTree.root.__opt.created = true

    // we diff the root node with an empty root node to render the initial tree
    this.renderer.renderUpdate(new RootNode(), WorkingTree.root)

    // for the following renders we consider the root as updated in case any view manager tries to copy the flags
    WorkingTree.root.__opt.created = false
    WorkingTree.root.__opt.updated = true
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

    view.parent = currentView

    // propagate predecessor during rebuild, so that remembered values can be restored in children and for
    // optimization purposes, so that we can skip updating the view if the config is the same and the view is pure
    view.predecessorNode = view.findPredecessorNode()
    currentView.addChild(view)

    if (
      view.config.pure !== true ||
      view.predecessorNode === undefined ||
      !deepEqual(view.predecessorNode.config, view.config)
    ) {
      if (view.body !== undefined) {
        WorkingTree.withContext(view, view.body)

        if (
          view.predecessorNode !== undefined &&
          view.predecessorNode._nextActionId !== view._nextActionId
        ) {
          throw new Error(
            `Different number of action functions was executed in the view ${view.config.id} than in the previous build.`
          )
        }
      }
    } else {
      // TODO: this will break when the body function changes but the config stays the same, TBD whether this is a problem
      // if the config is the same, we can reuse the children from the predecessor
      view.setChildren(view.predecessorNode.children)

      // if there was an update requested on one of the descendants, we need to queue the update on that view
      // since pure component breaks rendering here
      const childUpdatePaths = this.currentUpdatePaths.findNodeAtPath(view.path)
      if (childUpdatePaths !== undefined) {
        const updatedChildren = childUpdatePaths
          .getPaths()
          .map((path) => view.getNodeFromPath(path))
          .filter((node) => node !== undefined)

        for (const child of updatedChildren) {
          this.queueUpdate(child!)
        }
      } else {
        // if the config stays the same and no children were updated directly, we can skip updating the view
        view.isRestored = true
      }
    }

    // we don't need to keep the reference to the predecessor after children are calculated
    view.predecessorNode = undefined

    const duration = performance.now() - startTime
    Tracing.traceBuild(config.id, startTime, duration)

    return view
  }

  public static createSuspenseBoundaryNode(
    config: BaseConfig,
    body?: () => void,
    fallback?: () => void
  ) {
    const startTime = performance.now()

    // remember may only be called inside view node
    const currentView = WorkingTree.current as ViewNode
    const node = new SuspenseBoundaryNode(config.id, config, body, fallback)

    node.parent = currentView

    // propagate predecessor during rebuild, so that remembered values can be restored in children and for
    // optimization purposes, so that we can skip updating the view if the config is the same and the view is pure
    node.predecessorNode = node.findPredecessorNode()
    node.tryRestore()
    currentView.addChild(node)

    if (node.body !== undefined) {
      WorkingTree.withContext(node, node.body)
    }

    // we don't need to keep the reference to the predecessor after children are calculated
    node.predecessorNode = undefined

    const duration = performance.now() - startTime
    Tracing.traceBuild(config.id, startTime, duration)

    return node
  }

  public static createSuspedNode<T>(fun: () => Promise<T>, dependencies: unknown[]) {
    const startTime = performance.now()

    // effect may only be called inside view node
    const currentView = WorkingTree.current as ViewNode
    const node = new SuspendNode(currentView._nextActionId++)

    node.parent = currentView
    currentView.addChild(node)

    node.initializeOrRestore(fun, dependencies)

    const duration = performance.now() - startTime
    Tracing.traceBuild('create suspend node', startTime, duration)

    return node
  }

  public static createDeferNode<T>(fun: () => Promise<T>, dependencies: unknown[]) {
    const startTime = performance.now()

    // effect may only be called inside view node
    const currentView = WorkingTree.current as ViewNode
    const node = new DeferNode(currentView._nextActionId++)

    node.parent = currentView
    currentView.addChild(node)

    node.initializeOrRestore(fun, dependencies)

    const duration = performance.now() - startTime
    Tracing.traceBuild('create defer node', startTime, duration)

    return node
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

    node.parent = currentView
    currentView.addChild(node)

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

    node.parent = currentView
    currentView.addChild(node)

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

    node.parent = currentView
    currentView.addChild(node)

    node.initializeOrRestore(effect, dependencies)

    const duration = performance.now() - startTime
    Tracing.traceBuild('create effect node', startTime, duration)

    return node
  }
}
