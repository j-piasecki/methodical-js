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

const defaultBlacklist: (keyof ViewConfig)[] = ['__viewType', 'id', 'pure']

export function applyInitialConfig<T extends ViewConfig>(
  view: HTMLElement,
  config: T,
  blacklist: (keyof T)[] = []
) {
  for (const key in config) {
    // @ts-expect-error yes, defaultBlacklist has a different type than keyof T, that's the point
    if (blacklist.includes(key) || defaultBlacklist.includes(key)) {
      continue
    }

    if (key === 'style') {
      Object.assign(view.style, config.style)
    } else {
      // @ts-expect-error assign config properties to view
      view[key] = config[key]
    }
  }
}

export function applyUpdatedConfig<T extends ViewConfig>(
  view: HTMLElement,
  oldConfig: T,
  newConfig: T,
  blacklist: (keyof T)[] = []
) {
  for (const key in newConfig) {
    // @ts-expect-error yes, defaultBlacklist has a different type than keyof T, that's the point
    if (blacklist.includes(key) || defaultBlacklist.includes(key)) {
      continue
    }

    if (key === 'style') {
      Object.assign(view.style, newConfig.style)
    } else {
      // @ts-expect-error assign config properties to view
      view[key] = newConfig[key]
    }
  }

  // check for removed properties
  for (const key in oldConfig) {
    // @ts-expect-error yes, defaultBlacklist has a different type than keyof T, that's the point
    if (blacklist.includes(key) || defaultBlacklist.includes(key)) {
      continue
    }

    if (!(key in newConfig)) {
      if (key === 'style') {
        Object.assign(view.style, undefined)
      } else {
        // @ts-expect-error assign config properties to view
        view[key] = undefined
      }
    }
  }
}
