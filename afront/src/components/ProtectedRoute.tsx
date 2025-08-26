import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store/store';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  element: React.ReactElement;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, requireAdmin = false }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    toast.error('Please log in to access this page');
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin' && user?.role !== 'super_admin') {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;