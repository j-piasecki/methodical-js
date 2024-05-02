import { ViewNode, WorkingNode, BaseConfig, WorkingTree } from '@methodical-js/core'
import { createRenderOnlyViewManager } from './createRenderOnlyViewManager.js'
import { hasPosition, isViewNode, renderChildren } from './utils.js'

const YSortViewManager = createRenderOnlyViewManager(
  (node: ViewNode, ctx: CanvasRenderingContext2D) => {
    const children = node.children as WorkingNode[]
    children.sort((a, b) => {
      // TODO: zIndex
      if (isViewNode(a) && isViewNode(b) && hasPosition(a.config) && hasPosition(b.config)) {
        return a.config.position.y - b.config.position.y
      }

      return 0
    })

    renderChildren(node, ctx)
  }
)

export const YSort = (config: BaseConfig, body?: () => void) => {
  const view = WorkingTree.createViewNode(config, YSortViewManager, body)
  return view
}
