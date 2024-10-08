import { NodeType } from './NodeType.js'
import { SuspenseBoundaryNode } from './SuspenseBoundaryNode.js'
import { WorkingNode } from './WorkingNode.js'
import { compareDependencies } from './utils.js'

export type SuspendFunction<T> = () => Promise<T>

export class SuspendNode<T> extends WorkingNode {
  protected fun: SuspendFunction<T>
  protected dependencies: unknown[]

  public value: T

  constructor(id: string | number) {
    super(id, NodeType.Suspend)
  }

  public get suspensionPath() {
    const path = [this.id]

    let parent = this.parent
    while (parent !== undefined && parent instanceof SuspenseBoundaryNode === false) {
      path.push(parent.id)
      parent = parent.parent
    }

    return path.reverse().join('/')
  }

  protected initialize(fun: SuspendFunction<T>, dependencies: unknown[]) {
    this.fun = fun
    this.dependencies = dependencies
    this.suspend()
  }

  protected restore(previous: SuspendNode<T>, fun: SuspendFunction<T>, dependencies: unknown[]) {
    this.dependencies = dependencies
    const areDependenciesEqual = compareDependencies(previous.dependencies, dependencies)

    // if dependencies are equal, we can reuse suspend function and restore value
    if (areDependenciesEqual) {
      this.fun = previous.fun
      this.value = previous.value
    } else {
      // otherwise, we need to run the new function and suspend rendering this branch
      this.fun = fun
      this.suspend()
    }
  }

  protected suspend() {
    const promise = this.fun()
    // @ts-ignore we need to attach the path to the promise to be able to unsuspend the rendering
    promise._methodical_path = this.suspensionPath
    // @ts-ignore same with dependencies
    promise._methodical_dependencies = this.dependencies
    throw promise
  }

  protected tryUnsuspend() {
    const boundary = this.findBoundary()

    if (boundary !== undefined) {
      const data = boundary.getData(this.suspensionPath)

      if (data !== undefined) {
        this.value = data.value as T
        this.dependencies = data.dependencies
        return true
      }
    }

    return false
  }

  protected findBoundary() {
    let parent = this.parent

    while (parent !== undefined) {
      if (parent instanceof SuspenseBoundaryNode) {
        return parent
      }

      parent = parent.parent
    }

    return undefined
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
