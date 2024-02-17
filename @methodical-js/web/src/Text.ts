import { WorkingTree, ViewNode, ViewNodeManager, BaseConfig } from '@methodical-js/core'
import { findParentView } from './utils.js'

interface TextConfig extends BaseConfig {
  value: string
}

const viewManager: ViewNodeManager = {
  createView(node: ViewNode) {
    const config = node.config as TextConfig
    const view = document.createTextNode(config.value)

    if (node.parent !== undefined) {
      const parentView = findParentView(node)
      parentView?.appendChild(view)
    }

    node.viewReference = view
  },

  dropView(node: ViewNode) {
    const view = node.viewReference as HTMLElement | undefined
    view?.remove()
  },

  updateView(oldNode: ViewNode, newNode: ViewNode) {
    const view = newNode.viewReference as Text | undefined
    if (view === undefined) {
      return
    }

    const oldConfig = oldNode.config as TextConfig
    const newConfig = newNode.config as TextConfig

    if (newConfig.value !== oldConfig.value) {
      view.data = newConfig.value
    }
  },
}

export const Text = (config: TextConfig) => {
  const view = WorkingTree.createViewNode(config, viewManager)
  return view
}
