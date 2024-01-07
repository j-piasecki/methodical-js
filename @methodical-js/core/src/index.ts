import { WorkingTree } from './WorkingTree.js'

export { WorkingTree } from './WorkingTree.js'
export { BaseConfig } from './BaseConfig.js'
export { WorkingNode } from './WorkingNode.js'
export { ViewNode } from './ViewNode.js'
export { RememberNode } from './RememberNode.js'
export { EffectNode } from './EffectNode.js'
export { ViewNodeManager } from './ViewNodeManager.js'

export const remember = <T>(value: T) => {
  const rememberedNode = WorkingTree.createRememberNode(value)
  return rememberedNode.value
}

export const sideEffect = (effect: () => void, ...dependencies: unknown[]) => {
  return WorkingTree.createEffectNode(effect, dependencies)
}
