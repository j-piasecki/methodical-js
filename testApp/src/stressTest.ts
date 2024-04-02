import { createBoundary } from '@methodical-js/core'
import { Div, Input, on, remember } from '@methodical-js/web'

let counter = 0
let stateful = false

const stateUpdater = createBoundary(() => {
  const counter = remember(0)

  Input({ id: 'input', value: `Increment (${counter.value})`, type: 'button' }, () => {
    on('click', () => {
      counter.value++
    })
  })
})

function RecusiveDivs(index: number, count: number, levels: number) {
  if (levels === 0) {
    if (stateful) {
      stateful = false
      stateUpdater({ id: `state-updater-${index}` })
    }
    return
  }
  counter++
  Div(
    {
      id: `div-${index}-${levels}`,
      style: {
        width: '1px',
        height: '1px',
        backgroundColor: index % 2 === 0 ? 'red' : 'blue',
      },
    },
    () => {
      for (let i = 0; i < count; i++) {
        RecusiveDivs(i, count, levels - 1)
      }
    }
  )
}

export function StressTest() {
  Div(
    {
      id: 'stresstest',
      style: {
        width: '100%',
        height: '500px',
        backgroundColor: 'yellow',
      },
    },
    () => {
      const render = remember(false)

      Input({ id: 'input', value: render.value ? 'Clear' : 'Start', type: 'button' }, () => {
        on('click', () => {
          render.value = !render.value
        })
      })

      if (render.value) {
        counter = 0
        stateful = true
        RecusiveDivs(0, 5, 8)
        console.log('Rendered', counter)
      }
    }
  )
}
