import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { spy } from 'mobx';
import { StoreProvider } from './stores';
import App from './App';
import './index.css';

// MobX debugging in development
if (import.meta.env.DEV) {
  spy((event) => {
    if (event.type === 'action') {
      console.log(`[MobX] ${event.name}`, event.arguments);
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>
);
