import React, { useState, useEffect } from 'react';
import {
  Shield,
  Cpu,
  // Radio,
  // Plus,
  // Trash2,
  Play,
  // Send,
  UserCheck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { mlApi, /* webhooksApi, */ usersApi } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';

export const AdminPage = () => {
  // ML States
  const [modelInfo, setModelInfo] = useState(null);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [detectLoading, setDetectLoading] = useState(false);
  const [mlMessage, setMlMessage] = useState(null);

  // User Role States
  const [targetUserId, setTargetUserId] = useState('');
  const [targetRole, setTargetRole] = useState('analyst');
  const [userRoleMessage, setUserRoleMessage] = useState(null);

  // Webhook States - Commented out
  // const [webhooks, setWebhooks] = useState([]);
  // const [webhookUrl, setWebhookUrl] = useState('');
  // const [webhookSecret, setWebhookSecret] = useState('');
  // const [webhookFormat, setWebhookFormat] = useState('standard');
  // const [webhookEvents, setWebhookEvents] = useState(['alert.critical', 'alert.high']);
  // const [webhookMessage, setWebhookMessage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAdminData = async () => {
    try {
      setError(null);
      const [infoRes] = await Promise.all([
        mlApi.getInfo().catch(() => ({ data: { data: null } }))
        // webhooksApi.getWebhooks()
      ]);

      if (infoRes.data?.data) setModelInfo(infoRes.data.data);
      // if (whRes.data?.success) setWebhooks(whRes.data.data.webhooks || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin controls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handler: Train Model
  const handleTrainModel = async () => {
    setTrainingLoading(true);
    setMlMessage(null);
    try {
      const res = await mlApi.train({ limit: 5000 });
      setMlMessage({
        type: 'success',
        text: `Training Complete: ${res.data.message || 'Model successfully updated'}`
      });
      loadAdminData();
    } catch (err) {
      setMlMessage({
        type: 'error',
        text: err.response?.data?.error || 'Training invocation failed'
      });
    } finally {
      setTrainingLoading(false);
    }
  };

  // Handler: Run Anomaly Detection
  const handleRunDetection = async () => {
    setDetectLoading(true);
    setMlMessage(null);
    try {
      const res = await mlApi.detect({ limit: 2000, unprocessedOnly: false });
      const d = res.data?.data;
      setMlMessage({
        type: 'success',
        text: `Detection Completed: Evaluated ${d?.totalEvaluated || 0} logs, detected ${d?.anomaliesDetected || 0} anomalies, created ${d?.alertsCreated || 0} alerts.`
      });
    } catch (err) {
      setMlMessage({
        type: 'error',
        text: err.response?.data?.error || 'Anomaly detection run failed'
      });
    } finally {
      setDetectLoading(false);
    }
  };

  // Handler: Update User Role
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setUserRoleMessage(null);
    try {
      const res = await usersApi.updateRole(targetUserId, targetRole);
      setUserRoleMessage({
        type: 'success',
        text: res.data?.message || 'User role updated successfully'
      });
      setTargetUserId('');
    } catch (err) {
      setUserRoleMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update user role'
      });
    }
  };

  // Webhook Handlers - Commented out
  /*
  // Handler: Create Webhook
  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    setWebhookMessage(null);
    try {
      await webhooksApi.createWebhook({
        url: webhookUrl,
        secret: webhookSecret,
        format: webhookFormat,
        events: webhookEvents
      });
      setWebhookMessage({ type: 'success', text: 'Webhook destination added' });
      setWebhookUrl('');
      setWebhookSecret('');
      loadAdminData();
    } catch (err) {
      setWebhookMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to register webhook'
      });
    }
  };

  // Handler: Delete Webhook
  const handleDeleteWebhook = async (id) => {
    try {
      await webhooksApi.deleteWebhook(id);
      loadAdminData();
    } catch (err) {
      setWebhookMessage({ type: 'error', text: err.response?.data?.error || 'Deletion failed' });
    }
  };

  // Handler: Test Webhook
  const handleTestWebhook = async (id) => {
    try {
      const res = await webhooksApi.testWebhook(id);
      setWebhookMessage({
        type: res.data?.data?.success ? 'success' : 'error',
        text: res.data?.message
      });
      loadAdminData();
    } catch (err) {
      setWebhookMessage({ type: 'error', text: 'Test ping failed' });
    }
  };
  */

  if (loading) return <LoadingSpinner message="Loading system settings..." />;

  return (
    <div data-testid="admin-page" className="p-8 ml-64 space-y-8">
      <div>
        <h2 data-testid="admin-title" className="text-xl font-bold text-gray-900 dark:text-white">
          System Administration
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Manage machine learning models and user role permissions
        </p>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {/* SECTION 1: Machine Learning Control */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-slate-700 pb-3">
          <Cpu className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Isolation Forest Model Operations</h3>
        </div>

        {mlMessage && (
          <div
            data-testid="ml-status-message"
            className={`p-3 rounded-lg text-xs font-semibold ${
              mlMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-950 dark:text-green-300'
                : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-300'
            }`}
          >
            {mlMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-slate-700/40 rounded-lg text-xs space-y-1">
            <span className="text-gray-400 font-semibold uppercase text-[10px]">Model State</span>
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              {modelInfo?.isLoaded ? 'Loaded & Active' : 'Not Trained'}
            </p>
            <p className="text-gray-500">Trained samples: {modelInfo?.nSamples || 'None'}</p>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleTrainModel}
              disabled={trainingLoading}
              data-testid="admin-train-button"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              <span>{trainingLoading ? 'Training Model...' : 'Train / Retrain Model'}</span>
            </button>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleRunDetection}
              disabled={detectLoading}
              data-testid="admin-detect-button"
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{detectLoading ? 'Scoring Telemetry...' : 'Run Anomaly Detection Batch'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: User Role Permissions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-slate-700 pb-3">
          <Shield className="w-5 h-5 text-green-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Role-Based Access Control (RBAC)</h3>
        </div>

        {userRoleMessage && (
          <div
            data-testid="user-role-message"
            className={`p-3 rounded-lg text-xs font-semibold ${
              userRoleMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {userRoleMessage.text}
          </div>
        )}

        <form onSubmit={handleUpdateRole} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
              User MongoDB ObjectId
            </label>
            <input
              type="text"
              required
              data-testid="admin-user-id-input"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="e.g. 664f1c9..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
              New Assigned Role
            </label>
            <select
              data-testid="admin-user-role-select"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none font-medium"
            >
              <option value="viewer">Viewer (Read Only)</option>
              <option value="analyst">Analyst (Ingest + Triage)</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              data-testid="admin-update-role-button"
              className="w-full py-2 px-4 bg-gray-900 hover:bg-black dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 h-[34px]"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Update Permissions</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: Webhook Management - Commented Out */}
      {/*
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-slate-700 pb-3">
          <Radio className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Outbound Alert Webhook Subscriptions</h3>
        </div>

        {webhookMessage && (
          <div
            data-testid="webhook-status-message"
            className={`p-3 rounded-lg text-xs font-semibold ${
              webhookMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {webhookMessage.text}
          </div>
        )}

        <form onSubmit={handleCreateWebhook} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-slate-750 p-4 rounded-xl">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
              Destination URL
            </label>
            <input
              type="url"
              required
              data-testid="webhook-url-input"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
              HMAC Secret
            </label>
            <input
              type="text"
              required
              data-testid="webhook-secret-input"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Secret key"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
              Format
            </label>
            <select
              data-testid="webhook-format-select"
              value={webhookFormat}
              onChange={(e) => setWebhookFormat(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none font-medium"
            >
              <option value="standard">Standard JSON</option>
              <option value="slack">Slack Blocks</option>
              <option value="discord">Discord Embeds</option>
            </select>
          </div>

          <div className="sm:col-span-4 flex justify-end">
            <button
              type="submit"
              data-testid="webhook-create-button"
              className="py-1.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Webhook</span>
            </button>
          </div>
        </form>

        <div className="overflow-x-auto pt-2">
          {webhooks.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No active webhooks configured.</p>
          ) : (
            <table data-testid="webhooks-table" className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-500">
                  <th className="pb-2">Destination URL</th>
                  <th className="pb-2">Format</th>
                  <th className="pb-2">Events</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                {webhooks.map((wh, idx) => (
                  <tr key={wh._id} data-testid={`webhook-row-${idx}`}>
                    <td className="py-2.5 font-mono max-w-xs truncate">{wh.url}</td>
                    <td className="py-2.5 uppercase font-semibold text-gray-600 dark:text-gray-300">
                      {wh.format}
                    </td>
                    <td className="py-2.5 text-gray-500">{(wh.events || []).join(', ')}</td>
                    <td className="py-2.5">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-2.5 text-right space-x-2">
                      <button
                        onClick={() => handleTestWebhook(wh._id)}
                        data-testid={`webhook-test-button-${idx}`}
                        className="px-2 py-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded text-[11px]"
                      >
                        Test Ping
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(wh._id)}
                        data-testid={`webhook-delete-button-${idx}`}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete Webhook"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      */}
    </div>
  );
};
