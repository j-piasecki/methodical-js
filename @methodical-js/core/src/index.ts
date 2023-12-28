import { WorkingTree } from './WorkingTree.js'

const View = (id: string, body?: () => void) => {
  const view = WorkingTree.createViewNode(id, body)
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

View('App', () => {
  View('View1')
  value = remember(0)
  View('View2', () => {
    const x = remember(10)

    sideEffect(() => {
      console.log('effect', x.value, value.value)

      return () => {
        console.log('cleanup', x.value, value.value)
      }
    }, x.value, value.value);
  })

  if (value.value === 0) {
    View('ViewCond-0')
  } else {
    View('ViewCond-?')
  }

  View('View3')
})

WorkingTree.performInitialRender()
console.log(WorkingTree.root.toString())

value!.value = 1

console.log(WorkingTree.hasPendingUpdate)
WorkingTree.performUpdate()
console.log(WorkingTree.hasPendingUpdate)

console.log(WorkingTree.root.toString())
