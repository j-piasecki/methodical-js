import { NodeType } from './NodeType.js'
import { RememberedValue } from './RememberedValue.js'
import { WorkingNode } from './WorkingNode.js'

export class RememberNode extends WorkingNode {
  private _value: RememberedValue<unknown>

  constructor(id: string | number) {
    super(id, NodeType.Remember)
  }

  public get value() {
    return this._value
  }

  public initializeValue(value: unknown) {
    this._value = new RememberedValue(value, this)
  }

  public restoreValue(previousNode: RememberNode) {
    this._value = previousNode._value
    this._value.switchContext(this)
  }
}
