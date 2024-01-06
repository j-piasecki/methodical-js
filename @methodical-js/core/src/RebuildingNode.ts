import { NodeType } from './NodeType.js'
import { ViewNode } from './ViewNode.js'

export class RebuildingNode extends ViewNode {
  constructor(node: ViewNode) {
    super(node.id, node.config)

    this.type = NodeType.Rebuilding
  }
}
