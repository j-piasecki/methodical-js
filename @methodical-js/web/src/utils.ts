import { ViewNode } from '@methodical-js/core'

export function findParentView(node: ViewNode): HTMLElement | undefined {
  let parent = node.parent as ViewNode | undefined

  while (parent !== undefined) {
    if (parent.viewReference !== undefined) {
      return parent.viewReference as HTMLElement
    }

    parent = parent.parent as ViewNode | undefined
  }

  return undefined
}
