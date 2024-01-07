import { ViewNode, WorkingNode, WorkingTree } from '@methodical-js/core'

export const remember = <T>(value: T) => {
  const rememberedNode = WorkingTree.createRememberNode(value)
  return rememberedNode.value
}

export const sideEffect = (effect: () => void, ...dependencies: unknown[]) => {
  return WorkingTree.createEffectNode(effect, dependencies)
}

function isViewNode(node: WorkingNode): node is ViewNode {
  return node.type === 'View'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const canvas: any = document.getElementById('canvas')!
const ctx = canvas.getContext('2d')!

const Methodical = {
  init: (rootView: HTMLElement) => {
    WorkingTree.setRootViewReference(rootView)
    WorkingTree.performInitialRender()

    function render() {
      WorkingTree.performUpdate()

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const node of WorkingTree.root.children) {
        if (isViewNode(node)) {
          // @ts-ignore
          node.viewManager.render?.(node, ctx)
        }
      }

      requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
  },
}

const RectViewManager = {
  createView: (node: ViewNode) => {},
  dropView: (node: ViewNode) => {},
  updateView: (oldNode: ViewNode, newNode: ViewNode) => {},
  render: (node: ViewNode, ctx: CanvasRenderingContext2D) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = node.config as any

    ctx.save()
    ctx.translate(config.x, config.y)

    ctx.fillStyle = config.color
    ctx.fillRect(0, 0, config.width, config.height)

    for (const child of node.children) {
      if (isViewNode(child)) {
        // @ts-ignore
        child.viewManager.render?.(child, ctx)
      }
    }

    ctx.restore()
  },
}

const Rect = (
  config: { id: string; x: number; y: number; width: number; height: number; color: string },
  body?: () => void
) => {
  const view = WorkingTree.createViewNode(config, RectViewManager, body)
  return view
}

const YSortViewManager = {
  createView: (node: ViewNode) => {},
  dropView: (node: ViewNode) => {},
  updateView: (oldNode: ViewNode, newNode: ViewNode) => {},
  render: (node: ViewNode, ctx: CanvasRenderingContext2D) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = node.config as any

    ctx.save()
    ctx.translate(config.x ?? 0, config.y ?? 0)

    for (const child of node.children.filter(isViewNode).sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aConfig = a.config as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bConfig = b.config as any

      return aConfig.y - bConfig.y
    })) {
      if (isViewNode(child)) {
        // @ts-ignore
        child.viewManager.render?.(child, ctx)
      }
    }

    ctx.restore()
  },
}

const YSort = (config: { id: string; x?: number; y?: number }, body?: () => void) => {
  const view = WorkingTree.createViewNode(config, YSortViewManager, body)
  return view
}

YSort({ id: 'root' }, () => {
  const yellowY = remember(30)

  sideEffect(() => {
    setTimeout(() => {
      yellowY.value = yellowY.value === 30 ? 10 : 30
    }, 250)
  }, yellowY.value)

  Rect({ id: 'rect1', x: 0, y: 20, width: 100, height: 100, color: 'red' })
  Rect({ id: 'rect2', x: 50, y: yellowY.value, width: 100, height: 100, color: 'yellow' })
})

Methodical.init(document.getElementById('canvas')!)
