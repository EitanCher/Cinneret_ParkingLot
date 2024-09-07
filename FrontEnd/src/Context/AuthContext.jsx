import React, { createContext, useState, useEffect, useContext } from 'react';

import Cookies from 'js-cookie';
import { login, fetchUserDetails } from '../api/userApi';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = Cookies.get('authToken');
    console.log(`Auth token: ${token}`);
    if (token) {
      try {
        const userData = await fetchUserDetails(token);
        console.log('Fetched user data:', userData);
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        console.error('Error in checkAuth:', error);
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // This effect runs whenever `user` or `isAuthenticated` changes
    console.log('User state:', user);
    console.log('Is authenticated state:', isAuthenticated);
  }, [user, isAuthenticated]);

  const loginUser = async (email, password) => {
    try {
      const response = await login(email, password);
      const { token, ...userData } = response;
      Cookies.set('authToken', token, { expires: 7 });
      setIsAuthenticated(true);
      setUser(userData);
      return { token, ...userData };
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logoutUser = () => {
    Cookies.remove('authToken');
    setIsAuthenticated(false);
    setUser(null);
    console.log('user logged out');
  };

  return <AuthContext.Provider value={{ isAuthenticated, user, loginUser, logoutUser, loading }}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export default AuthProvider;
export { useAuth };
