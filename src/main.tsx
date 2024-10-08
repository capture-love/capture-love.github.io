import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './styles/main.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
