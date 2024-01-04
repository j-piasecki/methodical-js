import { BaseConfig } from './BaseConfig.js'
import { ViewNodeManager } from './ViewNodeManager.js'
import { WorkingTree } from './WorkingTree.js'

const viewManager: ViewNodeManager = {
  createView(node) {
    console.log('create', node.id)
  },
  dropView(node) {
    console.log('drop', node.id)
  },
  updateView(oldNode, newNode) {
    console.log('update', oldNode.id, newNode.id)
  },
}

const View = (config: BaseConfig, body?: () => void) => {
  const view = WorkingTree.createViewNode(config, viewManager, body)
  return view
}

const remember = <T>(value: T) => {
  const rememberedNode = WorkingTree.createRememberNode(value)
  return rememberedNode.value
}

const sideEffect = (effect: () => void, ...dependencies: unknown[]) => {
  WorkingTree.createEffectNode(effect, dependencies)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let value: any

View({id: 'App'}, () => {
  View({id: 'View1'})
  value = remember(0)
  View({id: 'View2'}, () => {
    const x = remember(10)

    sideEffect(() => {
      console.log('effect', x.value, value.value)

      return () => {
        console.log('cleanup', x.value, value.value)
      }
    }, x.value, value.value);
  })

  if (value.value === 0) {
    View({id: 'ViewCond-0'})
  } else {
    View({id: 'ViewCond-?'})
  }

  View({id: 'View3'})
})

WorkingTree.performInitialRender()
console.log(WorkingTree.root.toString())

value!.value = 1

console.log(WorkingTree.hasPendingUpdate)
WorkingTree.performUpdate()
console.log(WorkingTree.hasPendingUpdate)

console.log(WorkingTree.root.toString())
