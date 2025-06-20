import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Filter out Iterable-related console errors in development
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('Iterable') || message.includes('iterable')) {
      return; // Suppress Iterable-related errors
    }
    originalError.apply(console, args);
  };
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 