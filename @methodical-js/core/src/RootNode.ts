import { NodeType } from './NodeType.js'
import { ViewNode } from './ViewNode.js'

export class RootNode extends ViewNode {
  constructor() {
    super('#', {id: '#'})
    this.type = NodeType.Root
  }
}
