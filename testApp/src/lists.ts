import { Div, ListItem, OrderedList, UnorderedList, Text } from '@methodical-js/web'

export function Lists() {
  Div(
    {
      id: 'root',
      style: {
        width: '100%',
        height: '500px',
        display: 'flex',
        flexDirection: 'row',
      },
    },
    () => {
      OrderedList({ id: 'olist' }, () => {
        for (let i = 0; i < 10; i++) {
          ListItem({ id: `item-${i}`, value: i + 1 }, () => {
            Text({ id: `text`, value: `Item ${i}` })
          })
        }
      })

      UnorderedList({ id: 'olist' }, () => {
        for (let i = 0; i < 10; i++) {
          ListItem({ id: `item-${i}`, value: i + 1 }, () => {
            Text({ id: `text`, value: `Item ${i}` })
          })
        }
      })
    }
  )
}
