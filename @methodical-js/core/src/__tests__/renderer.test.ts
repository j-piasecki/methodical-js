import { ViewNode, WorkingNode, WorkingTree, remember, sideEffect } from '../index'
import { createViewFunction, createViewManager } from './utils'

jest.useFakeTimers()

beforeEach(() => {
  WorkingTree.reset()
})

test('performInitialRender should call createView of ViewManager', () => {
  const viewManager = createViewManager({ createView: jest.fn() })
  const View = createViewFunction(viewManager)

  View({ id: 'test' })

  WorkingTree.performInitialRender()

  expect(viewManager.createView).toHaveBeenCalled()
})

test('updateView should be caled when the View function is called for the second time', () => {
  const viewManager = createViewManager({ createView: jest.fn(), updateView: jest.fn() })
  const View = createViewFunction(viewManager)

  View({ id: 'test' }, () => {
    const rememberedValue = remember(1)

    sideEffect(() => {
      setTimeout(() => {
        rememberedValue.value = 2
      }, 100)
    })

    View({ id: 'test2', mockProp: rememberedValue.value })
  })

  WorkingTree.performInitialRender()

  expect(viewManager.createView).toHaveBeenCalledTimes(2)
  expect(viewManager.updateView).not.toHaveBeenCalled()

  jest.runAllTimers()

  WorkingTree.performUpdate()

  expect(viewManager.updateView).toHaveBeenCalledTimes(1)
})

test('dropView should be caled when the view is no longer present in the tree', () => {
  const viewManager = createViewManager({ createView: jest.fn(), dropView: jest.fn() })
  const View = createViewFunction(viewManager)

  View({ id: 'test' }, () => {
    const rememberedValue = remember(true)

    sideEffect(() => {
      setTimeout(() => {
        rememberedValue.value = false
      }, 100)
    })

    if (rememberedValue.value) {
      View({ id: 'test2' })
    }
  })

  WorkingTree.performInitialRender()

  expect(viewManager.createView).toHaveBeenCalledTimes(2)
  expect(viewManager.dropView).not.toHaveBeenCalled()

  jest.runAllTimers()

  WorkingTree.performUpdate()

  expect(viewManager.dropView).toHaveBeenCalledTimes(1)
})

test('createView should be caled when the view appears in the tree for the first time', () => {
  const viewManager = createViewManager({ createView: jest.fn() })
  const View = createViewFunction(viewManager)

  View({ id: 'test' }, () => {
    const rememberedValue = remember(false)

    sideEffect(() => {
      setTimeout(() => {
        rememberedValue.value = true
      }, 100)
    })

    if (rememberedValue.value) {
      View({ id: 'test2' })
    }
  })

  WorkingTree.performInitialRender()

  expect(viewManager.createView).toHaveBeenCalledTimes(1)

  jest.runAllTimers()

  WorkingTree.performUpdate()

  expect(viewManager.createView).toHaveBeenCalledTimes(2)
})

test('pure view with unchanged config should not be reevaluated nor updated', () => {
  const viewManager = createViewManager({ createView: jest.fn(), updateView: jest.fn() })
  const View = createViewFunction(viewManager)

  const innerFunction = jest.fn()

  View({ id: 'test' }, () => {
    const rememberedValue = remember(1)

    sideEffect(() => {
      setTimeout(() => {
        rememberedValue.value = 2
      }, 100)
    })

    View({ id: 'test2', pure: true }, innerFunction)
  })

  WorkingTree.performInitialRender()

  expect(viewManager.createView).toHaveBeenCalledTimes(2)

  jest.runAllTimers()

  WorkingTree.performUpdate()

  expect(viewManager.updateView).not.toHaveBeenCalled()
  expect(innerFunction).toHaveBeenCalledTimes(1)
})

test('pure view with changed config should be reevaluated and updated', () => {
  const viewManager = createViewManager({ createView: jest.fn(), updateView: jest.fn() })
  const View = createViewFunction(viewManager)

  const innerFunction = jest.fn()

  View({ id: 'test' }, () => {
    const rememberedValue = remember(1)

    sideEffect(() => {
      setTimeout(() => {
        rememberedValue.value = 2
      }, 100)
    })

    View({ id: 'test2', pure: true, mockProp: rememberedValue.value }, innerFunction)
  })

  WorkingTree.performInitialRender()

  expect(viewManager.createView).toHaveBeenCalledTimes(2)

  jest.runAllTimers()

  WorkingTree.performUpdate()

  expect(viewManager.updateView).toHaveBeenCalledTimes(1)
  expect(innerFunction).toHaveBeenCalledTimes(2)
})

test('predecessorNode should be undefined on every node when update is finished', () => {
  const viewManager = createViewManager({})
  const View = createViewFunction(viewManager)

  View({ id: 'test' }, () => {
    const rememberedValue = remember(1)

    sideEffect(() => {
      setTimeout(() => {
        rememberedValue.value = 2
      }, 100)
    })

    View({ id: 'test2' }, () => {
      View({ id: 'test3' })
      View({ id: 'test4' })
    })

    View({ id: 'test5' }, () => {
      View({ id: 'test6' })
      View({ id: 'test7' })
    })
  })

  WorkingTree.performInitialRender()

  jest.runAllTimers()

  WorkingTree.performUpdate()

  function checkpredecessorNode(node: WorkingNode) {
    if (node.type === 'View') {
      const view = node as ViewNode
      expect(view.predecessorNode).toBeUndefined()

      if (view.children) {
        for (const child of view.children) {
          checkpredecessorNode(child)
        }
      }
    }
  }

  checkpredecessorNode(WorkingTree.root)
})

test('pure view should not stop its descendants from being updated if queued for it', () => {
  const viewManager = createViewManager({ createView: jest.fn(), updateView: jest.fn() })
  const View = createViewFunction(viewManager)

  const innerFunction = jest.fn()
  const moreInnerFunction = jest.fn()
  const mostInnerFunction = jest.fn()
  let test3

  const test = View({ id: 'test' }, () => {
    innerFunction()
    View({ id: 'test2', pure: true }, () => {
      moreInnerFunction()
      test3 = View({ id: 'test3' }, mostInnerFunction)
    })
  })

  WorkingTree.performInitialRender()

  expect(innerFunction).toHaveBeenCalledTimes(1)
  expect(moreInnerFunction).toHaveBeenCalledTimes(1)
  expect(mostInnerFunction).toHaveBeenCalledTimes(1)

  WorkingTree.queueUpdate(test)
  WorkingTree.queueUpdate(test3!)

  WorkingTree.performUpdate()

  expect(innerFunction).toHaveBeenCalledTimes(2)
  expect(moreInnerFunction).toHaveBeenCalledTimes(1)
  expect(mostInnerFunction).toHaveBeenCalledTimes(2)
})
