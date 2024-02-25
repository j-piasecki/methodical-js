import { createBoundary, BaseConfig, remember } from '@methodical-js/core'
import { Div, Text, on } from '@methodical-js/web'

const Test = createBoundary((config: BaseConfig, test: string) => {
  console.log('Test', test)
})

export function Home() {
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
