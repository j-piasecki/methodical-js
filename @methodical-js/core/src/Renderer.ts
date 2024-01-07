import { NodeType } from './NodeType.js'
import { ViewNode } from './ViewNode.js'
import { WorkingNode } from './WorkingNode.js'

function isViewNode(node: WorkingNode): node is ViewNode {
  return node.type === NodeType.View
}

export class Renderer {
  public diffSubtrees(oldRoot: ViewNode, newRoot: ViewNode) {
    // keep index of the last node that was found in both trees, as nodes can only be added or removed
    // they will be in the same order in the both trees, so we can start looking from there
    let lastFoundIndex = 0
    for (let i = 0; i < newRoot.children.length; i++) {
      const newChild = newRoot.children[i]
      if (!isViewNode(newChild)) {
        continue
      }

      let found = false
      for (let j = lastFoundIndex; j < oldRoot.children.length; j++) {
        const previousChild = oldRoot.children[j]

        if (newChild.id === previousChild.id && isViewNode(previousChild)) {
          // if the node is being updated, we can drop all nodes between it and the last found node
          // as that means they are not present in the new tree
          for (let k = lastFoundIndex; k < j; k++) {
            const node = oldRoot.children[k]
            if (isViewNode(node)) {
              this.dropView(node)
            }
          }

          lastFoundIndex = j + 1
          found = true

          // if the node is restored, we don't need to update it as it's state is the same as in old tree
          if (!newChild.isRestored) {
            this.updateView(previousChild, newChild)
            this.diffSubtrees(previousChild, newChild)
          }
          break
        }
      }

      if (!found) {
        this.createView(newChild)
      }
    }

    // eventually drop the nodes from the end of the list that are not present in the new tree
    for (let k = lastFoundIndex; k < oldRoot.children.length; k++) {
      const node = oldRoot.children[k]
      if (isViewNode(node)) {
        this.dropView(node)
      }
    }
  }

  private createView(node: ViewNode) {
    node.viewManager?.createView(node)

    for (const child of node.children) {
      if (isViewNode(child)) {
        this.createView(child)
      }
    }
  }

  private dropView(node: ViewNode) {
    for (const child of node.children) {
      if (isViewNode(child)) {
        this.dropView(child)
      }
    }

    node.viewManager?.dropView(node)
  }

  private updateView(oldNode: ViewNode, node: ViewNode) {
    // view reference should be kept between updates, I think this is resposibility of the framework
    node.viewReference = oldNode.viewReference

    node.viewManager?.updateView(oldNode, node)
  }
}
