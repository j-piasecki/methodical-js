import Methodical from '../index'
import { WorkingTree } from '@methodical-js/core'

test('Check that the root view reference is set correctly', () => {
  const dummyRoot = document.createElement('div')

  Methodical.init(dummyRoot)

  expect(WorkingTree.root.viewReference).toBe(dummyRoot)
})
