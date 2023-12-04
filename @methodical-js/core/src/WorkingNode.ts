import { NodeType } from './NodeType.js'

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

  public toString() {
    return JSON.stringify(
      this,
      (k, v) => {
        if (k === 'parent' || k === '_context') {
          return v?.id
        } else if (k === 'previousContext') {
          return v !== undefined
        }

        return v
      },
      2
    )
  }
}
