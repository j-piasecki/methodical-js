import { WorkingTree, ViewNode } from '@methodical-js/core'
import {
  NAVIGATION_AMBIENT_TYPE,
  NAVIGATOR_TYPE,
  NavigationAmbient,
  NavigationConfig,
  NavigationContainer,
  NavigationViewManager,
  ROUTE_CONTAINER_TYPE,
  ROUTE_TYPE,
  pathMatchesLocation,
} from './common.js'

export const Route = (path: string, body?: () => void) => {
  const slashlessPath = path.replace('/', '-')

  const routeContainerConfig = {
    __viewType: ROUTE_CONTAINER_TYPE,
    id: ROUTE_CONTAINER_TYPE + slashlessPath,
    pure: false,
  }

  NavigationContainer(routeContainerConfig, () => {
    let fullPath = path
    let currentNode = WorkingTree.current as ViewNode | undefined
    while (currentNode !== undefined) {
      if (currentNode.config.__viewType === NAVIGATOR_TYPE) {
        const navigatorPath = (currentNode.config as NavigationConfig).__path
        if (!navigatorPath.endsWith('/') || !fullPath.startsWith('/')) {
          fullPath = navigatorPath + '/' + fullPath
        } else {
          fullPath = navigatorPath + fullPath
        }
      }
      currentNode = currentNode.parent as ViewNode | undefined
    }

    if (pathMatchesLocation(fullPath, true)) {
      const routeConfig: NavigationConfig = {
        __viewType: ROUTE_TYPE,
        __path: path,
        id: ROUTE_TYPE + slashlessPath,
        pure: false,
      }

      NavigationAmbient(
        {
          id: NAVIGATION_AMBIENT_TYPE + slashlessPath,
          value: fullPath,
        },
        () => {
          WorkingTree.createViewNode(routeConfig, NavigationViewManager, body)
        }
      )
    }
  })
}
