import { NodeType } from './NodeType.js'
import type { ViewNode } from './ViewNode.js'

export class WorkingNode {
  public id: string | number
  public type: NodeType
  public parent?: WorkingNode

  constructor(id: string | number, type: NodeType, parent?: WorkingNode) {
    this.id = id
    this.type = type
    this.parent = parent
  }

  public get path() {
    const path = [this.id]

    let parent = this.parent
    while (parent !== undefined) {
      path.unshift(parent.id)
      parent = parent.parent
    }

    return path
  }

  public findPredecessorNode(): typeof this | undefined {
    // only view nodes can have children
    const currentView = this.parent as ViewNode

    if (currentView.predecessorNode !== undefined) {
      // try finding the path up to the previous context
      let predecessor: WorkingNode | undefined = currentView
      const path: (string | number)[] = [this.id]

      while (predecessor !== undefined && predecessor.id !== currentView.predecessorNode!.id) {
        path.unshift(predecessor.id)
        predecessor = predecessor.parent
      }

      // if predecessor is undefined, it means that the previous context is not a parent of the current view
      // otherwise, assuming the node at the found path existed, we have found the corresponding node in the previous context
      const previousNode =
        predecessor === undefined
          ? undefined
          : (currentView.predecessorNode!.getNodeFromPath(path) as typeof this | undefined)

      return previousNode
    }

    return undefined
  }

  public toString() {
    return JSON.stringify(
      this,
      (k, v) => {
        if (k === 'parent' || k === '_context') {
          return v?.type === NodeType.Rebuilding ? `Rebuilding(${v?.id})` : v?.id
        } else if (k === 'predecessorNode') {
          if (v === undefined) {
            return false
          } else {
            return `true, ${v.id}`
          }
        }

        return v
      },
      2
    )
  }
}
