import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demo
const mockUsers: User[] = [
  {
    id: 'teacher1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@college.edu',
    role: 'teacher',
    department: 'Computer Science'
  },
  {
    id: 'teacher2',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@college.edu',
    role: 'teacher',
    department: 'Mathematics'
  },
  {
    id: 'student1',
    name: 'Alex Kumar',
    email: 'alex.kumar@student.college.edu',
    role: 'student',
    department: 'Computer Science'
  },
  {
    id: 'student2',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@student.college.edu',
    role: 'student',
    department: 'Mathematics'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for saved auth state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string, role: 'teacher' | 'student'): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email && u.role === role);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};