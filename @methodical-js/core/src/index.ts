import { BaseConfig } from './BaseConfig.js'
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

export const suspend = <T>(fun: () => Promise<T>, ...dependencies: unknown[]) => {
  return WorkingTree.createSuspedNode(fun, dependencies).value
}

export const defer = <T>(fun: () => Promise<T>, ...dependencies: unknown[]) => {
  return WorkingTree.createDeferNode(fun, dependencies).value
}

export const SuspenseBoundary = (config: BaseConfig, body?: () => void, fallback?: () => void) => {
  return WorkingTree.createSuspenseBoundaryNode(config, body, fallback)
}
