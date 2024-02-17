import { BaseConfig } from './BaseConfig.js'
import { ViewNode } from './ViewNode.js'
import { WorkingTree } from './WorkingTree.js'

interface Thenable {
  then: (
    onFulfilled: (value: unknown) => unknown,
    onRejected: (reason: unknown) => unknown
  ) => unknown
}

interface LoadedData {
  value: unknown
  dependencies: unknown[]
}

export class SuspenseBoundaryNode extends ViewNode {
  private bodyFun?: () => void
  private fallbackFun?: () => void

  private thenables: Record<string, Thenable> = {}
  private loadedData: Record<string, LoadedData> = {}

  constructor(id: string | number, config: BaseConfig, body?: () => void, fallback?: () => void) {
    super(id, config, undefined)

    const suspendableBody = () => {
      try {
        body?.()
      } catch (error) {
        if ('then' in error && '_methodical_path' in error && '_methodical_dependencies' in error) {
          const path = error['_methodical_path']
          const dependencies = error['_methodical_dependencies']
          this.thenables[path] = error

          this.children = []
          this.body = this.fallbackFun
          this.fallbackFun?.()

          error.then((data: unknown) => {
            this.loadedData[path] = { value: data, dependencies }
            delete this.thenables[path]
            this.body = this.bodyFun

            // we need to queue the update on the parent, so this node does not become RebuildingNode
            WorkingTree.queueUpdate(this.parent!)
          })
        } else {
          throw error
        }
      }
    }

    this.body = suspendableBody
    this.bodyFun = suspendableBody
    this.fallbackFun = fallback
  }

  public tryRestore() {
    if (this.predecessorNode !== undefined) {
      const node = this.predecessorNode as SuspenseBoundaryNode
      this.loadedData = node.loadedData
      this.thenables = node.thenables
    }

    if (Object.keys(this.thenables).length > 0) {
      this.body = this.fallbackFun
    } else {
      this.body = this.bodyFun
    }
  }

  public hasData(path: string) {
    return path in this.loadedData
  }

  public getAndRemoveData(path: string) {
    const data = this.loadedData[path]
    delete this.loadedData[path]
    return data
  }
}
