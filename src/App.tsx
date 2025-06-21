import React from 'react';
import { Translator, ErrorBoundary } from './components';

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