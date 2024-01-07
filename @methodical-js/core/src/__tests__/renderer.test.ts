import { WorkingTree, remember, sideEffect } from '../index'
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
