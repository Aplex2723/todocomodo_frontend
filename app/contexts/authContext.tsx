// app/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect } from 'react';
import { setItem, getItem, deleteItem } from '../utils/storage';
import { BASE_URL } from '../config';
import { Text } from 'react-native';
import axios from 'axios';

interface AuthContextProps {
  isAuthenticated: boolean | null;
  login: (credentials: { identifier: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (details: { username: string; email: string; password: string }) => Promise<{ success: boolean; message: string }>;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: null,
  login: async () => {},
  logout: async () => {},
  register: async () => ({ success: false, message: '' }),
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await getItem('token');
        if (token && !isTokenExpired(token)) {
        } else {
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
  
    initializeAuth();
  }, []);

  const isTokenExpired = (token: string): boolean => {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1])); // Decode the payload
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      return tokenPayload.exp < currentTimeInSeconds;
    } catch (error) {
      return true; // Assume expired if decoding fails
    }
  };

  const handleTokenRefresh = async (): Promise<void> => {
    const refreshToken = await getItem('refreshToken');
    if (!refreshToken) {
      await clearAuthData();
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/refresh-token`, { refreshToken });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      if (newToken && newRefreshToken) {
        await setItem('token', newToken);
        await setItem('refreshToken', newRefreshToken);
        setIsAuthenticated(true);
      } else {
        await clearAuthData();
      }
    } catch (error) {
      await clearAuthData();
    }
  };

  const clearAuthData = async (): Promise<void> => {
    await deleteItem('token');
    await deleteItem('refreshToken');
    setIsAuthenticated(false);
  };

  const login = async (credentials: { identifier: string; password: string }): Promise<void> => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, credentials);
      const { token, refreshToken } = response.data;

      if (token && refreshToken) {
        await setItem('token', token);
        await setItem('refreshToken', refreshToken);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      throw error; // Re-throw to allow handling in screens
    }
  };

  const logout = async (): Promise<void> => {
    await clearAuthData();
  };

  const register = async (details: { username: string; email: string; password: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post(`${BASE_URL}/register`, details);
      const { success, message } = response.data;

      if (success) {
        return { success: true, message: message || 'Registration successful.' };
      } else {
        return { success: false, message: message || 'Registration failed.' };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};