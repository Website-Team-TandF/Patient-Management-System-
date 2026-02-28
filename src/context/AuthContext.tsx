import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as api from '../services/api';

export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'pharmacist' | 'patient';

interface User {
  name: string;
  email: string;
  roles: UserRole[];
}

interface AuthContextType {
  user: User | null;
  activeRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = (role: UserRole) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'doctor': return '/doctor';
      case 'receptionist': return '/receptionist';
      case 'pharmacist': return '/pharmacist';
      default: return '/login';
    }
  };

  const initUser = useCallback(async () => {
    try {
      const response = await api.getCurrentUser();
      if (response && response.user) {
        setUser(response.user);
        
        // Try to restore active role from localStorage
        const savedRole = localStorage.getItem('activeRole') as UserRole;
        if (savedRole && response.user.roles.includes(savedRole)) {
          setActiveRole(savedRole);
        } else if (!activeRole && response.user.roles.length > 0) {
          // Default to first role if not set
          const defaultRole = response.user.roles[0];
          setActiveRole(defaultRole);
          localStorage.setItem('activeRole', defaultRole);
        }
      }
    } catch (error) {
      console.error('Failed to fetch current user', error);
      if (!location.pathname.startsWith('/login') && !location.pathname.startsWith('/signup') && !location.pathname.startsWith('/book')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, location.pathname, activeRole]);

  useEffect(() => {
    initUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    const userData = response.user;
    setUser(userData);
    
    if (userData.roles.length > 0) {
      const primaryRole = userData.roles[0];
      setActiveRole(primaryRole);
      localStorage.setItem('activeRole', primaryRole);
      navigate(getDashboardPath(primaryRole));
    } else {
      navigate('/login');
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem('activeRole');
    navigate('/login');
  };

  const switchRole = (role: UserRole) => {
    if (user?.roles.includes(role)) {
      setActiveRole(role);
      localStorage.setItem('activeRole', role);
      navigate(getDashboardPath(role));
    }
  };

  return (
    <AuthContext.Provider value={{ user, activeRole, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
