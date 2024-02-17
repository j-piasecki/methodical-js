import { EventNodeManager } from './EventNodeManager.js'
import { WorkingTree } from './WorkingTree.js'

export { WorkingTree } from './WorkingTree.js'
export { BaseConfig } from './BaseConfig.js'
export { WorkingNode } from './WorkingNode.js'
export { ViewNode } from './ViewNode.js'
export { RememberNode } from './RememberNode.js'
export { EffectNode } from './EffectNode.js'
export { EventNode } from './EventNode.js'
export { EventNodeManager } from './EventNodeManager.js'
export { ViewNodeManager } from './ViewNodeManager.js'
export { Tracing } from './Tracing.js'

export { createBoundary } from './createBoundary.js'

export const remember = <T>(value: T) => {
  const rememberedNode = WorkingTree.createRememberNode(value)
  return rememberedNode.value
}

export const sideEffect = (effect: () => void, ...dependencies: unknown[]) => {
  return WorkingTree.createEffectNode(effect, dependencies)
}

export const eventHandler = <T, U>(
  name: string,
  handler: (event: T) => void,
  eventManager: EventNodeManager<U>,
  ...dependencies: unknown[]
) => {
  return WorkingTree.createEventNode(name, handler, eventManager, dependencies)
}
