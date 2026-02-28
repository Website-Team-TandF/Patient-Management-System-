import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, activeRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted-foreground">Sagar Health Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && activeRole && !allowedRoles.includes(activeRole)) {
    // Redirect to their default dashboard if they try to access something unauthorized
    const defaultDashboard = activeRole === 'admin' ? '/admin' : 
                          activeRole === 'doctor' ? '/doctor' :
                          activeRole === 'receptionist' ? '/receptionist' :
                          activeRole === 'pharmacist' ? '/pharmacist' : '/book';
    
    return <Navigate to={defaultDashboard} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
