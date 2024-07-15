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

const RecusiveDivs = createBoundary<{
  id: string
  index: number
  count: number
  levels: number
  first: boolean
}>(({ index, count, levels, first }) => {
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
        RecusiveDivs({
          id: `${i}-${levels}`,
          index: i,
          count,
          levels: levels - 1,
          first: first && i === 0,
        })
      }
    }
  )
})

export function StressTestBoundary() {
  Div(
    {
      id: 'stresstest',
      style: {
        width: '100%',
        height: '500px',
        backgroundColor: 'orange',
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
        RecusiveDivs({ id: 'root', index: 0, count: COUNT, levels: LEVELS, first: true })
        console.log('Called', counter)
      }
    }
  )
}
