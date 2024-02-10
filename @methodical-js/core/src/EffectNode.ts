import { NodeType } from './NodeType.js'
import { WorkingNode } from './WorkingNode.js'
import { compareDependencies } from './utils.js'

export type EffectType = () => void | (() => () => void)

export class EffectNode extends WorkingNode {
  private effect: EffectType
  private cleanup?: () => void
  private dependencies: unknown[]

  constructor(id: string | number) {
    super(id, NodeType.Effect)
  }

  private initialize(effect: EffectType, dependencies: unknown[]) {
    this.effect = effect
    this.cleanup = effect()!
    this.dependencies = dependencies
  }

  private restore(previous: EffectNode, effect: EffectType, dependencies: unknown[]) {
    this.dependencies = dependencies
    const areDependenciesEqual = compareDependencies(previous.dependencies, dependencies)

    // if dependencies are equal, we can reuse the effect and cleanup
    if (areDependenciesEqual) {
      this.effect = previous.effect
      this.cleanup = previous.cleanup
    } else {
      // otherwise, we need to cleanup the previous effect and initialize a new one
      previous.cleanup?.()
      this.effect = effect
      this.cleanup = effect()!
    }
  }

  public initializeOrRestore(effect: EffectType, dependencies?: unknown[]) {
    const previousEffectNode = this.findPredecessorNode()

    if (previousEffectNode !== undefined) {
      this.restore(previousEffectNode, effect, dependencies ?? [])
    } else {
      this.initialize(effect, dependencies ?? [])
    }
  }
}
