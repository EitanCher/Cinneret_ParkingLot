import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signUpUser as signUp, fetchUserDetails, logout } from '../api/userApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user details on initial load to check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await fetchUserDetails();
        setIsAuthenticated(true);
        setUser(userData); // Update context with fetched user data
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

  const signUpUser = async (persId, firstName, lastName, email, phone, password) => {
    try {
      const response = await signUp(persId, firstName, lastName, email, phone, password);
      const { user } = response;

      // Update the AuthContext state with new user data
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

  return <AuthContext.Provider value={{ isAuthenticated, user, loginUser, signUpUser, logoutUser, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
