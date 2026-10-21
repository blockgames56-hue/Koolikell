import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElem = document.getElementById('root');
if (rootElem) {
  createRoot(rootElem).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
