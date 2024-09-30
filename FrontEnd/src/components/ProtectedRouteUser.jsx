import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const ProtectedRouteUser = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  console.log('ProtectedRouteUser - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRouteUser - user:', user);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while user data is being fetched
  }

  // If the user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (user && !user.hasSubscription) {
    // If user does not have an active subscription, redirect to the subscription page
    return <Navigate to='/subscriptions' replace />;
  }

  // If authenticated, render the children components
  return children;
};

export default ProtectedRouteUser;
