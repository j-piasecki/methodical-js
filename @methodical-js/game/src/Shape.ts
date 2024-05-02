import { WorkingTree, BaseConfig, createBoundary, sideEffect } from '@methodical-js/core'
import { renderChildren } from './utils.js'
import { createRenderOnlyViewManager } from './createRenderOnlyViewManager.js'
import { Shape as PhysicsShape } from './physics/shape.js'
import { rememberBody } from './Body.js'

interface ShapeConfig extends BaseConfig {
  position?: {
    x: number
    y: number
  }
  size: {
    x: number
    y: number
  }
}

const viewManager = createRenderOnlyViewManager((node, ctx) => {
  renderChildren(node, ctx)
})

const ShapeBoundary = createBoundary((_config: BaseConfig, body: () => void) => body())

export const Shape = (config: ShapeConfig, body?: () => void) => {
  ShapeBoundary(
    {
      id: `$shape-${config.id}`,
    },
    () => {
      const physicsBody = rememberBody()

      sideEffect(
        () => {
          physicsBody.setShape(new PhysicsShape(config.size, config.position))
        },
        config.size,
        config.position
      )

      WorkingTree.createViewNode(config, viewManager, body)
    }
  )
}
