import { WorkingTree, ViewNode, ViewNodeManager, createBoundary } from '@methodical-js/core'
import { ViewConfig } from '../views/ViewConfig'

interface NavigatorConfig extends ViewConfig {
  __path: string
}

interface NavigatorNode extends ViewNode {
  locationChangeHandler?: () => void
}

const viewManager: ViewNodeManager = {
  createView(node: NavigatorNode) {
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
  dropView(node: NavigatorNode) {
    window.removeEventListener('popstate', node.locationChangeHandler!)
  },
  updateView(oldNode: NavigatorNode, newNode: NavigatorNode) {
    newNode.locationChangeHandler = oldNode.locationChangeHandler
  },
}

const NavigatorContainer = createBoundary((config: any, body: () => void) => {
  body()
})

function matchPathToLocation(path: string): false | Record<string, string> {
  const pattern = path.split('/').filter((part) => part !== '')
  const location = window.location.pathname.split('/').filter((part) => part !== '')
  const params: Record<string, string> = {}

  if (pattern.length > location.length) {
    return false
  }

  for (const part of pattern) {
    const locationPart = location.shift()
    if (locationPart === undefined) {
      return false
    }

    if (part.startsWith(':')) {
      const paramName = part.slice(1)
      params[paramName] = locationPart
      continue
    }

    if (part !== locationPart) {
      return false
    }
  }

  return params
}

export const Navigator = (path: string, body?: (params: { [key: string]: string }) => void) => {
  const navigatorContainerConfig = {
    __viewType: '#mth-nav-cnt',
    id: '#mth-nav-cnt' + path.replace('/', '-'),
    pure: false,
  }

  NavigatorContainer(navigatorContainerConfig, () => {
    let fullPath = path
    let currentNode = WorkingTree.current as ViewNode | undefined
    while (currentNode !== undefined) {
      if (currentNode.config.__viewType === '#mth-nav') {
        fullPath = (currentNode.config as NavigatorConfig).__path + fullPath
        break
      }
      currentNode = currentNode.parent as ViewNode | undefined
    }

    const match = matchPathToLocation(fullPath)
    if (match === false) {
      return
    }

    const navigatorConfig: NavigatorConfig = {
      __viewType: '#mth-nav',
      __path: path,
      id: '#mth-nav' + path.replace('/', '-'),
      pure: false,
    }

    WorkingTree.createViewNode(navigatorConfig, viewManager, () => {
      body?.(match)
    })
  })
}
