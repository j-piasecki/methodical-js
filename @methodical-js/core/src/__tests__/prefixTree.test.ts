import { PrefixTree } from '../PrefixTree'

test('empty tree returns no paths', () => {
  const tree = new PrefixTree()
  const paths = tree.getPaths()
  expect(paths.length).toBe(0)
})

test('tree correctly handles one node', () => {
  const tree = new PrefixTree()
  tree.addPath(['a'])
  const paths = tree.getPaths()

  expect(paths).toEqual([['a']])
})

test('tree returns the same path that was added to it', () => {
  const tree = new PrefixTree()
  tree.addPath(['a', 'b', 'c'])
  const paths = tree.getPaths()

  expect(paths).toEqual([['a', 'b', 'c']])
})

test('tree returns the shortest path', () => {
  const tree = new PrefixTree()
  tree.addPath(['a', 'b', 'c', 'd', 'e'])
  tree.addPath(['a', 'b', 'c'])
  tree.addPath(['a', 'b'])
  const paths = tree.getPaths()

  expect(paths).toEqual([['a', 'b']])
})

test('tree returns all paths', () => {
  const tree = new PrefixTree()
  tree.addPath(['a', 'b', 'c', 'd', 'e'])
  tree.addPath(['a', 'b', 'c', 'f', 'g'])
  tree.addPath(['a', 'h'])
  const paths = tree.getPaths()

  expect(paths).toEqual([
    ['a', 'b', 'c', 'd', 'e'],
    ['a', 'b', 'c', 'f', 'g'],
    ['a', 'h'],
  ])
})

test('tree correctly returns a subtree at path', () => {
  const tree = new PrefixTree()
  tree.addPath(['a', 'b', 'c', 'd', 'e'])
  tree.addPath(['a', 'b', 'c'])
  const subtree = tree.findNodeAtPath(['a', 'b', 'c'])

  expect(subtree).not.toBeUndefined()
  expect(subtree!.getPaths()).toEqual([['c', 'd', 'e']])
})

test('tree gets cleared correctly', () => {
  const tree = new PrefixTree()
  tree.addPath(['a', 'b', 'c'])
  tree.clear()
  const paths = tree.getPaths()

  expect(paths).toEqual([])
})
