import { NodeType } from './NodeType.js'
import { RememberedValue } from './RememberedValue.js'
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
    const previousRememberedNode = this.findInPreviousContext()

    if (previousRememberedNode !== undefined) {
      this.restoreValue(previousRememberedNode)
    } else {
      this.initializeValue(initialValue)
    }
  }
}
