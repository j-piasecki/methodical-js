type Id = string | number

interface Node {
  value: Id
  last: boolean
  children: Map<Id, Node>
}

export class PrefixTree {
  private root: Node | undefined

  public addPath(path: Id[]) {
    const key = path.shift()

    if (this.root === undefined && key !== undefined) {
      this.root = {
        value: key,
        last: path.length === 0,
        children: new Map(),
      }
    }

    if (path.length > 0) {
      this.appendToNode(this.root!, path)
    }
  }

  private appendToNode(node: Node, path: Id[]) {
    const key = path.shift()
    if (key !== undefined) {
      if (node.children.get(key) === undefined) {
        node.children.set(key, {
          value: key,
          last: path.length === 0,
          children: new Map(),
        })
      }

      if (path.length > 0) {
        this.appendToNode(node.children.get(key)!, path)
      } else {
        node.children.get(key)!.last = true
      }
    }
  }

  public getPaths(): Id[][] {
    if (this.root === undefined) {
      return []
    }

    return this.getNodePaths(this.root, [])
  }

  private getNodePaths(node: Node, prefix: Id[]): Id[][] {
    if (node.last || node.children.size === 0) {
      return [[...prefix, node.value]]
    }

    const result: Id[][] = []

    prefix.push(node.value)
    for (const [_, child] of node.children) {
      const childPaths = this.getNodePaths(child, prefix)

      for (const path of childPaths) {
        result.push(path)
      }
    }
    prefix.pop()

    return result
  }

  public findNodeAtPath(path: Id[]): PrefixTree | undefined {
    let currentNode = this.root

    // skip first element, it's the root
    for (let i = 1; i < path.length; i++) {
      const key = path[i]
      if (currentNode === undefined) {
        return undefined
      }

      currentNode = currentNode.children.get(key)
    }

    if (currentNode === undefined) {
      return undefined
    }

    const tree = new PrefixTree()
    tree.root = { ...currentNode, last: false }

    return tree
  }

  public clear() {
    this.root = undefined
  }

  public isEmpty() {
    return this.root === undefined
  }

  public toString() {
    return JSON.stringify(
      this.root,
      (key, value) => {
        if (key === 'children') {
          return Object.fromEntries(value.entries())
        }

        return value
      },
      2
    )
  }
}
