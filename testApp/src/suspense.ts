import { remember, SuspenseBoundary, suspend, defer } from '@methodical-js/core'
import { Div, Text, on } from '@methodical-js/web'

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

export function Suspense() {
  Div(
    {
      id: 'root',
      style: {
        width: '100%',
        height: '500px',
      },
    },
    () => {
      Div(
        {
          id: 'suspendcontainer',
          style: {
            width: '100%',
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
            width: '100%',
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
