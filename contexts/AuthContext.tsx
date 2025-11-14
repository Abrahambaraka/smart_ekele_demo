
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, Role } from '../types';
import { MOCK_USERS } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  loginWithCredentials: (email: string, password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: Role) => {
    const userToLogin = MOCK_USERS[role];
    if (userToLogin) {
      setUser(userToLogin);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const loginWithCredentials = (email: string, password: string): boolean => {
    // For demo purposes, any user with this password is valid
    if (password === 'password123') {
      const userToLogin = Object.values(MOCK_USERS).find(u => u.email === email);
      if (userToLogin) {
        setUser(userToLogin);
        return true;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loginWithCredentials }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};