import { WorkingTree, ViewNode, ViewNodeManager } from '@methodical-js/core'
import { CustomHTMLConfig, applyInitialConfig, applyUpdatedConfig } from './ViewConfig.js'
import { insertNodeViewIntoDOM } from './insertNodeViewIntoDOM.js'

type UnorderedListConfig = CustomHTMLConfig<HTMLUListElement>

const viewManager: ViewNodeManager = {
  createView(node: ViewNode) {
    const view = document.createElement('ul')

    applyInitialConfig(view, node.config)

    node.viewReference = view
    insertNodeViewIntoDOM(node)
  },

  dropView(node: ViewNode) {
    const view = node.viewReference as HTMLElement | undefined
    view?.remove()
  },

  updateView(oldNode: ViewNode, newNode: ViewNode) {
    const view = newNode.viewReference as HTMLUListElement | undefined
    if (view === undefined) {
      return
    }

    applyUpdatedConfig(view, oldNode.config, newNode.config)
  },
}

export const UnorderedList = (config: UnorderedListConfig, body?: () => void) => {
  config.__viewType = 'ul'

  const view = WorkingTree.createViewNode(config, viewManager, body)
  return view
}
