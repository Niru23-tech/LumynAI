
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { mockStudents, mockCounselors } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: 'student' | 'counselor') => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('mindEaseUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('mindEaseUser');
    }
  }, []);

  const login = (email: string, role: 'student' | 'counselor'): boolean => {
    let foundUser: User | undefined;
    if (role === 'student') {
        foundUser = mockStudents.find(u => u.email.toLowerCase() === email.toLowerCase());
    } else {
        foundUser = mockCounselors.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    
    if (foundUser) {
      localStorage.setItem('mindEaseUser', JSON.stringify(foundUser));
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('mindEaseUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
