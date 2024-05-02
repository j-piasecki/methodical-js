import { ViewNode, ViewNodeManager } from '@methodical-js/core'
import { RenderFunction } from './types.js'

const DummyCreateView = (node: ViewNode) => {
  node.viewReference = node.path.join('/')
}
const DummDropView = (_node: ViewNode) => {}
const DummUpdateView = (_oldNode: ViewNode, _newNode: ViewNode) => {}

export function createRenderOnlyViewManager(renderFn: RenderFunction): ViewNodeManager {
  return {
    createView: DummyCreateView,
    dropView: DummDropView,
    updateView: DummUpdateView,
    render: renderFn,
  }
}
