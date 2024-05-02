import { ViewNode } from '@methodical-js/core'

export type RenderFunction = (node: ViewNode, ctx: CanvasRenderingContext2D) => void

export interface WithPosition {
  position: { x: number; y: number }
}

export interface WithSize {
  size: { width: number; height: number }
}
