import Methodical from '../index'
import { WorkingTree } from '@methodical-js/core'

test('root view reference should be set correctly after initialization', () => {
  const dummyRoot = document.createElement('canvas')

  Methodical.init(dummyRoot)

  expect(WorkingTree.root.viewReference).toBe(dummyRoot)
})
