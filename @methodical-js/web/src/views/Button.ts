import { WorkingTree, ViewNode, ViewNodeManager } from '@methodical-js/core'
import { CustomHTMLConfig, applyInitialConfig, applyUpdatedConfig } from './ViewConfig.js'
import { insertNodeViewIntoDOM } from './insertNodeViewIntoDOM.js'

type ButtonConfig = CustomHTMLConfig<HTMLButtonElement>

const viewManager: ViewNodeManager = {
  createView(node: ViewNode) {
    const view = document.createElement('button')

    applyInitialConfig(view, node.config)

    node.viewReference = view
    insertNodeViewIntoDOM(node)
  },

  dropView(node: ViewNode) {
    const view = node.viewReference as HTMLElement | undefined
    view?.remove()
  },

  updateView(oldNode: ViewNode, newNode: ViewNode) {
    const view = newNode.viewReference as HTMLButtonElement | undefined
    if (view === undefined) {
      return
    }

    applyUpdatedConfig(view, oldNode.config, newNode.config)
  },
}

export const Button = (config: ButtonConfig, body?: () => void) => {
  config.__viewType = 'button'

  const view = WorkingTree.createViewNode(config, viewManager, body)
  return view
}
