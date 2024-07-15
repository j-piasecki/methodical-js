import { createApp } from 'vue'
import App from './App.vue'

console.log('Vue test')
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

createApp(App).mount('#app')
