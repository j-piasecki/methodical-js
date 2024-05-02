import { ViewNode, WorkingNode, WorkingTree } from '@methodical-js/core'

declare module '@methodical-js/core' {
  interface ViewNodeManager {
    render(node: ViewNode, ctx: CanvasRenderingContext2D): void
  }
}

function isViewNode(node: WorkingNode): node is ViewNode {
  return node.type === 'View'
}

const Methodical = {
  init: (canvas: HTMLCanvasElement) => {
    WorkingTree.setRootViewReference(canvas)
    WorkingTree.performInitialRender()

    const ctx = canvas.getContext('2d')!

    function render() {
      WorkingTree.performUpdate()

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const node of WorkingTree.root.children) {
        if (isViewNode(node)) {
          node.viewManager?.render?.(node, ctx)
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
        child.viewManager?.render?.(child, ctx)
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
        child.viewManager?.render?.(child, ctx)
      }
    }

    ctx.restore()
  },
}

const YSort = (config: { id: string; x?: number; y?: number }, body?: () => void) => {
  const view = WorkingTree.createViewNode(config, YSortViewManager, body)
  return view
}

export default Methodical

export { Rect, YSort }
