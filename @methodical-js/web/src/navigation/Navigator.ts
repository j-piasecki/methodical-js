import { WorkingTree, ViewNode } from '@methodical-js/core'
import {
  NavigationConfig,
  NavigationContainer,
  NavigationViewManager,
  pathMatchesLocation,
} from './common.js'
import { NavigationAmbient } from './common.js'

export const Navigator = (path: string, body?: () => void) => {
  const slashlessPath = path.replace('/', '-')

  const navigatorContainerConfig = {
    __viewType: '#mth-nav-cnt',
    id: '#mth-nav-cnt' + slashlessPath,
    pure: false,
  }

  NavigationContainer(navigatorContainerConfig, () => {
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

    if (pathMatchesLocation(fullPath)) {
      const navigatorConfig: NavigationConfig = {
        __viewType: '#mth-nav',
        __path: path,
        id: '#mth-nav' + slashlessPath,
        pure: false,
      }

      NavigationAmbient(
        {
          id: '#mth-nav-amb' + slashlessPath,
          value: fullPath,
        },
        () => {
          WorkingTree.createViewNode(navigatorConfig, NavigationViewManager, body)
        }
      )
    }
  })
}
