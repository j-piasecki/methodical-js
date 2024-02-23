import { WorkingTree, ViewNode } from '@methodical-js/core'
import { NavigationConfig, NavigationContainer, NavigationViewManager } from './common.js'

export function matchPathToLocation(path: string): Record<string, string> | undefined {
  const pattern = path.split('/').filter((part) => part !== '')
  const location = window.location.pathname.split('/').filter((part) => part !== '')
  const params: Record<string, string> = {}

  console.log('try match', pattern, location)

  if (pattern.length != location.length) {
    return undefined
  }

  for (const part of pattern) {
    const locationPart = location.shift()
    if (locationPart === undefined) {
      return undefined
    }

    if (part.startsWith(':')) {
      const paramName = part.slice(1)
      params[paramName] = locationPart
      continue
    }

    if (part !== locationPart) {
      return undefined
    }
  }

  return params
}

export const Route = (path: string, body?: (params: { [key: string]: string }) => void) => {
  const routeContainerConfig = {
    __viewType: '#mth-nav-rt-cnt',
    id: '#mth-nav-rt-cnt' + path.replace('/', '-'),
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

    console.log(path, fullPath, window.location.pathname)

    const match = matchPathToLocation(fullPath)
    if (match !== undefined) {
      const routeConfig: NavigationConfig = {
        __viewType: '#mth-nav-rt',
        __path: path,
        id: '#mth-nav-rt' + path.replace('/', '-'),
        pure: false,
      }

      WorkingTree.createViewNode(routeConfig, NavigationViewManager, () => {
        body?.(match)
      })
    }
  })
}
