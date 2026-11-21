import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ title }) => {
  const { user, role } = useAuth();

  return (
    <header
      data-testid="navbar"
      className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-8 ml-64"
    >
      <h2 data-testid="page-title" className="text-lg font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      <div className="flex items-center space-x-4">
        <span
          data-testid="navbar-role-indicator"
          className="text-xs px-2.5 py-1 rounded-full font-semibold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
        >
          {role}
        </span>
        <span data-testid="navbar-user-email" className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
          {user?.email}
        </span>
      </div>
    </header>
  );
};
