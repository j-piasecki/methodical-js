import { BaseConfig } from './BaseConfig.js'
import { NodeType } from './NodeType.js'
import { ViewNodeManager } from './ViewNodeManager.js'
import { WorkingNode } from './WorkingNode.js'

export class ViewNode extends WorkingNode {
  public children: WorkingNode[]
  public body?: () => void
  public config: BaseConfig
  public viewManager?: ViewNodeManager
  public viewReference?: unknown

  public _nextActionId = 0

  public previousContext?: ViewNode

  constructor(id: string | number, config: BaseConfig, body?: () => void) {
    super(id, NodeType.View)
    this.children = []
    this.body = body
    this.config = config
  }

  public getNodeFromPath(path: (string | number)[]): WorkingNode | null {
    let current: WorkingNode = this
    let index = 0
    if (path[index] === current.id) {
      index++ // skip root
    }

    while (index < path.length) {
      const id = path[index++]

      // @ts-ignore children doesn't exist on remember and effect nodes, but those don't have children anyway
      const children = current.children ?? []
      let found = false

      for (const node of children) {
        if (node.id === id) {
          current = node
          found = true
          break
        }
      }

      if (!found) {
        return null
      }
    }

    return current
  }
}
