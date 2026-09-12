import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // If you have a /auth/me route set up in Module 1, this fetches the active user
          const response = await axiosInstance.get('/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error("Session expired or invalid token");
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const logout = () => {
    localStorage.removeItem('token'); 
    setUser(null); 
    window.location.href = '/'; 
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};