import Methodical, { remember, Div } from '@methodical-js/web'

Div(
  {
    id: 'test',
    style: { width: '500px', height: '500px', backgroundColor: 'red' },
  },
  () => {
    const backgroundColor = remember('blue')

    Div({
      id: 'test2',
      style: { width: '300px', height: '300px', backgroundColor: backgroundColor.value },
      onClick: () => {
        if (backgroundColor.value === 'blue') {
          backgroundColor.value = 'green'
        } else {
          backgroundColor.value = 'blue'
        }
      },
    })

    Div({
      id: 'test3',
      style: { width: '200px', height: '200px', backgroundColor: 'magenta' },
      pure: true,
    }, () => {
      console.log('test3 execute')
      Div({
        id: 'test4',
        style: { width: '100px', height: '100px', backgroundColor: 'yellow' },
      }, () => {
        console.log('test4 execute')
      })
    })
  }
)

Methodical.init(document.getElementById('app')!)
