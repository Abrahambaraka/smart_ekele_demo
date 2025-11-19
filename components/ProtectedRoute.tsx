
import React, { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: ReactElement;
  allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard if they try to access a forbidden page
    let defaultPath = '/login';
    if (user.role === Role.SCHOOL_DIRECTOR) defaultPath = '/school-dashboard';
    if (user.role === Role.TEACHER) defaultPath = '/teacher-dashboard';
    
    return <Navigate to={defaultPath} replace />;
  }

  return children;
};

export default ProtectedRoute;