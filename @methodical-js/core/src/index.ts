import { WorkingTree } from './WorkingTree.js'

const View = (id: string, body?: () => void) => {
  const view = WorkingTree.createViewNode(id, body)
  return view
}

const remember = <T>(value: T) => {
  const rememberedNode = WorkingTree.createRememberNode(value)
  return rememberedNode.value
}

let value

View('App', () => {
  View('View1')
  value = remember(0)
  View('View2', () => {
    const x = remember(10)
  })
  View('View3')
})

console.log(WorkingTree.root.toString())

value!.value = 1

console.log(WorkingTree.hasPendingUpdate)
WorkingTree.performUpdate()
console.log(WorkingTree.hasPendingUpdate)

console.log(WorkingTree.root.toString())
