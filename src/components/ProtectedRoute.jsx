import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
  </div>
);

// Protected route for authenticated users
export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    // Redirect to login page with return url
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  return children;
};

// Admin route for admin users only
export const AdminRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  if (userRole !== 'admin') {
    // Redirect to home page if not admin
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public route (redirect to home if already authenticated)
export const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};