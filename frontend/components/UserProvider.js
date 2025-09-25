'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, setUser, clearUser } from '../lib/auth';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = getUser();
    setUserState(userData);
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setUserState(userData);
  };

  const updateUser = (userData) => {
    setUser(userData);
    setUserState(userData);
  };

  const logout = () => {
    clearUser();
    setUserState(null);
    window.location.href = '/login';
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};