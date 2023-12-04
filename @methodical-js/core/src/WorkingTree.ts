import { PrefixTree } from './PrefixTree.js'
import { RebuildingNode } from './RebuildingNode.js'
import { RememberNode } from './RememberNode.js'
import { RootNode } from './RootNode.js'
import { ViewNode } from './ViewNode.js'
import { WorkingNode } from './WorkingNode.js'

export class WorkingTree {
  private static _root: RootNode = new RootNode()
  private static _current: WorkingNode = WorkingTree._root

  private static updatePaths = new PrefixTree()
  private static updateQueued = false

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

        nodeToUpdate.children = rebuildContext.children
      }
    }
  }

  public static createViewNode(id: string | number, body?: () => void) {
    // remember may only be called inside view node
    const currentView = WorkingTree.current as ViewNode
    const view = new ViewNode(id, body)

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

    if (currentView.previousContext !== undefined) {
      // try finding the path up to the previous context
      let predecessor: WorkingNode | undefined = currentView
      const path: (string | number)[] = [node.id]

      while (predecessor !== undefined && predecessor.id !== currentView.previousContext!.id) {
        path.unshift(predecessor.id)
        predecessor = predecessor.parent
      }

      // if predecessor is undefined, it means that the previous context is not a parent of the current view
      // otherwise, we can try to restore the value from the previous context, assuming the node at that path existed
      const previousRememberedNode =
        predecessor === undefined
          ? undefined
          : (currentView.previousContext!.getNodeFromPath(path) as RememberNode | undefined)

      if (previousRememberedNode !== undefined) {
        node.restoreValue(previousRememberedNode)
      } else {
        node.initializeValue(initialValue)
      }
    } else {
      node.initializeValue(initialValue)
    }

    // TODO: this may break during rebuild, the parent may be dropped from the current tree, not sure though
    node.parent = currentView
    currentView.children.push(node)

    return node
  }
}
