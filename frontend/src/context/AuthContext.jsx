import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('slads_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('slads_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.data?.success && res.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('slads_user', JSON.stringify(res.data.data.user));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const saveAuth = (tokenVal, userVal) => {
    setToken(tokenVal);
    setUser(userVal);
    localStorage.setItem('slads_token', tokenVal);
    localStorage.setItem('slads_user', JSON.stringify(userVal));
  };

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.data?.success) {
      saveAuth(res.data.data.token, res.data.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authApi.register(name, email, password);
    if (res.data?.success) {
      saveAuth(res.data.data.token, res.data.data.user);
    }
    return res.data;
  };

  const googleLogin = async (idToken) => {
    const res = await authApi.googleLogin(idToken);
    if (res.data?.success) {
      saveAuth(res.data.data.token, res.data.data.user);
    }
    return res.data;
  };

  const logout = () => {
    try {
      authApi.logout().catch(() => {});
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('slads_token');
      localStorage.removeItem('slads_user');
    }
  };

  const role = user?.role || 'viewer';
  const isAdmin = role === 'admin';
  const isAnalyst = role === 'analyst' || role === 'admin';
  const isViewer = true;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        role,
        isAdmin,
        isAnalyst,
        isViewer,
        login,
        register,
        googleLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
