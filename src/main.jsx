
import { createRoot } from 'react-dom/client'
import './index.css'
import './estilos.js'
import App from './App.jsx'

// Después de un deploy, quien tenía el sitio abierto pide archivos de páginas que ya no
// existen (cambian de nombre en cada build). En ese caso se recarga una vez para traer la
// versión nueva; si falla de nuevo dentro de los 10 segundos, no se insiste (evita un bucle).
window.addEventListener('vite:preloadError', (event) => {
  let ultima = 0
  try {
    ultima = Number(sessionStorage.getItem('recarga-por-deploy')) || 0
  } catch {
    // sin sessionStorage: se recarga igual
  }
  if (Date.now() - ultima < 10000) return
  try {
    sessionStorage.setItem('recarga-por-deploy', String(Date.now()))
  } catch {
    // sin sessionStorage
  }
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
    <App />
)
