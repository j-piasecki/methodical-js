import { NodeType } from './NodeType.js'
import { RememberedValue } from './RememberedValue.js'
import { ViewNode } from './ViewNode.js'
import { WorkingNode } from './WorkingNode.js'

export class RememberNode<T> extends WorkingNode {
  private _value: RememberedValue<T>

  constructor(id: string | number) {
    super(id, NodeType.Remember)
  }

  public get value() {
    return this._value
  }

  private initializeValue(value: T) {
    this._value = new RememberedValue(value, this)
  }

  private restoreValue(previousNode: RememberNode<T>) {
    this._value = previousNode._value
    this._value.switchContext(this)
  }

  public initializeOrRestore(initialValue: T) {
    // remember may only be called inside view node
    const currentView = this.parent as ViewNode

    if (currentView.previousContext !== undefined) {
      // try finding the path up to the previous context
      let predecessor: WorkingNode | undefined = currentView
      const path: (string | number)[] = [this.id]

      while (predecessor !== undefined && predecessor.id !== currentView.previousContext!.id) {
        path.unshift(predecessor.id)
        predecessor = predecessor.parent
      }

      // if predecessor is undefined, it means that the previous context is not a parent of the current view
      // otherwise, we can try to restore the value from the previous context, assuming the node at that path existed
      const previousRememberedNode =
        predecessor === undefined
          ? undefined
          : (currentView.previousContext!.getNodeFromPath(path) as RememberNode<T> | undefined)

      if (previousRememberedNode !== undefined) {
        this.restoreValue(previousRememberedNode)
      } else {
        this.initializeValue(initialValue)
      }
    } else {
      this.initializeValue(initialValue)
    }
  }
}
