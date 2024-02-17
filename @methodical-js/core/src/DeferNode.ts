import { NodeType } from './NodeType.js'
import { SuspendFunction } from './SuspendNode.js'
import { SuspenseBoundaryNode } from './SuspenseBoundaryNode.js'
import { WorkingNode } from './WorkingNode.js'
import { WorkingTree } from './WorkingTree.js'
import { compareDependencies } from './utils.js'

export class DeferNode<T> extends WorkingNode {
  private fun: SuspendFunction<T>
  private dependencies: unknown[]
  private hasInitialValue = false

  public value: T

  constructor(id: string | number) {
    super(id, NodeType.Defer)
  }

  public get suspensionPath() {
    const path = [this.id]

    let parent = this.parent
    while (parent !== undefined && parent instanceof SuspenseBoundaryNode === false) {
      path.unshift(parent.id)
      parent = parent.parent
    }

    return path.join('/')
  }

  private initialize(fun: SuspendFunction<T>, dependencies: unknown[]) {
    this.fun = fun
    this.dependencies = dependencies
    this.suspend()
  }

  private restore(previous: DeferNode<T>, fun: SuspendFunction<T>, dependencies: unknown[]) {
    this.dependencies = dependencies
    const areDependenciesEqual = compareDependencies(previous.dependencies, dependencies)

    this.hasInitialValue = previous.hasInitialValue
    // if dependencies are equal, we can reuse suspend function and restore value
    if (areDependenciesEqual) {
      this.fun = previous.fun
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

  private suspend() {
    const promise = this.fun()
    // @ts-ignore we need to attach the path to the promise to be able to unsuspend the rendering
    promise._methodical_path = this.suspensionPath
    // @ts-ignore same with dependencies
    promise._methodical_dependencies = this.dependencies
    // @ts-ignore mark this promise as blocking
    promise._methodical_blockRender = true
    throw promise
  }

  private tryUnsuspend() {
    let parent = this.parent

    while (parent !== undefined) {
      if (parent instanceof SuspenseBoundaryNode) {
        if (parent.hasData(this.suspensionPath)) {
          const data = parent.getData(this.suspensionPath, false)
          this.value = data.value as T
          this.dependencies = data.dependencies
          this.hasInitialValue = true
          return true
        }
      }

      parent = parent.parent
    }

    return false
  }

  public initializeOrRestore(fun: SuspendFunction<T>, dependencies?: unknown[]) {
    const previousSuspendNode = this.findPredecessorNode()

    if (previousSuspendNode !== undefined) {
      this.restore(previousSuspendNode, fun, dependencies ?? [])
      return
    }

    if (this.tryUnsuspend()) {
      return
    }

    this.initialize(fun, dependencies ?? [])
  }
}
