import { ViewNode, ViewNodeManager, WorkingTree, BaseConfig } from '../index'

export const createViewManager = ({
  createView,
  dropView,
  updateView,
}: {
  createView?: (node?: ViewNode) => void
  dropView?: (node?: ViewNode) => void
  updateView?: (oldNode?: ViewNode, newNode?: ViewNode) => void
}): ViewNodeManager => {
  return {
    createView: createView ?? (() => {}),
    dropView: dropView ?? (() => {}),
    updateView: updateView ?? (() => {}),
  }
}

interface ViewConfig extends BaseConfig {
  mockProp?: number
}

export const createViewFunction = (viewManager: ViewNodeManager) => {
  return (config: ViewConfig, body?: () => void) => {
    const view = WorkingTree.createViewNode(config, viewManager, body)
    return view
  }
}
