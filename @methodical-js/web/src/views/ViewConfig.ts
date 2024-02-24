import { BaseConfig } from '@methodical-js/core'

declare module '@methodical-js/core' {
  interface BaseConfig {
    /** @internal */
    __viewType?: string
  }
}

export interface ViewConfig extends BaseConfig {
  className?: string
  style?: Partial<CSSStyleDeclaration>
}
