import { BaseConfig, ViewNode, WorkingTree } from '@methodical-js/core'
import { createRenderOnlyViewManager } from './createRenderOnlyViewManager.js'
import { renderChildren } from './utils.js'
import { WithPosition, WithSize } from './types.js'

interface RectConfig extends BaseConfig, WithPosition, WithSize {
  color: string
}

const RectViewManager = createRenderOnlyViewManager(
  (node: ViewNode, ctx: CanvasRenderingContext2D) => {
    const config = node.config as RectConfig

    ctx.save()
    ctx.translate(config.position.x, config.position.y)

    ctx.fillStyle = config.color
    ctx.fillRect(0, 0, config.size.width, config.size.height)

    renderChildren(node, ctx)

    ctx.restore()
  }
)

export const Rect = (config: RectConfig, body?: () => void) => {
  const view = WorkingTree.createViewNode(config, RectViewManager, body)
  return view
}
