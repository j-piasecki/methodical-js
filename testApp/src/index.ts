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
import { StressTest } from './stressTest'

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
      NavButton({ id: 'home', text: 'Home', onClick: () => navigation.navigate('/') })
      NavButton({
        id: 'suspense',
        text: 'Suspense',
        onClick: () => navigation.navigate('/suspense'),
      })
      NavButton({
        id: 'stresstest',
        text: 'StressTest',
        onClick: () => navigation.navigate('/stress'),
      })
    }
  )

  Div({ id: 'content', style: { flexGrow: '1' } }, () => {
    Navigator('/', () => {
      Route('/', Home)
      Route('/suspense', Suspense)
      Route('/stress', StressTest)
    })
  })
})

Methodical.init(document.getElementById('app')!)
