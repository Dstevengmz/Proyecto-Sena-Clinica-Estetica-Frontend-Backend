import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-phone-input-2/lib/style.css';
import 'sweetalert2/dist/sweetalert2.min.css';






createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
