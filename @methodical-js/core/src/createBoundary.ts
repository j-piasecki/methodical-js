import { BaseConfig } from './BaseConfig.js'
import { WorkingTree } from './WorkingTree.js'
import { ViewNodeManager } from './ViewNodeManager.js'

type BoundaryFunction = <C extends BaseConfig>(config: C, ...args: unknown[]) => void

const viewManager: ViewNodeManager = {
  createView(_node) {
    // noop
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
