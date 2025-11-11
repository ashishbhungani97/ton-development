import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TonConnectUIProvider } from '@tonconnect/ui-react'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TonConnectUIProvider
      manifestUrl="https://ton-development.netlify.app/tonconnect-manifest.json"
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/ashishton99_bot'
      }}
    >
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
)
