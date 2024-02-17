import { BaseConfig, createBoundary } from '@methodical-js/core'
import Methodical, { remember, Div, on } from '@methodical-js/web'
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

Div(
  {
    id: 'test',
    style: { width: '500px', height: '500px', backgroundColor: 'red' },
  },
  () => {
    const backgroundColor = remember('blue')
    const innerBackgroundColor = remember('red')

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

Methodical.init(document.getElementById('app')!)
