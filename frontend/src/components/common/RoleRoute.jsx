import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldX } from 'lucide-react';

export const RoleRoute = ({ allowedRoles = ['admin'] }) => {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!allowedRoles.includes(role)) {
    return (
      <div data-testid="unauthorized-message" className="p-8 max-w-md mx-auto text-center mt-20">
        <div className="p-4 bg-red-100 dark:bg-red-950/50 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-red-600 mb-4">
          <ShieldX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Your current role (<span className="font-semibold uppercase">{role}</span>) does not have permission to view this administration page.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
