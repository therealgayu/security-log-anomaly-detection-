import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { logsApi } from '../services/api';
import { AnomalyBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';

export const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [eventType, setEventType] = useState('');
  const [sourceIp, setSourceIp] = useState('');
  const [username, setUsername] = useState('');
  const [isAnomaly, setIsAnomaly] = useState('');
  const [page, setPage] = useState(1);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Log detail inspection modal
  const [inspectLog, setInspectLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 20
      };
      if (eventType) params.eventType = eventType;
      if (sourceIp) params.sourceIp = sourceIp;
      if (username) params.username = username;
      if (isAnomaly !== '') params.isAnomaly = isAnomaly;

      const res = await logsApi.getLogs(params);
      if (res.data?.success) {
        setLogs(res.data.data.logs || []);
        if (res.data.data.pagination) {
          setPagination(res.data.data.pagination);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, eventType, isAnomaly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await logsApi.uploadLogs(formData);
      if (res.data?.success) {
        setUploadResult(res.data.data);
        fetchLogs();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'File ingestion failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div data-testid="logs-page" className="p-8 ml-64 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 data-testid="logs-title" className="text-xl font-bold text-gray-900 dark:text-white">
            Security Log Registry
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Browse, filter, and inspect ingested authentication and network security event logs
          </p>
        </div>

        <button
          onClick={() => {
            setUploadResult(null);
            setUploadModalOpen(true);
          }}
          data-testid="upload-logs-button"
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Log File (CSV / .log)</span>
        </button>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* IP Input */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Source IP</label>
            <input
              type="text"
              data-testid="filter-source-ip-input"
              value={sourceIp}
              onChange={(e) => setSourceIp(e.target.value)}
              placeholder="e.g. 192.168.1.15"
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Username</label>
            <input
              type="text"
              data-testid="filter-username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alice.chen"
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Event Type Select */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Event Type</label>
            <select
              data-testid="filter-event-type-select"
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Event Types</option>
              <option value="login_success">login_success</option>
              <option value="login_failed">login_failed</option>
              <option value="access_denied">access_denied</option>
              <option value="file_access">file_access</option>
              <option value="privilege_change">privilege_change</option>
              <option value="system_error">system_error</option>
            </select>
          </div>

          {/* Anomaly Status Select */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Outlier Status</label>
            <select
              data-testid="filter-is-anomaly-select"
              value={isAnomaly}
              onChange={(e) => {
                setIsAnomaly(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Logs</option>
              <option value="true">Anomalies Only</option>
              <option value="false">Normal Only</option>
            </select>
          </div>

          {/* Submit Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              data-testid="filter-submit-button"
              className="w-full py-1.5 px-4 bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition h-[33px]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading logs..." />
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs" data-testid="no-logs-message">
            No matching security logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table data-testid="logs-table" className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-750 border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Source IP</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                {logs.map((log, index) => (
                  <tr
                    key={log._id}
                    data-testid={`log-row-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-300 font-mono text-[11px]">
                      {new Date(log.timestamp).toISOString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-gray-900 dark:text-white">{log.sourceIp}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{log.username}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">{log.eventType}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.statusCode >= 400
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                        }`}
                      >
                        {log.statusCode || 200}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-gray-500 dark:text-gray-400">
                      {log.resource || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <AnomalyBadge isAnomaly={log.isAnomaly} anomalyScore={log.anomalyScore} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectLog(log)}
                        data-testid={`inspect-log-button-${index}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="View Full JSON"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <span data-testid="pagination-info" className="text-gray-500">
            Page <span className="font-bold text-gray-800 dark:text-gray-200">{pagination.page}</span> of{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{pagination.totalPages}</span> (
            {pagination.total} total logs)
          </span>

          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              data-testid="pagination-prev-button"
              className="p-1.5 rounded-lg border border-gray-300 dark:border-slate-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={pagination.page >= pagination.totalPages}
              data-testid="pagination-next-button"
              className="p-1.5 rounded-lg border border-gray-300 dark:border-slate-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload File Modal */}
      {uploadModalOpen && (
        <div
          data-testid="upload-modal"
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Ingest Security Logs</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Select a CSV (`sample_logs.csv`) or raw `.log` text file to preprocess and ingest into MongoDB.
            </p>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <input
                type="file"
                accept=".csv,.log,.txt"
                required
                data-testid="file-upload-input"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-300"
              />

              {uploadResult && (
                <div data-testid="upload-result-box" className="p-3 rounded-lg bg-green-50 dark:bg-green-950/40 text-xs text-green-800 dark:text-green-300 border border-green-200">
                  <p className="font-bold">Ingestion Successful!</p>
                  <p>Accepted: {uploadResult.acceptedCount} records</p>
                  <p>Rejected: {uploadResult.rejectedCount} malformed rows</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  data-testid="upload-cancel-button"
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  data-testid="upload-submit-button"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {uploading ? 'Processing & Ingesting...' : 'Upload & Process'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Log Detail Modal */}
      {inspectLog && (
        <div
          data-testid="inspect-log-modal"
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-700 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Security Event Details</h3>
              <AnomalyBadge isAnomaly={inspectLog.isAnomaly} anomalyScore={inspectLog.anomalyScore} />
            </div>

            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-auto max-h-96 font-mono">
              {JSON.stringify(inspectLog, null, 2)}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => setInspectLog(null)}
                data-testid="inspect-modal-close-button"
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
