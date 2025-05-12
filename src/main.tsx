import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { FPSDisplay } from './FPSDisplay'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
        <FPSDisplay />
    </StrictMode>,
)
