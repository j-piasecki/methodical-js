import { BaseConfig, SuspenseBoundary, createBoundary, defer, suspend } from '@methodical-js/core'
import Methodical, { remember, Div, on, Text } from '@methodical-js/web'
import { Tracing } from '@methodical-js/core'

const saveTemplateAsFile = (filename: string, dataObjToWrite: any) => {
  const blob = new Blob([JSON.stringify(dataObjToWrite)], { type: 'text/json' })
  const link = document.createElement('a')

  link.download = filename
  link.href = window.URL.createObjectURL(blob)
  link.dataset.downloadurl = ['text/json', link.download, link.href].join(':')

  const evt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  })

  link.dispatchEvent(evt)
  link.remove()
}

const Test = createBoundary((config: BaseConfig, test: string) => {
  console.log('Test', test)
})

function Squares() {
  Div(
    {
      id: 'test',
      style: { width: '500px', height: '500px', backgroundColor: 'red' },
    },
    () => {
      const backgroundColor = remember('blue')
      const innerBackgroundColor = remember('red')

      Text({ id: 'text', value: backgroundColor.value })
      Div(
        {
          id: 'test2',
          style: { width: '300px', height: '300px', backgroundColor: backgroundColor.value },
        },
        () => {
          const bg = backgroundColor.value
          on(
            'click',
            () => {
              if (bg === 'blue') {
                backgroundColor.value = 'green'
              } else {
                backgroundColor.value = 'blue'
              }
            },
            bg
          )

          if (backgroundColor.value === 'blue') {
            Div(
              {
                id: 'test5',
                style: {
                  width: '100px',
                  height: '100px',
                  backgroundColor: innerBackgroundColor.value,
                },
              },
              () => {
                on('click', (e: any) => {
                  e.stopPropagation()
                  // if (innerBackgroundColor.value === 'red') {
                  //   innerBackgroundColor.value = 'magenta'
                  // } else {
                  //   innerBackgroundColor.value = 'red'
                  // }

                  if (Tracing.enabled) {
                    const trace = Tracing.stop()

                    saveTemplateAsFile('trace.json', trace)
                  } else {
                    Tracing.start()
                  }
                })

                Test({ id: 'test6' }, 'napis')
              }
            )
          }
        }
      )

      Div(
        {
          id: 'test3',
          style: { width: '200px', height: '200px', backgroundColor: 'magenta' },
          pure: true,
        },
        () => {
          console.log('test3 execute')
          Div(
            {
              id: 'test4',
              style: { width: '100px', height: '100px', backgroundColor: 'yellow' },
            },
            () => {
              console.log('test4 execute')
            }
          )
        }
      )
    }
  )
}

let suspenseCounter = 0
let deferCounter = 0

function fetchSuspend() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(suspenseCounter++)
    }, 2000)
  })
}

function fetchDefer() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(deferCounter++)
    }, 2000)
  })
}

function SuspendTest() {
  Div(
    {
      id: 'root',
      style: {
        width: '1200px',
        height: '500px',
      },
    },
    () => {
      Div(
        {
          id: 'suspendcontainer',
          style: {
            width: '1200px',
            height: '250px',
            backgroundColor: 'yellow',
          },
        },
        () => {
          const dataId = remember(0)
          SuspenseBoundary(
            { id: 'suspense' },
            () => {
              const value = suspend(fetchSuspend, dataId.value)
              Text({ id: 'value', value: `currentValue: ${value}` })

              Div(
                {
                  id: 'button',
                  style: {
                    width: '100px',
                    height: '50px',
                    backgroundColor: 'red',
                  },
                },
                () => {
                  on('click', () => {
                    dataId.value++
                  })

                  Text({ id: 'text', value: 'fetch next' })
                }
              )
            },
            () => {
              Text({ id: 'fallback', value: 'Suspended' })
            }
          )
        }
      )

      Div(
        {
          id: 'defercontainer',
          style: {
            width: '1200px',
            height: '250px',
            backgroundColor: 'yellow',
          },
        },
        () => {
          SuspenseBoundary(
            { id: 'suspense' },
            () => {
              const dataId = remember(0)
              const value = defer(fetchDefer, dataId.value)
              Text({ id: 'value', value: `currentValue: ${value}` })
              Div(
                {
                  id: 'button',
                  style: {
                    width: '100px',
                    height: '50px',
                    backgroundColor: 'red',
                  },
                },
                () => {
                  on('click', () => {
                    dataId.value++
                  })
                  Text({ id: 'text', value: 'fetch next' })
                }
              )
            },
            () => {
              Text({ id: 'fallback', value: 'Suspended' })
            }
          )
        }
      )
    }
  )
}

Div({ id: 'app' }, () => {
  const showSquares = remember(true)

  Div(
    {
      id: 'switcher',
      style: {
        width: '100px',
        height: '50px',
        backgroundColor: 'blue',
      },
    },
    () => {
      on('click', () => {
        showSquares.value = !showSquares.value
      })

      Text({ id: 'text', value: 'Show the other thing' })
    }
  )

  if (showSquares.value) {
    Squares()
  } else {
    SuspendTest()
  }
})

Methodical.init(document.getElementById('app')!)
