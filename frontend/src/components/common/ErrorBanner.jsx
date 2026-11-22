import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ErrorBanner = ({ message, details, onDismiss }) => {
  if (!message) return null;

  return (
    <div
      data-testid="error-banner"
      className="p-4 mb-4 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 flex items-start justify-between"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
        <div>
          <h4 className="text-sm font-semibold">{message}</h4>
          {details && (
            <p className="text-xs mt-1 text-red-700 dark:text-red-300 whitespace-pre-wrap">
              {typeof details === 'string' ? details : JSON.stringify(details)}
            </p>
          )}
        </div>
      </div>
      {onDismiss && (
        <button
          data-testid="error-banner-dismiss-button"
          onClick={onDismiss}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-100"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
