import { BaseConfig } from '@methodical-js/core'

export interface ViewConfig extends BaseConfig {
  /** @internal */
  __viewType: string

  className?: string
  style?: Partial<CSSStyleDeclaration>
}
