import React from 'react';

export const MetricCard = ({ id, title, value, icon: Icon, subtitle, color = 'blue', loading = false }) => {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
    red: 'text-red-500 bg-red-50 dark:bg-red-950/40',
    orange: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40',
    green: 'text-green-500 bg-green-50 dark:bg-green-950/40',
    purple: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40'
  };

  return (
    <div
      data-testid={`metric-card-${id}`}
      className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 dark:bg-slate-700 animate-pulse rounded mt-2"></div>
          ) : (
            <h3 data-testid={`metric-value-${id}`} className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
              {value}
            </h3>
          )}
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
