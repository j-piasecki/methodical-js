import { BaseConfig } from './BaseConfig.js'
import { EffectNode, EffectType } from './EffectNode.js'
import { PrefixTree } from './PrefixTree.js'
import { RebuildingNode } from './RebuildingNode.js'
import { RememberNode } from './RememberNode.js'
import { Renderer } from './Renderer.js'
import { RootNode } from './RootNode.js'
import { ViewNode } from './ViewNode.js'
import { ViewNodeManager } from './ViewNodeManager.js'
import { WorkingNode } from './WorkingNode.js'

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
    const pathsToUpdate = this.updatePaths.getPaths()
    this.updatePaths.clear()
    this.updateQueued = false

    for (const path of pathsToUpdate) {
      const nodeToUpdate = WorkingTree.root.getNodeFromPath(path) as ViewNode

      if (nodeToUpdate !== null) {
        const rebuildContext = new RebuildingNode(nodeToUpdate)
        // set previous context to the node that is being rebuilt so that remembered values can be restored
        rebuildContext.previousContext = nodeToUpdate

        WorkingTree.withContext(rebuildContext, nodeToUpdate.body!)

        this.renderer.diffSubtrees(nodeToUpdate, rebuildContext)

        // move children from the rebuilding node to the node that is being rebuilt
        // we also need to reassign the parent of the direct children so it points
        // to the node that is being rebuilt
        nodeToUpdate.children = rebuildContext.children
        for (const child of nodeToUpdate.children) {
          child.parent = nodeToUpdate
        }
      }
    }
  }

  public static performInitialRender() {
    // should be called only once, after the initial tree is built
    // we diff the root node with an empty root node to render the initial tree
    this.renderer.diffSubtrees(new RootNode(), WorkingTree.root)
  }

  public static createViewNode(config: BaseConfig, ViewNodeManager: ViewNodeManager, body?: () => void) {
    // remember may only be called inside view node
    const currentView = WorkingTree.current as ViewNode
    const view = new ViewNode(config.id, config, body)
    view.viewManager = ViewNodeManager

    // TODO: this may break during rebuild, the parent may be dropped from the current tree, not sure though
    view.parent = currentView

    // propagate previous context during rebuild, so that remembered values can be restored in children
    view.previousContext = currentView.previousContext
    currentView.children.push(view)

    if (body !== undefined) {
      WorkingTree.withContext(view, body)
    }

    return view
  }

  public static createRememberNode(initialValue: unknown) {
    // remember may only be called inside view node
    const currentView = WorkingTree.current as ViewNode
    const node = new RememberNode(currentView._nextActionId++)

    // TODO: this may break during rebuild, the parent may be dropped from the current tree, not sure though
    node.parent = currentView
    currentView.children.push(node)

    node.initializeOrRestore(initialValue)

    return node
  }

  public static createEffectNode(effect: EffectType, dependencies: unknown[]) {
    // effect may only be called inside view node
    const currentView = WorkingTree.current as ViewNode
    const node = new EffectNode(currentView._nextActionId++)

    // TODO: this may break during rebuild, the parent may be dropped from the current tree, not sure though
    node.parent = currentView
    currentView.children.push(node)

    node.initializeOrRestore(effect, dependencies)

    return node
  }
}