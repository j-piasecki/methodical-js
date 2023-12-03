import { RememberedValue } from "./RememberedValue.js";
import { WorkingTree } from "./WorkingTree.js";

const View = (id: string, body?: () => void) => {
  const view = WorkingTree.createViewNode(id, body)
  return view
}

const remember = <T>(value: T) => {
  const rememberedNode = WorkingTree.createRememberNode();
  const rememberedValue = new RememberedValue(value, rememberedNode)

  // @ts-ignore
  rememberedNode.value = rememberedValue
  return rememberedValue
}

let value

View('App', () => {
  View('View1')
  View('View2', () => {
    value = remember(0)
  })
  View('View3')
})

value!.value = 1

console.log(WorkingTree.root.toString())

console.log(WorkingTree.hasPendingUpdate)
WorkingTree.performUpdate()
console.log(WorkingTree.hasPendingUpdate)

console.log(WorkingTree.root.toString())
