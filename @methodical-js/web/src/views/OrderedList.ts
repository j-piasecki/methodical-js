import { WorkingTree, ViewNode, ViewNodeManager } from '@methodical-js/core'
import { CustomHTMLConfig, applyInitialConfig, applyUpdatedConfig } from './ViewConfig.js'
import { insertNodeViewIntoDOM } from './insertNodeViewIntoDOM.js'

type OrderedListConfig = CustomHTMLConfig<HTMLOListElement>

const viewManager: ViewNodeManager = {
  createView(node: ViewNode) {
    const view = document.createElement('ol')

    applyInitialConfig(view, node.config)

    node.viewReference = view
    insertNodeViewIntoDOM(node)
  },

  dropView(node: ViewNode) {
    const view = node.viewReference as HTMLElement | undefined
    view?.remove()
  },

  updateView(oldNode: ViewNode, newNode: ViewNode) {
    const view = newNode.viewReference as HTMLOListElement | undefined
    if (view === undefined) {
      return
    }

    applyUpdatedConfig(view, oldNode.config, newNode.config)
  },
}

export const OrderedList = (config: OrderedListConfig, body?: () => void) => {
  config.__viewType = 'ol'

  const view = WorkingTree.createViewNode(config, viewManager, body)
  return view
}
