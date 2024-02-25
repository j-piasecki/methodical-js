import { NodeType, ViewNode, WorkingNode } from '@methodical-js/core'

function isViewNode(node: WorkingNode): node is ViewNode {
  return node.type === NodeType.View
}

function findParentViewReferenceNode(node: ViewNode): ViewNode | undefined {
  let parent = node.parent as ViewNode | undefined

  while (parent !== undefined) {
    if (parent.viewReference !== undefined) {
      return parent
    }

    parent = parent.parent as ViewNode | undefined
  }

  return undefined
}

function findFirstViewReferenceInSubtree(node: ViewNode): ViewNode | undefined {
  if (node.viewReference !== undefined) {
    return node
  }

  for (const child of node.children) {
    if (isViewNode(child)) {
      const viewReference = findFirstViewReferenceInSubtree(child)
      if (viewReference?.viewReference !== undefined) {
        return viewReference
      }
    }
  }

  return undefined
}

/**
 * @param node node to start the search from
 * @param stopAtNode node to stop the search at, by design the first ancestor with a view reference set
 * @returns the view node that holds the reference to a view that should be attached to the right of the passed node
 */
function findSuccessorViewReferenceNode(
  node: ViewNode,
  stopAtNode: ViewNode
): ViewNode | undefined {
  // if the current node is the parent view reference, we traversed every node rendered
  // after the one we are looking for and we should return since no views were found
  if (stopAtNode === node) {
    return undefined
  }

  const parent = node.parent as ViewNode

  // check every sibling after the current node and look for the first view reference
  // if a view reference is found, it should be attached to the right of the current node
  let shouldSkipNode = true
  for (const child of parent.children) {
    if (shouldSkipNode) {
      if (child.id === node.id) {
        shouldSkipNode = false
      }
      continue
    }

    if (isViewNode(child)) {
      const viewReference = findFirstViewReferenceInSubtree(child)
      if (viewReference?.viewReference !== undefined) {
        return viewReference
      }
    }
  }

  // if no view reference is found, we should also look up the tree
  return findSuccessorViewReferenceNode(parent as ViewNode, stopAtNode)
}

function findLastViewReferenceInSubtree(node: ViewNode): ViewNode | undefined {
  const childrenCount = node.children.length

  for (let i = childrenCount - 1; i >= 0; i--) {
    const child = node.children[i]
    if (isViewNode(child)) {
      const viewReference = findLastViewReferenceInSubtree(child)
      if (viewReference?.viewReference !== undefined) {
        return viewReference
      }
    }
  }

  return node
}

/**
 * @param node node to start the search from
 * @param stopAtNode node to stop the search at, by design the first ancestor with a view reference set
 * @returns the view node that holds the reference to a view that should be attached to the left of the passed node
 */
function findPredecessorViewReferenceNode(
  node: ViewNode,
  stopAtNode: ViewNode
): ViewNode | undefined {
  // if the current node is the parent view reference, we traversed every node rendered
  // before the one we are looking for and we should return since no views were found
  if (stopAtNode === node) {
    return undefined
  }

  const parent = node.parent as ViewNode

  // check every sibling before the current node and look for the last view reference
  // if a view reference is found, it should be attached to the left of the current node
  const indexInParent = parent.children.indexOf(node)
  for (let i = indexInParent - 1; i >= 0; i--) {
    const child = parent.children[i]
    if (isViewNode(child)) {
      const viewReference = findLastViewReferenceInSubtree(child)
      if (viewReference?.viewReference !== undefined) {
        return viewReference
      }
    }
  }

  // if no view reference is found, we should also look up the tree
  return findPredecessorViewReferenceNode(parent as ViewNode, stopAtNode)
}

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
