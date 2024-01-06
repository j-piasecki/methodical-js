import type { ViewNode } from './ViewNode'

export interface ViewNodeManager {
  createView(node: ViewNode): void
  dropView(node: ViewNode): void
  updateView(oldNode: ViewNode, newNode: ViewNode): void
}
