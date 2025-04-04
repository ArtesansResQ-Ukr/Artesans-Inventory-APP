import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken } from '../services/auth/tokenService';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  groups: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = await getToken();
        if (token) {
          // TODO: Fetch user data from backend
          // For now, using placeholder data
          setUser({
            id: '1',
            email: 'user@example.com',
            role: 'user',
            groups: 'LOC1'
          });
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 