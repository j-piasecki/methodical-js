import { ViewNode, ViewNodeManager, WorkingTree, BaseConfig } from '../index'

export const remember = <T>(value: T) => {
  const rememberedNode = WorkingTree.createRememberNode(value)
  return rememberedNode.value
}

export const sideEffect = (effect: () => void, ...dependencies: unknown[]) => {
  return WorkingTree.createEffectNode(effect, dependencies)
}

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

export const createViewFunction = (viewManager: ViewNodeManager) => {
  return (config: BaseConfig, body?: () => void) => {
    const view = WorkingTree.createViewNode(config, viewManager, body)
    return view
  }
}
