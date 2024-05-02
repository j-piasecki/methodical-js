import { WorkingTree, createAmbient, readAmbient, remember, sideEffect } from '../index'
import { createViewFunction, createViewManager } from './utils'

jest.useFakeTimers()

beforeEach(() => {
  WorkingTree.reset()
})

test('readAmbient should not queue update on first read', () => {
  const viewManager = createViewManager({ createView: jest.fn() })
  const View = createViewFunction(viewManager)

  const TestAmbient = createAmbient<string>('test')

  View({ id: 'test' }, () => {
    TestAmbient({ id: 'ambient', value: 'xyz' }, () => {
      const value = readAmbient(TestAmbient)
    })
  })

  WorkingTree.performInitialRender()

  expect(WorkingTree.hasPendingUpdate).toBe(false)
})

test('readAmbient should return initial value of Ambient', () => {
  const viewManager = createViewManager({ createView: jest.fn() })
  const View = createViewFunction(viewManager)

  const TestAmbient = createAmbient<string>('test')

  View({ id: 'test' }, () => {
    TestAmbient({ id: 'ambient', value: 'xyz' }, () => {
      const value = readAmbient(TestAmbient)

      expect(value).toBe('xyz')

      View({ id: 'child' }, () => {
        const value = readAmbient(TestAmbient)

        expect(value).toBe('xyz')
      })
    })
  })

  WorkingTree.performInitialRender()
})

test('readAmbient should perform update on ambient value change', () => {
  const viewManager = createViewManager({ createView: jest.fn() })
  const View = createViewFunction(viewManager)

  const TestAmbient = createAmbient<string>('test')

  const fn = jest.fn()

  View({ id: 'test' }, () => {
    const remembered = remember('xyz')
    TestAmbient({ id: 'ambient', value: remembered.value }, () => {
      // we mark it pure, so it dosn't get updated by remembered.value change
      View({ id: 'child', pure: true }, () => {
        const value = readAmbient(TestAmbient)

        fn()

        sideEffect(() => {
          setTimeout(() => {
            remembered.value = 'abc'
          }, 1000)
        })
      })
    })
  })

  WorkingTree.performInitialRender()

  jest.runOnlyPendingTimers()

  expect(WorkingTree.hasPendingUpdate).toBe(true)
  WorkingTree.performUpdate()

  expect(fn).toHaveBeenCalledTimes(2)
})
