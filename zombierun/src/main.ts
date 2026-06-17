import './style.css'
import { App } from './app/app.ts'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('sw.js')
  })
}

const root = document.querySelector<HTMLDivElement>('#app')
if (root) {
  new App(root)
}
