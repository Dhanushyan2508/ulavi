import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { setupServiceWorker } from './pwa/ServiceWorkerSetup'

import { ToastProvider } from './context/ToastContext'
import { TemplateProvider } from './context/TemplateContext'

setupServiceWorker()
import './utils/testParsing'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <TemplateProvider>
        <App />
      </TemplateProvider>
    </ToastProvider>
  </StrictMode>,
)
