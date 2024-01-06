import { NodeType } from './NodeType.js'
import { ViewNode } from './ViewNode.js'
import { WorkingNode } from './WorkingNode.js'

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

    let areDependenciesEqual = true
    // check if dependencies are equal
    if (this.dependencies.length !== previous.dependencies.length) {
      areDependenciesEqual = false
    } else {
      for (let i = 0; i < this.dependencies.length; i++) {
        if (this.dependencies[i] !== previous.dependencies[i]) {
          areDependenciesEqual = false
          break
        }
      }
    }

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
    // effects may only be called inside view node
    const currentView = this.parent as ViewNode

    if (currentView.previousContext !== undefined) {
      // try finding the path up to the previous context
      let predecessor: WorkingNode | undefined = currentView
      const path: (string | number)[] = [this.id]

      while (predecessor !== undefined && predecessor.id !== currentView.previousContext!.id) {
        path.unshift(predecessor.id)
        predecessor = predecessor.parent
      }

      // if predecessor is undefined, it means that the previous context is not a parent of the current view
      // otherwise, we can try to restore the effect from the previous context, assuming the node at that path existed
      const previousEffectNode =
        predecessor === undefined
          ? undefined
          : (currentView.previousContext!.getNodeFromPath(path) as EffectNode | undefined)

      if (previousEffectNode !== undefined) {
        this.restore(previousEffectNode, effect, dependencies ?? [])
      } else {
        this.initialize(effect, dependencies ?? [])
      }
    } else {
      this.initialize(effect, dependencies ?? [])
    }
  }
}
