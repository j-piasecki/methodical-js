import {
  ViewNode,
  ViewNodeManager,
  WorkingTree,
  createAmbient,
  createBoundary,
} from '@methodical-js/core'
import { ViewConfig } from '../views/ViewConfig'

export const NAVIGATION_AMBIENT_TYPE = '#mth-nav-amb'
export const NAVIGATOR_TYPE = '#mth-nav'
export const NAVIGATOR_CONTAINER_TYPE = '#mth-nav-cnt'
export const ROUTE_TYPE = '#mth-nav-rt'
export const ROUTE_CONTAINER_TYPE = '#mth-nav-rt-cnt'

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

export function pathMatchesLocation(path: string, exact = false) {
  const pattern = path.split('/').filter((part) => part !== '')
  const location = window.location.pathname.split('/').filter((part) => part !== '')

  if (
    (!exact && pattern.length > location.length) ||
    (exact && pattern.length != location.length)
  ) {
    return false
  }

  for (const part of pattern) {
    const locationPart = location.shift()
    if (locationPart === undefined) {
      return false
    }

    if (part.startsWith(':')) {
      part.slice(1)
      continue
    }

    if (part !== locationPart) {
      return false
    }
  }

  return true
}

export const NavigationAmbient = createAmbient<string>('#mth-nav-amb')
