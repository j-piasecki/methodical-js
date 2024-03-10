import { WorkingTree, ViewNode, ViewNodeManager } from '@methodical-js/core'
import { ViewConfig, applyInitialConfig, applyUpdatedConfig } from './ViewConfig.js'
import { insertNodeViewIntoDOM } from './insertNodeViewIntoDOM.js'

type InputConfig = ViewConfig & {
  [K in keyof HTMLInputElement as string extends K
    ? never
    : K extends `on${string}`
    ? never
    : K]?: HTMLInputElement[K]
}

const viewManager: ViewNodeManager = {
  createView(node: ViewNode) {
    const view = document.createElement('input')

    applyInitialConfig(view, node.config)

    node.viewReference = view
    insertNodeViewIntoDOM(node)
  },

  dropView(node: ViewNode) {
    const view = node.viewReference as HTMLElement | undefined
    view?.remove()
  },

  updateView(oldNode: ViewNode, newNode: ViewNode) {
    const view = newNode.viewReference as HTMLInputElement | undefined
    if (view === undefined) {
      return
    }

    applyUpdatedConfig(view, oldNode.config, newNode.config)
  },
}

export const Input = (config: InputConfig, body?: () => void) => {
  config.__viewType = 'input'

  const view = WorkingTree.createViewNode(config, viewManager, body)
  return view
}