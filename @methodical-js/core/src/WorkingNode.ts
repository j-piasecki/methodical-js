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
      path.push(parent.id)
      parent = parent.parent
    }

    return path.reverse()
  }

  public findPredecessorNode(): typeof this | undefined {
    // only view nodes can have children
    const currentView = this.parent as ViewNode

    if (currentView.predecessorNode !== undefined) {
      return currentView.predecessorNode.getNodeFromPath([this.id]) as typeof this | undefined
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
