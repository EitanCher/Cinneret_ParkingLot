import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

import { login, fetchUserDetails, logout } from '../api/userApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await fetchUserDetails();
        setIsAuthenticated(true);
        setUser(userData); // Ensure user data has a `Role` property
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginUser = async (email, password) => {
    try {
      const response = await login(email, password);
      const { user } = response;
      setIsAuthenticated(true);
      setUser(user);
      return user;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return <AuthContext.Provider value={{ isAuthenticated, user, loginUser, logoutUser, loading }}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export default AuthProvider;
export { useAuth };
