import { WorkingTree } from '../index'
import { createViewFunction, createViewManager } from './utils'

test('performInitialRender should call createView of ViewManager', () => {
  const viewManager = createViewManager({ createView: jest.fn() })
  const View = createViewFunction(viewManager)

  View({ id: 'test' })

  WorkingTree.performInitialRender()

  expect(viewManager.createView).toHaveBeenCalled()
})
