const THREAD_BUILD = 0
const THREAD_RENDER = 1

export class Tracing {
  private static _enabled = false
  private static trace: Record<string, unknown> = {}

  public static get enabled() {
    return this._enabled
  }

  // @internal
  public static traceBuild(
    name: string,
    timestamp: number,
    duration: number,
    args?: Record<string, unknown>
  ) {
    this.addTrace(name, timestamp, duration, THREAD_BUILD, args)
  }

  // @internal
  public static traceRender(
    name: string,
    timestamp: number,
    duration: number,
    args?: Record<string, unknown>
  ) {
    this.addTrace(name, timestamp, duration, THREAD_RENDER, args)
  }

  private static addTrace(
    name: string,
    timestamp: number,
    duration: number,
    thread: number,
    args?: Record<string, unknown>
  ) {
    if (this._enabled) {
      // @ts-ignore
      this.trace.traceEvents.push({
        name,
        ts: timestamp * 1000,
        dur: duration * 1000,
        pid: 0,
        tid: thread,
        ph: 'X',
        args,
      })
    }
  }

  public static start() {
    this._enabled = true
    this.trace = {
      traceEvents: [
        {
          name: 'process_name',
          ph: 'M',
          pid: 0,
          args: { name: 'Methodical' },
        },
        {
          name: 'thread_name',
          ph: 'M',
          pid: 0,
          tid: THREAD_BUILD,
          args: { name: 'Build phase' },
        },
        {
          name: 'thread_name',
          ph: 'M',
          pid: 0,
          tid: THREAD_RENDER,
          args: { name: 'Render phase' },
        },
      ],
    }

    console.log('Tracing started')
  }

  public static stop() {
    this._enabled = false
    console.log('Tracing stopped')

    const trace = this.trace
    this.trace = {}
    return trace
  }
}
