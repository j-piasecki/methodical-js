import { BaseConfig } from './BaseConfig.js'
import { ViewNode } from './ViewNode.js'
import { ViewNodeManager } from './ViewNodeManager.js'
import { WorkingTree } from './WorkingTree.js'
import { remember, sideEffect } from './effects.js'
import { deepEqual } from './utils.js'

export interface AmbientConfig<T> extends BaseConfig {
  value: T

  /** @internal */
  __ambient?: true

  /** @internal */
  __key?: string
}

function isAmbientNode<T>(node: ViewNode): node is AmbientNode<T> {
  // @ts-expect-error
  return node.config.__ambient
}

export interface AmbientNode<T> extends ViewNode {
  config: AmbientConfig<T>
  subscribers: ((value: T) => void)[]
  subscribe: (callback: (value: T) => void) => () => void
}

const AmbientViewManager: ViewNodeManager = {
  createView(_node: AmbientNode<unknown>) {
    // noop
  },
  updateView(_oldNode: AmbientNode<unknown>, _newNode: AmbientNode<unknown>) {
    // noop
  },
  dropView(_node: AmbientNode<unknown>) {
    // noop
  },
}

export interface Ambient<T> {
  key: string
  (config: AmbientConfig<T>, body: () => void): ViewNode
}

function AmbientFunction<T>(config: AmbientConfig<T>, body: () => void) {
  config.__ambient = true

  // we do this during the tree calculation to make sure that reading in the
  // same render cycle is possible
  const extendedBody = () => {
    const currentNode = WorkingTree.current as ViewNode
    if (isAmbientNode<T>(currentNode)) {
      if (currentNode.predecessorNode === undefined) {
        currentNode.subscribers = []
        currentNode.subscribe = (callback: (value: T) => void) => {
          currentNode.subscribers.push(callback)
          return () => {
            const index = currentNode.subscribers.indexOf(callback)
            if (index !== -1) {
              currentNode.subscribers.splice(index, 1)
            }
          }
        }
      } else {
        const oldNode = currentNode.predecessorNode as AmbientNode<T>
        currentNode.subscribers = oldNode.subscribers
        currentNode.subscribe = oldNode.subscribe

        if (!deepEqual(oldNode.config.value, config.value)) {
          for (const subscriber of currentNode.subscribers) {
            subscriber(config.value)
          }
        }
      }
    }

    body()
  }

  const node = WorkingTree.createViewNode(
    config,
    AmbientViewManager,
    extendedBody
  ) as AmbientNode<T>

  return node
}

export function createAmbient<T>(key: string): Ambient<T> {
  const ambientFn: Ambient<T> = (config: AmbientConfig<T>, body: () => void) => {
    config.__key = key
    return AmbientFunction(config, body)
  }

  ambientFn.key = key

  return ambientFn
}

export function readAmbient<T>(ambient: Ambient<T>) {
  const remembered = remember<T>(undefined as T)

  sideEffect(() => {
    let node: ViewNode | undefined = WorkingTree.current as ViewNode

    while (node !== undefined) {
      if (isAmbientNode<T>(node) && node.config.__key === ambient.key) {
        // @ts-expect-error we don't want to trigger an update when assigning initial value
        remembered._value = node.config.value

        return node.subscribe((value) => {
          remembered.value = value
        })
      }

      node = node.parent as ViewNode
    }
  })

  return remembered.value
}
