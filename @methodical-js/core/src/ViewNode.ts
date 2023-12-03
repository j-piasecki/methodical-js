import { NodeType } from "./NodeType.js"
import { WorkingNode } from "./WorkingNode.js"

export class ViewNode extends WorkingNode {
  public children: WorkingNode[]
  public body?: () => void

  public _nextActionId = 0

  constructor(id: string | number, body?: () => void) {
    super(id, NodeType.View)
    this.children = []
    this.body = body
  }
}