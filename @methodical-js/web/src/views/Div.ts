import { WorkingTree, ViewNode, ViewNodeManager } from '@methodical-js/core'
import { ViewConfig } from './ViewConfig.js'
import { insertNodeViewIntoDOM } from './insertNodeViewIntoDOM.js'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DivConfig extends ViewConfig {}

const viewManager: ViewNodeManager = {
  createView(node: ViewNode) {
    const view = document.createElement('div')

    const config = node.config as DivConfig

    if (config.className !== undefined) {
      view.className = config.className
    }
    if (config.style !== undefined) {
      Object.assign(view.style, config.style)
    }

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

    const _oldConfig = oldNode.config as DivConfig
    const newConfig = newNode.config as DivConfig

    if (_oldConfig.className !== newConfig.className) {
      view.className = newConfig.className ?? ''
    }
    if (newConfig.style !== undefined) {
      Object.assign(view.style, newConfig.style)
    }
  },
}

export const Div = (config: DivConfig, body?: () => void) => {
  config.__viewType = 'div'

  const view = WorkingTree.createViewNode(config, viewManager, body)
  return view
}
