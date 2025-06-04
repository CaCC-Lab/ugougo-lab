import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppFull from './App-full.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppFull />
  </StrictMode>,
)
