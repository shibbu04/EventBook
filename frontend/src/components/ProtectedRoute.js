import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');

  // Check if user is authenticated
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (requiredRole) {
    try {
      const user = JSON.parse(userData);
      if (user.role !== requiredRole) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'admin') {
          return <Navigate to="/admin" replace />;
        } else {
          return <Navigate to="/dashboard" replace />;
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
