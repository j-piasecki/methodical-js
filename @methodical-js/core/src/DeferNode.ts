import { NodeType } from './NodeType.js'
import { SuspendFunction, SuspendNode } from './SuspendNode.js'
import { WorkingTree } from './WorkingTree.js'
import { compareDependencies } from './utils.js'

export class DeferNode<T> extends SuspendNode<T> {
  constructor(id: string | number) {
    super(id)
    this.type = NodeType.Defer
  }

  private defer() {
    const path = this.suspensionPath
    const boundary = this.findBoundary()

    if (boundary === undefined) {
      return
    }

    // update dependencies immediately to prevent another defer call in case of update
    boundary.putData(path, {
      value: boundary.getData(path)?.value ?? this.value,
      dependencies: this.dependencies,
    })

    this.fun().then((value) => {
      // avoid changing the dependencies to prevent restoring the old value
      boundary.putData(path, {
        value,
        dependencies: boundary.getData(path)?.dependencies ?? this.dependencies,
      })
      this.value = value
      WorkingTree.queueUpdate(this.parent!)
    })
  }

  private tryRestoreFromBoundary(fun: SuspendFunction<T>, dependencies: unknown[]) {
    const boundary = this.findBoundary()
    const restored = boundary?.getData(this.suspensionPath)

    if (restored !== undefined) {
      this.fun = fun
      this.value = restored.value as T
      this.dependencies = dependencies

      const areDependenciesEqual = compareDependencies(restored.dependencies, dependencies ?? [])
      if (!areDependenciesEqual) {
        this.defer()
      }

      return true
    }

    return false
  }

  public initializeOrRestore(fun: SuspendFunction<T>, dependencies?: unknown[]) {
    if (this.tryRestoreFromBoundary(fun, dependencies ?? [])) {
      return
    }

    if (this.tryUnsuspend()) {
      return
    }

    this.initialize(fun, dependencies ?? [])
  }
}
