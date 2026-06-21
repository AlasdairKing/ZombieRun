import './style.css'
import { App } from './app/app.ts'

if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // Dev server modules must not be cached — unregister any stale SW from prior visits
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) void reg.unregister()
    })
    void caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  } else {
    window.addEventListener('load', () => {
      void navigator.serviceWorker.register('sw.js')
    })
  }
}

const root = document.querySelector<HTMLDivElement>('#app')
if (root) {
  new App(root)
}
