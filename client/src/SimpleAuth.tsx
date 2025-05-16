import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type User = {
  id: number;
  username: string;
  role: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse stored user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    // Admin credentials
    if (username === 'adbms' && password === 'adbms') {
      const adminUser = {
        id: 1,
        username: 'adbms',
        role: 'admin'
      };
      
      localStorage.setItem('user', JSON.stringify(adminUser));
      setUser(adminUser);
      
      return;
    }
    
    throw new Error('Invalid credentials');
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}