import { WorkingTree } from '@methodical-js/core'

const Methodical = {
  init: (rootView: HTMLElement) => {
    WorkingTree.setRootViewReference(rootView)
    WorkingTree.performInitialRender()

    function render() {
      WorkingTree.performUpdate()
      requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
  },
}

export default Methodical

export {
  remember,
  sideEffect,
  defer,
  suspend,
  SuspenseBoundary,
  memoize,
} from '@methodical-js/core'
export { on } from './on.js'
export { Div } from './views/Div.js'
export { Text } from './views/Text.js'
export { Input } from './views/Input.js'

export { getNavigation } from './navigation/navigation.js'
export { Navigator } from './navigation/Navigator.js'
export { Route } from './navigation/Route.js'
