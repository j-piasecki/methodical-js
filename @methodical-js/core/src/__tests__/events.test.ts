import { WorkingTree, eventHandler, remember, sideEffect } from '../index'
import { createEventManager, createViewFunction, createViewManager } from './utils'

jest.useFakeTimers()

beforeEach(() => {
  WorkingTree.reset()
})

test('registerHandler should be called when event node is present in the tree', () => {
  let viewId = 0
  const viewManager = createViewManager({
    createView: (node) => {
      node!.viewReference = viewId++
    },
  })
  const View = createViewFunction(viewManager)

  const eventManager = createEventManager({
    registerHandler: jest.fn(),
    unregisterHandler: jest.fn(),
    updateHandler: jest.fn(),
  })

  View({ id: 'test' }, () => {
    eventHandler('click', () => {}, eventManager)
  })

  WorkingTree.performInitialRender()

  expect(eventManager.registerHandler).toHaveBeenCalledTimes(1)
  expect(eventManager.registerHandler).toHaveBeenCalledWith(0, expect.anything(), expect.anything())
  expect(eventManager.unregisterHandler).not.toHaveBeenCalled()
  expect(eventManager.updateHandler).not.toHaveBeenCalled()
})

test('updateHandler should be called when event node is updated with different dependencies', () => {
  let viewId = 0
  const viewManager = createViewManager({
    createView: (node) => {
      node!.viewReference = viewId++
    },
  })
  const View = createViewFunction(viewManager)

  const eventManager = createEventManager({
    registerHandler: jest.fn(),
    unregisterHandler: jest.fn(),
    updateHandler: jest.fn(),
  })

  View({ id: 'test' }, () => {
    const rememberedValue = remember(1)

    sideEffect(() => {
      setTimeout(() => {
        rememberedValue.value = 2
      }, 100)
    })

    eventHandler('click', () => {}, eventManager, rememberedValue.value)
  })

  WorkingTree.performInitialRender()
  jest.runAllTimers()
  WorkingTree.performUpdate()

  expect(eventManager.registerHandler).toHaveBeenCalledTimes(1)
  expect(eventManager.registerHandler).toHaveBeenCalledWith(0, expect.anything(), expect.anything())
  expect(eventManager.unregisterHandler).not.toHaveBeenCalled()
  expect(eventManager.updateHandler).toHaveBeenCalledTimes(1)
})

test('updateHandler should not be called when event node is updated with the same dependencies', () => {
  let viewId = 0
  const viewManager = createViewManager({
    createView: (node) => {
      node!.viewReference = viewId++
    },
  })
  const View = createViewFunction(viewManager)

  const eventManager = createEventManager({
    registerHandler: jest.fn(),
    unregisterHandler: jest.fn(),
    updateHandler: jest.fn(),
  })

  View({ id: 'test' }, () => {
    const rememberedValue = remember(1)

    sideEffect(() => {
      setTimeout(() => {
        rememberedValue.value = 2
      }, 100)
    })

    eventHandler('click', () => {}, eventManager, 1)
  })

  WorkingTree.performInitialRender()
  jest.runAllTimers()
  WorkingTree.performUpdate()

  expect(eventManager.registerHandler).toHaveBeenCalledTimes(1)
  expect(eventManager.registerHandler).toHaveBeenCalledWith(0, expect.anything(), expect.anything())
  expect(eventManager.unregisterHandler).not.toHaveBeenCalled()
  expect(eventManager.updateHandler).not.toHaveBeenCalled()
})

test('unregisterHandler should be called when the event is dropped from the tree', () => {
  let viewId = 0
  const viewManager = createViewManager({
    createView: (node) => {
      node!.viewReference = viewId++
    },
  })
  const View = createViewFunction(viewManager)

  const eventManager = createEventManager({
    registerHandler: jest.fn(),
    unregisterHandler: jest.fn(),
    updateHandler: jest.fn(),
  })

  View({ id: 'test' }, () => {
    const rememberedValue = remember(1)

    sideEffect(() => {
      setTimeout(() => {
        rememberedValue.value = 2
      }, 100)
    })

    if (rememberedValue.value === 1) {
      View({ id: 'test2' }, () => {
        eventHandler('click', () => {}, eventManager)
      })
    }
  })

  WorkingTree.performInitialRender()
  jest.runAllTimers()
  WorkingTree.performUpdate()

  expect(eventManager.registerHandler).toHaveBeenCalledTimes(1)
  expect(eventManager.registerHandler).toHaveBeenCalledWith(1, expect.anything(), expect.anything())
  expect(eventManager.unregisterHandler).toHaveBeenCalledTimes(1)
  expect(eventManager.updateHandler).not.toHaveBeenCalled()
})
