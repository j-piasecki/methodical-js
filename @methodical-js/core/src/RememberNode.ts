import { NodeType } from "./NodeType.js";
import { RememberedValue } from "./RememberedValue.js";
import { WorkingNode } from "./WorkingNode.js";

export class RememberNode extends WorkingNode {
  private value: RememberedValue<unknown>

  constructor(id: string | number) {
    super(id, NodeType.Remember);
  }
}