import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  BellRing,
  Flame,
  RefreshCw,
  Clock,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

import { logsApi, alertsApi } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { SeverityBadge, StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const DashboardPage = () => {
  const [logStats, setLogStats] = useState(null);
  const [alertStats, setAlertStats] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [lStatsRes, aStatsRes, alertsRes, logsRes] = await Promise.all([
        logsApi.getLogStats(),
        alertsApi.getAlertStats(),
        alertsApi.getAlerts({ limit: 5 }),
        logsApi.getLogs({ limit: 100 })
      ]);

      if (lStatsRes.data?.success) setLogStats(lStatsRes.data.data);
      if (aStatsRes.data?.success) setAlertStats(aStatsRes.data.data);
      if (alertsRes.data?.success) setRecentAlerts(alertsRes.data.data.alerts || []);
      if (logsRes.data?.success) setRecentLogs(logsRes.data.data.logs || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Build chart data: Logs & anomalies grouped by day/hour
  const timelineMap = {};
  recentLogs.forEach((l) => {
    const key = new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!timelineMap[key]) {
      timelineMap[key] = { time: key, total: 0, anomalies: 0 };
    }
    timelineMap[key].total++;
    if (l.isAnomaly) {
      timelineMap[key].anomalies++;
    }
  });
  const timelineData = Object.values(timelineMap).slice(-15);

  // Build event type distribution
  const eventPieData = logStats?.eventTypeDistribution
    ? Object.entries(logStats.eventTypeDistribution).map(([name, value]) => ({ name, value }))
    : [];

  // Build suspicious IPs from anomalous logs
  const suspiciousIpMap = {};
  recentLogs
    .filter((l) => l.isAnomaly)
    .forEach((l) => {
      suspiciousIpMap[l.sourceIp] = (suspiciousIpMap[l.sourceIp] || 0) + 1;
    });
  const topSuspiciousIps = Object.entries(suspiciousIpMap)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) {
    return <LoadingSpinner message="Aggregating security telemetry..." />;
  }

  return (
    <div data-testid="dashboard-page" className="p-8 ml-64 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 data-testid="dashboard-title" className="text-xl font-bold text-gray-900 dark:text-white">
            Security Overview
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time telemetry, Isolation Forest anomaly scoring, and active threats
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          data-testid="dashboard-refresh-button"
          className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          id="total-logs"
          title="Total Ingested Logs"
          value={logStats?.totalLogs?.toLocaleString() || 0}
          icon={FileText}
          color="blue"
          subtitle={`${logStats?.uniqueIps || 0} unique IPs`}
        />
        <MetricCard
          id="total-anomalies"
          title="Anomalies Detected"
          value={logStats?.totalAnomalies?.toLocaleString() || 0}
          icon={AlertTriangle}
          color="orange"
          subtitle={`${logStats?.anomalyRate || 0}% contamination rate`}
        />
        <MetricCard
          id="open-alerts"
          title="Open Alerts"
          value={alertStats?.openAlerts?.toLocaleString() || 0}
          icon={BellRing}
          color="purple"
          subtitle={`${alertStats?.totalAlerts || 0} total alerts logged`}
        />
        <MetricCard
          id="critical-alerts"
          title="Critical Threats"
          value={alertStats?.severityBreakdown?.critical || 0}
          icon={Flame}
          color="red"
          subtitle={`${alertStats?.severityBreakdown?.high || 0} high severity`}
        />
      </div>

      {/* Charts Row 1: Time Series */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <div
          data-testid="chart-logs-timeline"
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-500" />
              Event Volume & Anomaly Timeline
            </h3>
            <span className="text-xs text-gray-400">Recent Windows</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="total" name="Total Events" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="anomalies" name="Anomalies" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Type Distribution */}
        <div
          data-testid="chart-event-distribution"
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Event Category Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {eventPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 & Recent Alerts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Suspicious IPs */}
        <div
          data-testid="chart-suspicious-ips"
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm lg:col-span-1"
        >
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Top Suspicious Source IPs</h3>
          {topSuspiciousIps.length === 0 ? (
            <p className="text-xs text-gray-500 py-10 text-center">No anomalous IP traffic detected</p>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSuspiciousIps} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={10} />
                  <YAxis dataKey="ip" type="category" stroke="#9ca3af" fontSize={10} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Prioritized Alerts */}
        <div
          data-testid="dashboard-recent-alerts"
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Security Alerts</h3>
            <span className="text-xs text-blue-500 font-semibold cursor-pointer hover:underline">
              View all in Alerts tab
            </span>
          </div>

          {recentAlerts.length === 0 ? (
            <p className="text-xs text-gray-500 py-10 text-center">No alerts recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-500">
                    <th className="pb-2">Severity</th>
                    <th className="pb-2">Reason</th>
                    <th className="pb-2">Source IP</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {recentAlerts.map((a, i) => (
                    <tr key={a._id} data-testid={`dashboard-alert-row-${i}`} className="hover:bg-gray-50 dark:hover:bg-slate-750">
                      <td className="py-2.5">
                        <SeverityBadge severity={a.severity} />
                      </td>
                      <td className="py-2.5 max-w-xs truncate font-medium text-gray-900 dark:text-gray-100">
                        {a.reason}
                      </td>
                      <td className="py-2.5 font-mono text-gray-600 dark:text-gray-300">{a.sourceIp}</td>
                      <td className="py-2.5">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="py-2.5 text-gray-400 whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
