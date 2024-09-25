import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while user data is being fetched
  }

  if (!isAuthenticated || user?.Role !== requiredRole) {
    // Redirect to login page or "not authorized" page if the user is not authenticated or doesn't have the required role
    return <Navigate to='/login' />;
  }

  return children; // If authenticated and role matches, render the protected component
};

export default ProtectedRoute;
