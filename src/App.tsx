import React from 'react';
import Translator from './components/Translator';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div>
        <Translator />
      </div>
    </ErrorBoundary>
  );
}

export default App; 