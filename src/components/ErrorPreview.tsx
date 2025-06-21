import React from 'react';

interface ErrorPreviewProps {
    error: Error | null;
    resetError: () => void;
}

export const ErrorPreview: React.FC<ErrorPreviewProps> = ({error, resetError}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-red-50 text-red-600">
            <h2 className="mb-4 text-2xl font-bold">Something went wrong.</h2>
            <p className="mb-8 text-gray-600">Please refresh the page and try again.</p>
            <div className="flex gap-4">
                <button
                    onClick={() => {
                        resetError();
                        window.location.reload();
                    }}
                    className="px-6 py-3 bg-red-600 text-white border-none rounded-lg text-base cursor-pointer transition-colors duration-200 hover:bg-red-700"
                >
                    Refresh Page
                </button>
                <button
                    onClick={resetError}
                    className="px-6 py-3 bg-gray-600 text-white border-none rounded-lg text-base cursor-pointer transition-colors duration-200 hover:bg-gray-700"
                >
                    Try Again
                </button>
            </div>
            {error && (
                <details className="mt-4 text-left max-w-md">
                    <summary className="cursor-pointer text-sm">Error Details</summary>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {error.message}
                    </pre>
                </details>
            )}
        </div>
    );
};

