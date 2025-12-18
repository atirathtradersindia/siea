import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css' // Bootstrap
import './index.css' // Tailwind (prefixed as tw-)
import App from './App'
import "@fortawesome/fontawesome-free/css/all.min.css";
import { LanguageProvider } from './contexts/LanguageContext';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
)
