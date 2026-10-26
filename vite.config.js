import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    // Las páginas se cargan por partes, pero el CSS sigue en un solo archivo, igual que
    // antes: así el orden de las reglas no cambia y ninguna página se ve distinta según
    // por dónde se haya entrado al sitio.
    cssCodeSplit: false,
  },
})