import { BaseConfig } from './BaseConfig.js'
import { NodeType } from './NodeType.js'
import { ViewNodeManager } from './ViewNodeManager.js'
import { WorkingNode } from './WorkingNode.js'
import { isViewNode } from './utils.js'

export class ViewNode extends WorkingNode {
  private _children: WorkingNode[]
  private _childrenMap: Map<string | number, WorkingNode>

  public body?: () => void
  public config: BaseConfig
  public viewManager?: ViewNodeManager
  public viewReference?: unknown

  public _nextActionId = 0

  public predecessorNode?: ViewNode
  public isRestored = false

  public get children(): ReadonlyArray<WorkingNode> {
    return this._children
  }

  // flags used to optimize rendering, should only be read by view managers
  public __opt = {
    created: false, // node was created in this render
    updated: false, // node was updated in this render
  }

  constructor(id: string | number, config: BaseConfig, body?: () => void) {
    super(id, NodeType.View)
    this._children = []
    this._childrenMap = new Map()
    this.body = body
    this.config = config
  }

  public getNodeFromPath(path: (string | number)[]): WorkingNode | undefined {
    let current: WorkingNode = this
    let index = 0
    if (path[index] === current.id) {
      index++ // skip root
    }

    while (index < path.length) {
      if (!isViewNode(current)) {
        return undefined
      }

      const id = path[index++]
      const next = current._childrenMap.get(id)

      if (next === undefined) {
        return undefined
      }

      current = next
    }

    return current
  }

  public addChild(node: WorkingNode) {
    this._children.push(node)
    this._childrenMap.set(node.id, node)

    node.parent = this
  }

  public setChildren(children: ReadonlyArray<WorkingNode>) {
    this._children = []
    this._childrenMap = new Map()

    for (const child of children) {
      this.addChild(child)
    }
  }
}
