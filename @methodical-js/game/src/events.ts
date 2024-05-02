const handlers: { [name: string]: { [target: string]: ((event: unknown) => void)[] } } = {}

export function registerHandler(target: string, name: string, handler: (event: unknown) => void) {
  handlers[name] = handlers[name] || {}
  handlers[name][target] = handlers[name][target] || []
  handlers[name][target].push(handler)
}

export function unregisterHandler(target: string, name: string, handler: (event: unknown) => void) {
  const targetHandlers = handlers[name]?.[target]
  if (targetHandlers) {
    const index = targetHandlers.indexOf(handler)
    if (index !== -1) {
      targetHandlers.splice(index, 1)
    }
  }
}

export function updateHandler(
  target: string,
  name: string,
  newHandler: (event: unknown) => void,
  oldHandler: (event: unknown) => void
) {
  const targetHandlers = handlers[name]?.[target]
  if (targetHandlers) {
    const index = targetHandlers.indexOf(oldHandler)
    if (index !== -1) {
      targetHandlers[index] = newHandler
    }
  }
}

export function dispatchEvent(target: string, name: string, event: unknown) {
  if (target === '#') {
    // a special case where event is dispatched to all handlers
    for (const targetHandlers of Object.values(handlers[name] || {})) {
      for (const handler of targetHandlers) {
        handler(event)
      }
    }
  } else {
    const targetHandlers = handlers[name]?.[target]
    if (targetHandlers) {
      for (const handler of targetHandlers) {
        handler(event)
      }
    }
  }
}

const pressedKeys = new Set<string>()

export function setupDOMHandlers(canvas: HTMLCanvasElement) {
  canvas.tabIndex = 1

  canvas.addEventListener('keydown', (e) => {
    pressedKeys.add(e.key)
  })

  canvas.addEventListener('keyup', (e) => {
    pressedKeys.delete(e.key)
  })
}

export function dispatchContinousEvents() {
  for (const key of pressedKeys) {
    dispatchEvent('#', 'key', { key })
  }
}
