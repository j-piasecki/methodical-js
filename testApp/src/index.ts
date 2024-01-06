import Methodical, { remember, Div } from '@methodical-js/web'

Div({
  id: 'test',
  style: {width: '500px', height: '500px', backgroundColor: 'red'},
}, () => {
  const backgroundColor = remember('blue')

  Div({
    id: 'test2',
    style: {width: '300px', height: '300px', backgroundColor: backgroundColor.value},
    onClick: () => {
      if (backgroundColor.value === 'blue') {
        backgroundColor.value = 'green'
      } else {
        backgroundColor.value = 'blue'
      }
    }
  })
})

Methodical.init(document.getElementById('app')!)