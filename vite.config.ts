import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import mkcert from 'vite-plugin-mkcert'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const PRODUCTION = mode === 'production'
  // Превью-браузер не доверяет self-signed серту mkcert — даём отключить https.
  const httpsDisabled = process.env.PREVIEW_HTTP === '1'

  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          dimensions: true,
          svgo: false,
        },
        include: '**/*.svg',
      }),
      !httpsDisabled && mkcert(),
      createHtmlPlugin({
        inject: {
          data: {
            title: 'Держимся',
            PRODUCTION,
          },
        },
      }),
    ],
    resolve: {
      // motion (peer react-modal-sheet) тянул вторую копию React → «Invalid hook call»
      dedupe: ['react', 'react-dom'],
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
        '@contracts': fileURLToPath(new URL('./contracts', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [fileURLToPath(new URL('./src', import.meta.url))],
        },
      },
    },
  }
})
