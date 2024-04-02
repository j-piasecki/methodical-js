import {
  ViewNode,
  findParentViewReferenceNode,
  findPredecessorViewReferenceNode,
  findSuccessorViewReferenceNode,
} from '@methodical-js/core'

export function insertNodeViewIntoDOM(node: ViewNode) {
  const parentViewRefNode = findParentViewReferenceNode(node)
  if (parentViewRefNode === undefined) {
    return
  }

  const parentViewRef = parentViewRefNode.viewReference as HTMLElement

  if (parentViewRef.children.length === 0) {
    // if the parent has no children, we can just append the node
    parentViewRef.appendChild(node.viewReference as HTMLElement)
    return
  }

  const parent = node.parent as ViewNode

  if (parent.__opt.created) {
    // when the parent has been created, there is high chance that the node
    // should be inserted at the end of the children, so we should look for the
    // predecessor and if it's the last child, we should append the node
    const leftSibling = findPredecessorViewReferenceNode(node, parentViewRefNode)
    if (leftSibling !== undefined && leftSibling.viewReference === parentViewRef.lastChild) {
      parentViewRef.append(node.viewReference as HTMLElement)
      return
    }
  }

  // when the parent has been updated and we're adding a node to it, there is
  // high chance that the node will be inserted somewhere in the middle of the
  // children, so we should look for the successor that we can pass to the
  // insertBefore function
  const rightViewSibling = findSuccessorViewReferenceNode(node, parentViewRefNode)
    ?.viewReference as HTMLElement | undefined
  if (rightViewSibling !== undefined) {
    parentViewRef.insertBefore(node.viewReference as HTMLElement, rightViewSibling)
    return
  }

  // if no siblings are found, we should simply append the node to the parent
  // in case of update, this will be the case when the node is the last one, so it
  // has no successor
  parentViewRef.appendChild(node.viewReference as HTMLElement)
}
