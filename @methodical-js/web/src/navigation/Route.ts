import { WorkingTree, ViewNode } from '@methodical-js/core'
import {
  NavigationAmbient,
  NavigationConfig,
  NavigationContainer,
  NavigationViewManager,
  pathMatchesLocation,
} from './common.js'

export const Route = (path: string, body?: () => void) => {
  const slashlessPath = path.replace('/', '-')

  const routeContainerConfig = {
    __viewType: '#mth-nav-rt-cnt',
    id: '#mth-nav-rt-cnt' + slashlessPath,
    pure: false,
  }

  NavigationContainer(routeContainerConfig, () => {
    let fullPath = path
    let currentNode = WorkingTree.current as ViewNode | undefined
    while (currentNode !== undefined) {
      if (currentNode.config.__viewType === '#mth-nav') {
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
        __viewType: '#mth-nav-rt',
        __path: path,
        id: '#mth-nav-rt' + slashlessPath,
        pure: false,
      }

      NavigationAmbient(
        {
          id: '#mth-nav-amb' + slashlessPath,
          value: fullPath,
        },
        () => {
          WorkingTree.createViewNode(routeConfig, NavigationViewManager, body)
        }
      )
    }
  })
}
