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

export { remember, sideEffect } from '@methodical-js/core'
export { Div } from './Div.js'
