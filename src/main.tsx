import { createRoot } from 'react-dom/client'

import { App } from '~/app/App'
import { AppProvider } from '~/app/AppProvider'

import '~/shared/styles/global.scss'

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <App />
  </AppProvider>,
)
