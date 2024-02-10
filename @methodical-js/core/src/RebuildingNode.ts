import { NodeType } from './NodeType.js'
import { ViewNode } from './ViewNode.js'

export class RebuildingNode extends ViewNode {
  constructor(node: ViewNode) {
    super(node.id, node.config)

    // copy the view reference from the node being rebuilt so the event handlers can be attached to the same view
    this.viewReference = node.viewReference
    this.type = NodeType.Rebuilding
  }
}
