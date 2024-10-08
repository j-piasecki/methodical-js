import { NodeType } from './NodeType.js'
import { ViewNode } from './ViewNode.js'
import { WorkingNode } from './WorkingNode.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepEqual(obj1: any, obj2: any) {
  if (obj1 === obj2) {
    // it's just the same object. No need to compare.
    return true
  }

  if (isPrimitive(obj1) && isPrimitive(obj2)) {
    // compare primitives
    return obj1 === obj2
  }

  if (obj1 === undefined || obj2 === undefined) {
    return obj1 === obj2
  }

  if (obj1 === null || obj2 === null) {
    return obj1 === obj2
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false
  }

  // compare objects with same number of keys
  for (const key in obj1) {
    if (!(key in obj2)) {
      return false
    } //other object doesn't have this prop
    if (!deepEqual(obj1[key], obj2[key])) {
      return false
    }
  }

  return true
}

//check if value is primitive
function isPrimitive(obj: unknown) {
  return obj !== Object(obj)
}

// check if dependencies are equal, does shallow comparison
export function compareDependencies(first: unknown[], second: unknown[]) {
  let areDependenciesEqual = true

  if (first.length !== second.length) {
    areDependenciesEqual = false
  } else {
    for (let i = 0; i < first.length; i++) {
      if (first[i] !== second[i]) {
        areDependenciesEqual = false
        break
      }
    }
  }

  return areDependenciesEqual
}

export function isViewNode(node: WorkingNode): node is ViewNode {
  return (
    node.type === NodeType.View || node.type === NodeType.Rebuilding || node.type === NodeType.Root
  )
}
