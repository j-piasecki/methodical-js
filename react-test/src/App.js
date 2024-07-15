import React from 'react'
import { StressTest } from './StressTest'

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

function ExamplePicker({ setExample }) {
  return (
    <div>
      <button onClick={() => setExample('stress')}>Stress Test</button>
    </div>
  )
}

function Example({ example }) {
  if (example === 'stress') {
    return <StressTest />
  }

  return null
}

function App() {
  const [example, setExample] = React.useState('')

  return (
    <div className="App">
      <ExamplePicker setExample={setExample} />
      <Example example={example} />
    </div>
  )
}

export default App
