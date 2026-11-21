import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Bell, Shield, LogOut, Sun, Moon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Sidebar = () => {
  const { user, role, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, testId: 'nav-dashboard' },
    { to: '/logs', label: 'Security Logs', icon: FileText, testId: 'nav-logs' },
    { to: '/alerts', label: 'Alerts', icon: Bell, testId: 'nav-alerts' }
  ];

  if (isAdmin) {
    links.push({ to: '/admin', label: 'Admin Panel', icon: Shield, testId: 'nav-admin' });
  }

  return (
    <aside
      data-testid="sidebar"
      className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col justify-between h-screen fixed left-0 top-0 z-30"
    >
      <div>
        {/* App Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-700">
          <ShieldAlert className="w-7 h-7 text-blue-600 dark:text-blue-400 mr-3" />
          <div>
            <h1 className="font-bold text-base leading-none text-gray-900 dark:text-white">SLADS</h1>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Anomaly Detection</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                data-testid={link.testId}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Controls */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          data-testid="theme-toggle-button"
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
        >
          <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
          {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-500" />}
        </button>

        {/* User Card */}
        <div data-testid="sidebar-user-card" className="flex items-center space-x-3 px-2 py-1">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p data-testid="sidebar-user-name" className="text-xs font-semibold truncate text-gray-900 dark:text-white">
              {user?.name || 'User'}
            </p>
            <p data-testid="sidebar-user-role" className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
              {role}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          data-testid="logout-button"
          className="w-full flex items-center justify-center px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
