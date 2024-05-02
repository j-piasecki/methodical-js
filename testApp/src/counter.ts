import { Div, Button, Text, on, remember } from '@methodical-js/web'

function Counter(startValue: number) {
  Div({ id: 'counter' }, () => {
    const count = remember(startValue)

    Button({ id: 'increment', type: 'button' }, () => {
      on('click', () => {
        count.value++
      })

      Text({ id: 'label', value: 'Increment' })
    })

    Button({ id: 'decrement', type: 'button' }, () => {
      on('click', () => {
        count.value--
      })

      Text({ id: 'label', value: 'Decrement' })
    })

    Button({ id: 'reset', type: 'button' }, () => {
      on('click', () => {
        count.value = startValue
      })

      Text({ id: 'label', value: 'Reset' })
    })

    Text({ id: 'count', value: `Current count: ${count.value}` })
  })
}

export const CounterExample = () => Counter(2)
