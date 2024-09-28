// app/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect } from 'react';
import { setItem, getItem, deleteItem } from '../utils/storage';
import { BASE_URL } from '../config'; 
import axios from 'axios';

interface AuthContextProps {
  isAuthenticated: boolean | null;
  login: (credentials: { identifier: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: null,
  login: async () => {},
  logout: async () => {},
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
        const token = await getItem('token');
      setIsAuthenticated(!!token);
    };
    checkAuthStatus();
  }, []);

  const login = async (credentials: { identifier: string; password: string }) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, credentials);
      console.log(response)
      const { token } = response.data;

      if (token) {
        await setItem('token', token);
        setIsAuthenticated(true);
      } else {
        // Handle login failure
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Handle error
      console.error('Login error:', error);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    await deleteItem('token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};