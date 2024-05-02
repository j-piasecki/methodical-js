import {
  WorkingTree,
  BaseConfig,
  createAmbient,
  createBoundary,
  remember,
  readAmbient,
  sideEffect,
} from '@methodical-js/core'
import { renderChildren } from './utils.js'
import { createRenderOnlyViewManager } from './createRenderOnlyViewManager.js'
import { Body as PhysicsBody } from './physics/body.js'
import Physics from './physics/index.js'
import { rememberNodePosition, rememberNodeVelocity } from './Node.js'

interface BodyAmbientValue {
  body: PhysicsBody
}

const BodyAmbient = createAmbient<BodyAmbientValue>('%body')

interface BodyConfig extends BaseConfig {
  isStatic?: boolean
}

const viewManager = createRenderOnlyViewManager((node, ctx) => {
  renderChildren(node, ctx)
})

const BodyBoundary = createBoundary((_config: BaseConfig, body: () => void) => body())

export const rememberBody = () => {
  const ambient = readAmbient(BodyAmbient)
  return ambient.body
}

export const Body = (config: BodyConfig, body?: () => void) => {
  BodyBoundary(
    {
      id: `$body-${config.id}`,
    },
    () => {
      const position = rememberNodePosition()
      const velocity = rememberNodeVelocity()

      const physicsBody = remember(new PhysicsBody(position, velocity, config.isStatic))

      sideEffect(() => {
        Physics.addBody(physicsBody.value)
        return () => {
          Physics.removeBody(physicsBody.value)
        }
      })

      sideEffect(
        () => {
          physicsBody.value.position = position
          physicsBody.value.velocity = velocity
          physicsBody.value.isStatic = config.isStatic || false
        },
        velocity.x,
        velocity.y,
        position.x,
        position.y,
        config.isStatic
      )

      BodyAmbient(
        {
          id: `$ambient-${config.id}`,
          value: {
            body: physicsBody.value,
          },
        },
        () => {
          WorkingTree.createViewNode(config, viewManager, body)
        }
      )
    }
  )
}
