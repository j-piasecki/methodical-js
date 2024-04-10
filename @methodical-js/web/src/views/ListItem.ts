import { WorkingTree, ViewNode, ViewNodeManager } from '@methodical-js/core'
import { CustomHTMLConfig, applyInitialConfig, applyUpdatedConfig } from './ViewConfig.js'
import { insertNodeViewIntoDOM } from './insertNodeViewIntoDOM.js'

type ListItemConfig = CustomHTMLConfig<HTMLLIElement>

const viewManager: ViewNodeManager = {
  createView(node: ViewNode) {
    const view = document.createElement('li')

    applyInitialConfig(view, node.config)

    node.viewReference = view
    insertNodeViewIntoDOM(node)
  },

  dropView(node: ViewNode) {
    const view = node.viewReference as HTMLElement | undefined
    view?.remove()
  },

  updateView(oldNode: ViewNode, newNode: ViewNode) {
    const view = newNode.viewReference as HTMLLIElement | undefined
    if (view === undefined) {
      return
    }

    applyUpdatedConfig(view, oldNode.config, newNode.config)
  },
}

export const ListItem = (config: ListItemConfig, body?: () => void) => {
  config.__viewType = 'li'

  const view = WorkingTree.createViewNode(config, viewManager, body)
  return view
}
