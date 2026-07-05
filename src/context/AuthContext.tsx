import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'Commissioner' | 'Deputy Commissioner' | 'Operations Manager' | 'Field Supervisor';
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: User['role']) => Promise<void>;
  googleSignIn: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage for persistent session
    const savedUser = localStorage.getItem('civicpilot_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple demo validations
    if (email && password) {
      const demoUser: User = {
        uid: 'user_123',
        email: email,
        displayName: email.split('@')[0].toUpperCase(),
        role: email.includes('commissioner') ? 'Commissioner' : 'Operations Manager',
        photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face'
      };
      setUser(demoUser);
      localStorage.setItem('civicpilot_user', JSON.stringify(demoUser));
    } else {
      throw new Error('Invalid email or password');
    }
    setLoading(false);
  };

  const register = async (email: string, password: string, name: string, role: User['role']) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (email && name) {
      const newUser: User = {
        uid: `user_${Date.now()}`,
        email,
        displayName: name,
        role,
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&crop=face'
      };
      setUser(newUser);
      localStorage.setItem('civicpilot_user', JSON.stringify(newUser));
    } else {
      throw new Error('Registration failed');
    }
    setLoading(false);
  };

  const googleSignIn = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const googleUser: User = {
      uid: 'google_user_999',
      email: 'commissioner.bangalore@civicpilot.in',
      displayName: 'K. R. Rao (Commissioner)',
      role: 'Commissioner',
      photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop&crop=face'
    };
    setUser(googleUser);
    localStorage.setItem('civicpilot_user', JSON.stringify(googleUser));
    setLoading(false);
  };

  const forgotPassword = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Password reset email sent to: ${email}`);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    setUser(null);
    localStorage.removeItem('civicpilot_user');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleSignIn, forgotPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
