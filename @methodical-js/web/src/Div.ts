import { WorkingTree, ViewNode, ViewNodeManager } from '@methodical-js/core'
import { ViewConfig } from './ViewConfig.js'

interface DivConfig extends ViewConfig {
  style?: Partial<CSSStyleDeclaration>
  onClick?: (event: MouseEvent) => void
}

const viewManager: ViewNodeManager = {
  createView(node: ViewNode) {
    console.log('create', node.id)

    const view = document.createElement('div')
    view.id = node.id as string
    
    const config = node.config as DivConfig

    if (config.style !== undefined) {
      Object.assign(view.style, config.style)
    }

    if (config.onClick !== undefined) {
      view.addEventListener('click', config.onClick)
    }

    if (node.parent !== undefined) {
      const parentView = (node.parent as ViewNode).viewReference as HTMLElement | undefined
      parentView?.appendChild(view)
    }

    node.viewReference = view
  },

  dropView(node: ViewNode) {
    console.log('drop', node.id)

    const view = node.viewReference as HTMLElement | undefined
    view?.remove()
  },

  updateView(oldNode: ViewNode, newNode: ViewNode) {
    const view = newNode.viewReference as HTMLDivElement | undefined
    if (view === undefined) {
      return
    }

    console.log('update', oldNode.id, newNode.id)

    const oldConfig = oldNode.config as DivConfig
    const newConfig = newNode.config as DivConfig

    if (oldConfig.onClick !== newConfig.onClick) {
      if (oldConfig.onClick !== undefined) {
        view.removeEventListener('click', oldConfig.onClick)
      }

      if (newConfig.onClick !== undefined) {
        view.addEventListener('click', newConfig.onClick)
      }
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
