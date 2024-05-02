import {
  WorkingTree,
  BaseConfig,
  createAmbient,
  createBoundary,
  remember,
  readAmbient,
} from '@methodical-js/core'
import { WithPosition } from './types.js'
import { renderChildren } from './utils.js'
import { createRenderOnlyViewManager } from './createRenderOnlyViewManager.js'

interface NodeAmbientValue {
  position: {
    x: number
    y: number
  }
  velocity: {
    x: number
    y: number
  }
}

const NodeAmbient = createAmbient<NodeAmbientValue>('%node')

interface NodeConfig extends BaseConfig, WithPosition {}

const viewManager = createRenderOnlyViewManager((node, ctx) => {
  renderChildren(node, ctx)
})

const NodeBoundary = createBoundary((_config: BaseConfig, body: () => void) => body())

export function rememberNodePosition() {
  const ambient = readAmbient(NodeAmbient)
  return ambient.position
}

export function rememberNodeVelocity() {
  const ambient = readAmbient(NodeAmbient)
  return ambient.velocity
}

export const Node = (config: NodeConfig, body?: () => void) => {
  NodeBoundary(
    {
      id: `$node-${config.id}`,
    },
    () => {
      const positionX = remember(config.position.x)
      const positionY = remember(config.position.y)

      const velocityX = remember(0)
      const velocityY = remember(0)

      NodeAmbient(
        {
          id: `$ambient-${config.id}`,
          value: {
            position: {
              get x() {
                return positionX.value
              },
              set x(value) {
                positionX.value = value
              },
              get y() {
                return positionY.value
              },
              set y(value) {
                positionY.value = value
              },
            },
            velocity: {
              get x() {
                return velocityX.value
              },
              set x(value) {
                velocityX.value = value
              },
              get y() {
                return velocityY.value
              },
              set y(value) {
                velocityY.value = value
              },
            },
          },
        },
        () => {
          WorkingTree.createViewNode(config, viewManager, body)
        }
      )
    }
  )
}
