import { NodeType } from './NodeType.js'
import { ViewNode } from './ViewNode.js'

export class RebuildingNode extends ViewNode {
  constructor(node: ViewNode) {
    super(node.id)

    this.type = NodeType.Rebuilding
  }
}
