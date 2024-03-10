import { WorkingTree, ViewNode, ViewNodeManager } from '@methodical-js/core'
import { insertNodeViewIntoDOM } from './insertNodeViewIntoDOM.js'
import { ViewConfig, applyInitialConfig, applyUpdatedConfig } from './ViewConfig.js'

interface TextConfig extends ViewConfig {
  value: string
}

const viewManager: ViewNodeManager = {
  createView(node: ViewNode) {
    const config = node.config as TextConfig
    const textNode = document.createTextNode(config.value)
    const view = document.createElement('span')

    view.appendChild(textNode)

    applyInitialConfig(view, config, ['value'])

    node.viewReference = view
    insertNodeViewIntoDOM(node)
  },

  dropView(node: ViewNode) {
    const view = node.viewReference as HTMLElement | undefined
    view?.remove()
  },

  updateView(oldNode: ViewNode, newNode: ViewNode) {
    const view = newNode.viewReference as HTMLSpanElement | undefined
    const textNode = view?.firstChild as Text | undefined
    if (view === undefined || textNode === undefined) {
      return
    }

    const oldConfig = oldNode.config as TextConfig
    const newConfig = newNode.config as TextConfig

    applyUpdatedConfig(view, oldConfig, newConfig, ['value'])

    if (newConfig.value !== oldConfig.value) {
      textNode.data = newConfig.value
    }
  },
}

export const Text = (config: TextConfig) => {
  const view = WorkingTree.createViewNode(config, viewManager)
  return view
}
