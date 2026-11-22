import React from 'react';

export const SeverityBadge = ({ severity }) => {
  const sev = (severity || 'low').toLowerCase();

  const styles = {
    critical: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    high: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
    low: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
  };

  return (
    <span
      data-testid={`severity-badge-${sev}`}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[sev] || styles.low}`}
    >
      {sev.toUpperCase()}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const st = (status || 'open').toLowerCase();

  const styles = {
    open: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    acknowledged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
  };

  return (
    <span
      data-testid={`status-badge-${st}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[st] || styles.open}`}
    >
      {st.toUpperCase()}
    </span>
  );
};

export const AnomalyBadge = ({ isAnomaly, anomalyScore }) => {
  if (isAnomaly) {
    return (
      <span
        data-testid="anomaly-badge-positive"
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white"
      >
        ANOMALY {anomalyScore !== null && anomalyScore !== undefined ? `(${(anomalyScore * 100).toFixed(0)}%)` : ''}
      </span>
    );
  }
  return (
    <span
      data-testid="anomaly-badge-normal"
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    >
      Normal
    </span>
  );
};
