import { WorkingTree } from '@methodical-js/core'

export const remember = <T>(value: T) => {
  const rememberedNode = WorkingTree.createRememberNode(value)
  return rememberedNode.value
}

export const sideEffect = (effect: () => void, ...dependencies: unknown[]) => {
  return WorkingTree.createEffectNode(effect, dependencies)
}

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

export { Div } from './Div.js'
