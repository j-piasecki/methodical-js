import {
  SuspenseBoundary,
  ViewNode,
  WorkingNode,
  WorkingTree,
  remember,
  sideEffect,
  suspend,
} from '../index'
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

test('fallback should be rendered after suspension', () => {
  const viewManager = createViewManager({})
  const View = createViewFunction(viewManager)

  const fallback = jest.fn()

  View({ id: 'test' }, () => {
    SuspenseBoundary(
      { id: 'suspense' },
      () => {
        // @ts-ignore pass mocked promise to have more control over it
        suspend(() => new PromiseMock())
      },
      fallback
    )
  })

  WorkingTree.performInitialRender()

  expect(fallback).toHaveBeenCalled()
})

test('suspension should stop execution', () => {
  const viewManager = createViewManager({})
  const View = createViewFunction(viewManager)

  const fun = jest.fn()

  View({ id: 'test' }, () => {
    SuspenseBoundary({ id: 'suspense' }, () => {
      // @ts-ignore pass mocked promise to have more control over it
      suspend(() => new PromiseMock())

      fun()
    })
  })

  WorkingTree.performInitialRender()

  expect(fun).not.toHaveBeenCalled()
})

test('the branch should be rerendered when suspension ends', () => {
  const viewManager = createViewManager({})
  const View = createViewFunction(viewManager)

  const fun = jest.fn()
  const promise = new PromiseMock()

  View({ id: 'test' }, () => {
    SuspenseBoundary({ id: 'suspense' }, () => {
      // @ts-ignore pass mocked promise to have more control over it
      suspend(() => promise)

      fun()
    })
  })

  WorkingTree.performInitialRender()

  promise.resolve(1)
  WorkingTree.performUpdate()

  expect(fun).toHaveBeenCalledTimes(1)
})

test('changing suspend dependency should suspend again', () => {
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
        const susVal = suspend(() => promise, val)

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

  // sideEffect triggered, causing update which should suspend again
  WorkingTree.performUpdate()

  // unsuspend rendering
  promise.resolve(1)
  WorkingTree.performUpdate()

  expect(fun).toHaveBeenCalledTimes(2)
  expect(fallback).toHaveBeenCalledTimes(2)
})

test('updating parent withoud changing suspend dependency should not suspend again', () => {
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
        const susVal = suspend(() => promise)

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

  // sideEffect triggered, causing update
  WorkingTree.performUpdate()

  expect(fun).toHaveBeenCalledTimes(2)
  expect(fallback).toHaveBeenCalledTimes(1)
})
