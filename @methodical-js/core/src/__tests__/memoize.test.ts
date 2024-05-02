import { memoize } from '../effects'
import { WorkingTree, remember, sideEffect } from '../index'
import { createViewFunction, createViewManager } from './utils'

jest.useFakeTimers()

beforeEach(() => {
  WorkingTree.reset()
})

test('memoize should return calculated value', () => {
  const viewManager = createViewManager({})
  const View = createViewFunction(viewManager)

  View({ id: 'test' }, () => {
    const value = remember(2)
    const squared = memoize(() => value.value * value.value, value.value)

    expect(squared).toBe(4)
  })

  WorkingTree.performInitialRender()
})

test('memoize should not recalculate value when dependencies do not change', () => {
  const viewManager = createViewManager({})
  const View = createViewFunction(viewManager)

  const fun = jest.fn()

  View({ id: 'test' }, () => {
    const value = remember(2)
    const otherValue = remember(0)
    const squared = memoize(() => {
      fun()
      return value.value * value.value
    }, value.value)

    sideEffect(() => {
      setTimeout(() => {
        otherValue.value = 1
      }, 1000)
    })
  })

  WorkingTree.performInitialRender()

  expect(fun).toHaveBeenCalledTimes(1)

  jest.runAllTimers()
  WorkingTree.performUpdate()

  expect(fun).toHaveBeenCalledTimes(1)
})

test('memoize should recalculate value when dependencies change', () => {
  const viewManager = createViewManager({})
  const View = createViewFunction(viewManager)

  const fun = jest.fn()

  View({ id: 'test' }, () => {
    const value = remember(2)
    const squared = memoize(() => {
      fun()
      return value.value * value.value
    }, value.value)

    sideEffect(() => {
      setTimeout(() => {
        value.value = 3
      }, 1000)
    })

    expect(squared).toBe(value.value * value.value)
  })

  WorkingTree.performInitialRender()

  expect(fun).toHaveBeenCalledTimes(1)

  jest.runAllTimers()
  WorkingTree.performUpdate()

  expect(fun).toHaveBeenCalledTimes(2)
})
