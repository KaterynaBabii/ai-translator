import React, { Component, ErrorInfo } from 'react';
import { ErrorBoundaryProps, ErrorBoundaryState } from '../types';

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-red-50 text-red-600">
          <h2 className="mb-4 text-2xl font-bold">Something went wrong.</h2>
          <p className="mb-8 text-gray-600">Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white border-none rounded-lg text-base cursor-pointer transition-colors duration-200 hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 