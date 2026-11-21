import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { LogsPage } from './pages/LogsPage';
import { AlertsPage } from './pages/AlertsPage';
import { AdminPage } from './pages/AdminPage';

import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleRoute } from './components/common/RoleRoute';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';

const AppLayout = ({ title, children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
    <Sidebar />
    <Navbar title={title} />
    <main>{children}</main>
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignupPage />} />

      {/* Protected Routes (Authenticated Users) */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <AppLayout title="Security Dashboard">
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/logs"
          element={
            <AppLayout title="Security Event Logs">
              <LogsPage />
            </AppLayout>
          }
        />
        <Route
          path="/alerts"
          element={
            <AppLayout title="Incident Alerts">
              <AlertsPage />
            </AppLayout>
          }
        />

        {/* Admin Restricted Route */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route
            path="/admin"
            element={
              <AppLayout title="System Administration">
                <AdminPage />
              </AppLayout>
            }
          />
        </Route>
      </Route>

      {/* Fallback Redirection */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
