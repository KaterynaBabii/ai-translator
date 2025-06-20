import React from 'react';
import Translator from './components/Translator';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Translator />
      </div>
    </ErrorBoundary>
  );
}

export default App; 