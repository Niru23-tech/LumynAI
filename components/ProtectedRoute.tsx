
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  role: 'student' | 'counselor';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Not logged in, redirect to auth page
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    // Logged in but with the wrong role, redirect to their own dashboard or home
    const dashboardPath = user.role === 'student' ? '/student/dashboard' : '/counselor/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
