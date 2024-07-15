import { createBoundary } from '@methodical-js/core'
import { Div, Input, on, remember } from '@methodical-js/web'

let counter = 0

const COUNT = 5
const LEVELS = 8

const stateUpdater = createBoundary(() => {
  const counter = remember(0)

  Input({ id: 'input', value: `Increment (${counter.value})`, type: 'button' }, () => {
    on('click', () => {
      counter.value++
    })
  })
})

function RecusiveDivs(index: number, count: number, levels: number, first: boolean) {
  counter++
  if (levels === 0) {
    if (index === 0 && levels == 0 && first) {
      stateUpdater({ id: `state-updater-${index}` })
    }
    return
  }
  Div(
    {
      id: `div-${index}-${levels}`,
      style: {
        width: '1px',
        height: '1px',
        backgroundColor: 'red',
      },
    },
    () => {
      for (let i = 0; i < count; i++) {
        RecusiveDivs(i, count, levels - 1, first && i === 0)
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
      const localCounter = remember(0)

      Input({ id: 'input', value: render.value ? 'Clear' : 'Start', type: 'button' }, () => {
        on('click', () => {
          render.value = !render.value
        })
      })

      Input(
        { id: 'input', value: `Root-level counter: ${localCounter.value}`, type: 'button' },
        () => {
          on('click', () => {
            localCounter.value++
          })
        }
      )

      if (render.value) {
        counter = 0
        RecusiveDivs(0, COUNT, LEVELS, true)
        console.log('Called', counter)
      }
    }
  )
}
