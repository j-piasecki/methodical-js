import { SuspenseBoundary, WorkingTree, remember, sideEffect, defer } from '../index'
import { createViewFunction, createViewManager } from './utils'

jest.useFakeTimers()

beforeEach(() => {
  WorkingTree.reset()
})

class PromiseMock {
  private callback: (data: unknown) => void

  then(callback: (data: unknown) => void) {
    this.callback = callback
  }

  resolve(data: unknown) {
    this.callback(data)
  }
}

test('fallback should be rendered after suspension when defer has no initial value', () => {
  const viewManager = createViewManager({})
  const View = createViewFunction(viewManager)

  const fallback = jest.fn()

  View({ id: 'test' }, () => {
    SuspenseBoundary(
      { id: 'suspense' },
      () => {
        // @ts-ignore pass mocked promise to have more control over it
        defer(() => new PromiseMock())
      },
      fallback
    )
  })

  WorkingTree.performInitialRender()

  expect(fallback).toHaveBeenCalled()
})

test('defer suspension should stop execution', () => {
  const viewManager = createViewManager({})
  const View = createViewFunction(viewManager)

  const fun = jest.fn()

  View({ id: 'test' }, () => {
    SuspenseBoundary({ id: 'suspense' }, () => {
      // @ts-ignore pass mocked promise to have more control over it
      defer(() => new PromiseMock())

      fun()
    })
  })

  WorkingTree.performInitialRender()

  expect(fun).not.toHaveBeenCalled()
})

test('the branch should be rerendered when defer suspension ends', () => {
  const viewManager = createViewManager({})
  const View = createViewFunction(viewManager)

  const fun = jest.fn()
  const promise = new PromiseMock()

  View({ id: 'test' }, () => {
    SuspenseBoundary({ id: 'suspense' }, () => {
      // @ts-ignore pass mocked promise to have more control over it
      defer(() => promise)

      fun()
    })
  })

  WorkingTree.performInitialRender()

  promise.resolve(1)
  WorkingTree.performUpdate()

  expect(fun).toHaveBeenCalledTimes(1)
})

test('changing defer dependency should not suspend again', () => {
  const viewManager = createViewManager({})
  const View = createViewFunction(viewManager)

  const fun = jest.fn()
  const fallback = jest.fn()
  const promise = new PromiseMock()

  View({ id: 'test' }, () => {
    SuspenseBoundary(
      { id: 'suspense' },
      () => {
        const val = remember(0)
        // @ts-ignore pass mocked promise to have more control over it
        const susVal = defer(() => promise, val)

        sideEffect(() => {
          val.value = susVal as number
        }, susVal)

        fun()
      },
      fallback
    )
  })

  WorkingTree.performInitialRender()

  // unsuspend rendering
  promise.resolve(1)
  WorkingTree.performUpdate()

  // sideEffect triggered, causing update which should not suspend again
  WorkingTree.performUpdate()

  // perform update again to check if it does not suspend
  promise.resolve(1)
  WorkingTree.performUpdate()

  expect(fun).toHaveBeenCalledTimes(3)
  expect(fallback).toHaveBeenCalledTimes(1)
})

test('the branch should be rerendered when defer suspension ends with more than one defer call', () => {
  const viewManager = createViewManager({})
  const View = createViewFunction(viewManager)

  const fun = jest.fn()
  const fallback = jest.fn()
  const promise1 = new PromiseMock()
  const promise2 = new PromiseMock()

  View({ id: 'test' }, () => {
    SuspenseBoundary(
      { id: 'suspense' },
      () => {
        // @ts-ignore pass mocked promise to have more control over it
        defer(() => promise1)
        // @ts-ignore pass mocked promise to have more control over it
        defer(() => promise2)

        fun()
      },
      fallback
    )
  })

  WorkingTree.performInitialRender()

  promise1.resolve(1)
  WorkingTree.performUpdate()

  promise2.resolve(1)
  WorkingTree.performUpdate()

  expect(fun).toHaveBeenCalledTimes(1)
  expect(fallback).toHaveBeenCalledTimes(2)
})
