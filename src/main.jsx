import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import pkg from '../package.json'

// Professional Console Logging
console.log(
  `%c Media Project Manager %c v${pkg.version} %c`,
  'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
  'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
  'background:transparent'
);
console.log(`%c🚀 Environment: ${import.meta.env.MODE}`, 'color: #41b883; font-weight: bold;');
console.log(`%c📅 Build Date: ${new Date().toLocaleDateString('de-DE')}`, 'color: #888;');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
