import { NodeType } from "./NodeType.js";
import { ViewNode } from "./ViewNode.js";
import { WorkingNode } from "./WorkingNode.js";

export class RootNode extends ViewNode {
  constructor() {
    super('#');
    this.type = NodeType.Root;
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