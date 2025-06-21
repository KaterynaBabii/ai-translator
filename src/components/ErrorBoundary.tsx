import React, { useEffect } from 'react';
import { ErrorBoundaryProps } from '../types';
import { ErrorPreview } from "./ErrorPreview";
import { useErrorBoundary } from "../hooks/useErrorBoundary";

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const { hasError, error, handleError, resetError } = useErrorBoundary();

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      handleError(event.error, { componentStack: event.filename || '' });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(new Error(event.reason), { componentStack: 'Promise rejection' });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError]);

  return hasError ?
      <ErrorPreview error={error} resetError={resetError}/> :
      <>{children}</>;
}