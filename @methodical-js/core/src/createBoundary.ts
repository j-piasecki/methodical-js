import { BaseConfig } from './BaseConfig.js'
import { WorkingTree } from './WorkingTree.js'
import { ViewNodeManager } from './ViewNodeManager.js'
import { ViewNode } from './ViewNode.js'

type BoundaryFunction = <C extends BaseConfig>(config: C, ...args: unknown[]) => void

const viewManager: ViewNodeManager = {
  createView(node) {
    // this node doesn't render a view, pass down the optimization flags
    if (node.parent !== undefined) {
      node.__opt = (node.parent as ViewNode).__opt
    }
  },

  dropView(_node) {
    // noop
  },

  updateView(_oldNode, _newNode) {
    // noop
  },
}

export function createBoundary<C extends BaseConfig>(target: BoundaryFunction) {
  return function (config: C, ...args: unknown[]) {
    const body = () => {
      target(config, ...args)
    }

    return WorkingTree.createViewNode(config, viewManager, body)
  }
}
