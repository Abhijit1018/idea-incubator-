import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { warmupBackend } from './lib/api'

// Start booting the (possibly cold) backend immediately, while the user reads
// the first screen. By the time they act, the server is usually already warm.
warmupBackend()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
