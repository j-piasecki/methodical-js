const navigation = {
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
  return navigation
}
