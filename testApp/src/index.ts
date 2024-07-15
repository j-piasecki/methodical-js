import { BaseConfig, createBoundary } from '@methodical-js/core'
import Methodical, {
  remember,
  Div,
  on,
  Text,
  Navigator,
  Route,
  getNavigation,
} from '@methodical-js/web'
import { Tracing } from '@methodical-js/core'
import { Home } from './home'
import { Suspense } from './suspense'
import { StressTestFlat } from './stressTestFlat'
import { StressTestBoundary } from './stressTestBoundary'
import { Lists } from './lists'
import { CounterExample } from './counter'

interface Example {
  name: string
  component: () => void
}

const EXAMPLES: Example[] = [
  { name: 'Home', component: Home },
  { name: 'Suspense', component: Suspense },
  { name: 'StressTestFlat', component: StressTestFlat },
  { name: 'StressTestBoundary', component: StressTestBoundary },
  { name: 'Lists', component: Lists },
  { name: 'Counter', component: CounterExample },
]

let time = performance.now()
function animationFrame() {
  const now = performance.now()
  const passed = now - time
  if (passed > 30) {
    console.log('Frame time:', now - time)
  }
  time = now
  requestAnimationFrame(animationFrame)
}

requestAnimationFrame(animationFrame)

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

const TracingButton = createBoundary(() => {
  const tracingEnabled = remember(false)

  Div(
    {
      id: 'tracing-button',
      style: {
        width: '100%',
        padding: '8px',
        marginBottom: '8px',
        backgroundColor: tracingEnabled.value ? '#d00' : '#0d0',
        borderRadius: '8px',
        boxSizing: 'border-box',
      },
    },
    () => {
      on('click', () => {
        tracingEnabled.value = !Tracing.enabled

        if (Tracing.enabled) {
          const trace = Tracing.stop()
          saveTemplateAsFile('trace.json', trace)
        } else {
          Tracing.start()
        }
      })

      Text({ id: 'text', value: tracingEnabled.value ? 'Stop Tracing' : 'Start Tracing' })
    }
  )
})

interface ButtonConfig extends BaseConfig {
  text: string
  onClick: () => void
}

const NavButton = createBoundary((config: ButtonConfig) => {
  Div(
    {
      id: 'button',
      style: {
        width: '100%',
        padding: '8px',
        marginBottom: '8px',
        backgroundColor: '#ddd',
        borderRadius: '8px',
        boxSizing: 'border-box',
      },
    },
    () => {
      on('click', config.onClick)
      Text({ id: 'text', value: config.text })
    }
  )
})

Div({ id: 'root', style: { display: 'flex', flexDirection: 'row' } }, () => {
  const navigation = getNavigation()

  Div(
    {
      id: 'navbar',
      style: {
        width: '200px',
        padding: '8px',
      },
    },
    () => {
      TracingButton({ id: 'tracing' })

      for (const example of EXAMPLES) {
        NavButton({
          id: example.name.toLowerCase(),
          text: example.name,
          onClick: () => navigation.navigate(`/${example.name.toLowerCase()}`),
        })
      }
    }
  )

  Div({ id: 'content', style: { flexGrow: '1' } }, () => {
    Navigator('/', () => {
      Route('/', () => {
        Text({
          id: 'welcome',
          value:
            'Welcome to the Methodical Web Test App! Select an example from the list on the left.',
        })
      })

      for (const example of EXAMPLES) {
        Route(`/${example.name.toLowerCase()}`, example.component)
      }
    })
  })
})

Methodical.init(document.getElementById('app')!)
