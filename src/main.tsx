import { createRoot } from 'react-dom/client';
import './editor/fonts';
import './i18n';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  // No StrictMode: its double mount would create the Fabric canvas twice on one element.
  <App />
);
