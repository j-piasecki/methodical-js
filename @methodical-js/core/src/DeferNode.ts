import { NodeType } from './NodeType.js'
import { SuspendFunction, SuspendNode } from './SuspendNode.js'
import { SuspenseBoundaryNode } from './SuspenseBoundaryNode.js'
import { WorkingTree } from './WorkingTree.js'
import { compareDependencies } from './utils.js'

export class DeferNode<T> extends SuspendNode<T> {
  private hasInitialValue = false

  constructor(id: string | number) {
    super(id)
    this.type = NodeType.Defer
  }

  protected restore(previous: SuspendNode<T>, fun: SuspendFunction<T>, dependencies: unknown[]) {
    const previousDeferNode = previous as unknown as DeferNode<T>

    this.dependencies = dependencies
    const areDependenciesEqual = compareDependencies(previousDeferNode.dependencies, dependencies)

    this.hasInitialValue = previousDeferNode.hasInitialValue
    // if dependencies are equal, we can reuse suspend function and restore value
    if (areDependenciesEqual) {
      this.fun = previousDeferNode.fun
      this.value = previous.value
    } else {
      // otherwise, we need to run the new function and defer loading the new value
      this.fun = fun
      // in the meantime we use the previous value to avoid suspending
      this.value = previous.value

      if (this.hasInitialValue) {
        this.defer()
      } else {
        this.suspend()
      }
    }
  }

  private defer() {
    this.fun().then((value) => {
      let parent = this.parent

      while (parent !== undefined) {
        if (parent instanceof SuspenseBoundaryNode) {
          parent.putData(this.suspensionPath, { value, dependencies: this.dependencies })
          break
        }

        parent = parent.parent
      }

      this.value = value
      WorkingTree.queueUpdate(this.parent!)
    })
  }

  protected tryUnsuspend(): boolean {
    const success = super.tryUnsuspend()

    if (success) {
      // if we are able to unsuspend, this means we have either the current or the previous value
      this.hasInitialValue = true
    }

    return success
  }
}
