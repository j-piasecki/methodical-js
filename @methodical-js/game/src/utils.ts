import { WorkingNode, ViewNode, NodeType, BaseConfig } from '@methodical-js/core'
import { WithPosition, WithSize } from './types'

export function isViewNode(node: WorkingNode): node is ViewNode {
  return (
    node.type === NodeType.View || node.type === NodeType.Rebuilding || node.type === NodeType.Root
  )
}

export function hasPosition(config: BaseConfig): config is BaseConfig & WithPosition {
  return 'position' in config
}

export function hasSize(config: BaseConfig): config is BaseConfig & WithSize {
  return 'size' in config
}

export function renderChildren(node: ViewNode, ctx: CanvasRenderingContext2D) {
  for (const child of node.children) {
    if (isViewNode(child) && child.viewManager) {
      if (child.viewManager.render) {
        child.viewManager.render(child, ctx)
      } else {
        for (const grandchild of child.children) {
          if (isViewNode(grandchild)) {
            renderChildren(grandchild, ctx)
          }
        }
      }
    }
  }
}
