import { RememberNode } from './RememberNode.js'
import { WorkingTree } from './WorkingTree.js'

export class RememberedValue<T> {
  private _value: T
  private _context: RememberNode<T>

  constructor(value: T, context: RememberNode<T>) {
    this._value = value
    this._context = context
  }

  public get value(): T {
    return this._value
  }

  public set value(value: T) {
    const oldValue = this._value
    this._value = value

    // TODO: this will break during rebuild, the context will be dropped from the current tree
    // the update will be queued on the dead context, and will never be executed
    if (oldValue !== value) {
      // changing remembered value might affect its siblings, so we need to queue an update for the parent
      WorkingTree.queueUpdate(this._context.parent!)
    }
  }

  /** @internal */
  public switchContext(context: RememberNode<T>) {
    this._context = context
  }
}
