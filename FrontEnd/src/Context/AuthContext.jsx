import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

import { login, fetchUserDetails, logout } from '../api/userApi';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const userData = await fetchUserDetails();
        console.log('User data received:', userData);
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // This effect runs whenever `user` or `isAuthenticated` changes
    console.log('User state:', user);
    console.log('Is authenticated state:', isAuthenticated);
  }, [user, isAuthenticated]);

  const loginUser = async (email, password) => {
    try {
      const response = await login(email, password); // Backend handles setting the cookie
      const { user } = response; // Get user data from response
      setIsAuthenticated(true);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      const response = await logout(); // Call the imported logout function
      console.log('Response int auth context:', response.status);
      if (response.status === 200) {
        // Check for success status from backend
        setIsAuthenticated(false);
        setUser(null);
        console.log('User logged out');
        navigate('/'); // Redirect to the home page after logout
      } else {
        console.error('Logout failed in auth context, user might still be logged in.');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return <AuthContext.Provider value={{ isAuthenticated, user, loginUser, logoutUser, loading }}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export default AuthProvider;
export { useAuth };
