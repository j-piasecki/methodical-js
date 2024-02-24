import { WorkingTree, ViewNode } from '@methodical-js/core'
import { NavigationConfig, NavigationContainer, NavigationViewManager } from './common.js'

export function pathMatchesLocation(path: string) {
  const pattern = path.split('/').filter((part) => part !== '')
  const location = window.location.pathname.split('/').filter((part) => part !== '')

  if (pattern.length > location.length) {
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

      WorkingTree.createViewNode(navigatorConfig, NavigationViewManager, body)
    }
  })
}
