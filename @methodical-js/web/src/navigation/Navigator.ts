import { WorkingTree, ViewNode } from '@methodical-js/core'
import {
  NAVIGATION_AMBIENT_TYPE,
  NAVIGATOR_CONTAINER_TYPE,
  NAVIGATOR_TYPE,
  NavigationConfig,
  NavigationContainer,
  NavigationViewManager,
  pathMatchesLocation,
} from './common.js'
import { NavigationAmbient } from './common.js'

export const Navigator = (path: string, body?: () => void) => {
  const slashlessPath = path.replace('/', '-')

  const navigatorContainerConfig = {
    __viewType: NAVIGATOR_CONTAINER_TYPE,
    id: NAVIGATOR_CONTAINER_TYPE + slashlessPath,
    pure: false,
  }

  NavigationContainer(navigatorContainerConfig, () => {
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

    if (pathMatchesLocation(fullPath)) {
      const navigatorConfig: NavigationConfig = {
        __viewType: NAVIGATOR_TYPE,
        __path: path,
        id: NAVIGATOR_TYPE + slashlessPath,
        pure: false,
      }

      NavigationAmbient(
        {
          id: NAVIGATION_AMBIENT_TYPE + slashlessPath,
          value: fullPath,
        },
        () => {
          WorkingTree.createViewNode(navigatorConfig, NavigationViewManager, body)
        }
      )
    }
  })
}
