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

    return this.getNodePaths(this.root)
  }

  private getNodePaths(node: Node): Id[][] {
    if (node.last || node.children.size === 0) {
      return [[node.value]]
    }

    const result: Id[][] = []

    for (const [_, child] of node.children) {
      const childPaths = this.getNodePaths(child)

      childPaths.forEach((path) => {
        path.unshift(node.value)

        result.push(path)
      })
    }

    return result
  }

  public clear() {
    this.root = undefined
  }

  public isEmpty() {
    return this.root === undefined
  }
}