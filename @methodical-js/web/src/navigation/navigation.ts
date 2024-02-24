import { readAmbient } from '@methodical-js/core'
import { NavigationAmbient } from './common.js'

const commonNavigation = {
  get hash() {
    return window.location.hash
  },
  get query() {
    const query: Record<string, string> = {}
    for (const [key, value] of new URLSearchParams(window.location.search)) {
      query[key] = value
    }
    return query
  },

  navigate: (to: string) => {
    if (to.startsWith('.')) {
      const pathSegments = (window.location.pathname + '/' + to)
        .split('/')
        .filter((part) => part !== '')
      const newSegments = ['']

      for (const segment of pathSegments) {
        if (segment === '..') {
          newSegments.pop()
        } else if (segment !== '.') {
          newSegments.push(segment)
        }
      }

      window.history.pushState({}, '', newSegments.join('/'))
    } else {
      window.history.pushState({}, '', to)
    }

    window.dispatchEvent(new PopStateEvent('popstate'))
  },
  back: () => {
    window.history.back()
  },
}

export function getNavigation() {
  const matchedPath = readAmbient(NavigationAmbient)

  return {
    get params() {
      const pattern = matchedPath.split('/').filter((part) => part !== '')
      const location = window.location.pathname.split('/').filter((part) => part !== '')
      const params: Record<string, string> = {}

      if (pattern.length > location.length) {
        return params
      }

      for (const part of pattern) {
        const locationPart = location.shift()

        if (part.startsWith(':')) {
          const paramName = part.slice(1)
          params[paramName] = locationPart!
          continue
        }
      }

      return params
    },
    ...commonNavigation,
  }
}
