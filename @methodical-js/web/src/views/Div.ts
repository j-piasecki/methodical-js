import { WorkingTree, ViewNode, ViewNodeManager } from '@methodical-js/core'
import { CustomHTMLConfig, applyInitialConfig, applyUpdatedConfig } from './ViewConfig.js'
import { insertNodeViewIntoDOM } from './insertNodeViewIntoDOM.js'

type DivConfig = CustomHTMLConfig<HTMLDivElement>

const viewManager: ViewNodeManager = {
  createView(node: ViewNode) {
    const view = document.createElement('div')

    applyInitialConfig(view, node.config)

    node.viewReference = view
    insertNodeViewIntoDOM(node)
  },

  dropView(node: ViewNode) {
    const view = node.viewReference as HTMLElement | undefined
    view?.remove()
  },

  updateView(oldNode: ViewNode, newNode: ViewNode) {
    const view = newNode.viewReference as HTMLDivElement | undefined
    if (view === undefined) {
      return
    }

    applyUpdatedConfig(view, oldNode.config, newNode.config)
  },
}

export const Div = (config: DivConfig, body?: () => void) => {
  config.__viewType = 'div'

  const view = WorkingTree.createViewNode(config, viewManager, body)
  return view
}
