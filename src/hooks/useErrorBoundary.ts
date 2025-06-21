import { useState, useCallback } from 'react';

export const useErrorBoundary = () => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
        setError(error);
        setHasError(true);
    }, []);

    const resetError = useCallback(() => {
        setHasError(false);
        setError(null);
    }, []);

    return { hasError, error, handleError, resetError };
};