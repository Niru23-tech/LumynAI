
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user is authenticated but has no role yet, they can't access protected pages.
  // Redirect them to the root, which will then handle navigation to /complete-profile.
  if (!user?.role) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard if they try to access a wrong route
    const homePath = user.role === Role.STUDENT ? '/student-dashboard' : '/counsellor-dashboard';
    return <Navigate to={homePath} replace />;
  }

  return children;
};

export default ProtectedRoute;