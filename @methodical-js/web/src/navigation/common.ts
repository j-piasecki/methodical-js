import { ViewNode, ViewNodeManager, WorkingTree, createBoundary } from '@methodical-js/core'
import { ViewConfig } from '../views/ViewConfig'

export interface NavigationConfig extends ViewConfig {
  __path: string
}

export interface NavigationNode extends ViewNode {
  locationChangeHandler?: () => void
}

export const NavigationViewManager: ViewNodeManager = {
  createView(node: NavigationNode) {
    // this node doesn't render a view, pass down the optimization flags
    if (node.parent !== undefined) {
      node.__opt = (node.parent as ViewNode).__opt
    }

    const locationChangeHandler = () => {
      WorkingTree.queueUpdate(node.parent!)
    }

    node.locationChangeHandler = locationChangeHandler
    window.addEventListener('popstate', locationChangeHandler)
  },
  dropView(node: NavigationNode) {
    window.removeEventListener('popstate', node.locationChangeHandler!)
  },
  updateView(oldNode: NavigationNode, newNode: NavigationNode) {
    newNode.locationChangeHandler = oldNode.locationChangeHandler
  },
}

export const NavigationContainer = createBoundary((config: unknown, body: () => void) => {
  body()
})
