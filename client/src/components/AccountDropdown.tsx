import { useState, useRef, useEffect } from 'react';
import { MaterialSymbol } from '@/components/ui/material-symbol';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string | number;
  username: string;
  role: string;
};

interface AccountDropdownProps {
  setActiveTab: (tab: string) => void;
}

export default function AccountDropdown({ setActiveTab }: AccountDropdownProps) {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  // Use local state for authentication instead of useAuth
  const [user, setUser] = useState<User | null>(null);
  
  // Load user from localStorage on component mount
  useEffect(() => {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Failed to load user from localStorage:', error);
    }
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Please provide both username and password',
        variant: 'destructive',
      });
      return;
    }

    // Direct admin login
    if (username === 'adbms' && password === 'adbms') {
      const adminUser = {
        id: 1,
        username: 'adbms',
        role: 'admin'
      };
      
      localStorage.setItem('user', JSON.stringify(adminUser));
      setUser(adminUser);
      
      toast({
        title: 'Login successful',
        description: 'Welcome Administrator!',
      });
      
      setLoginDialogOpen(false);
      setUsername('');
      setPassword('');
      
      // Refresh the page to apply login
      window.location.reload();
      return;
    }
    
    toast({
      title: 'Login failed',
      description: 'Invalid credentials. Try using adbms/adbms',
      variant: 'destructive',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
    
    // Refresh page to apply logout
    window.location.href = '/login';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {user ? (
        <div 
          className="flex items-center cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary rounded-full px-3 py-1.5 text-sm"
          onMouseEnter={() => setShowDropdown(true)}
        >
          <MaterialSymbol icon="account_circle" className="mr-1" />
          <span className="font-medium">{user.username}</span>
          <span className="ml-1 text-xs text-primary/70">({user.role})</span>
          <MaterialSymbol icon="expand_more" className="ml-1" />
        </div>
      ) : (
        <div
          className="flex items-center cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 py-1.5 text-sm"
          onClick={() => setLoginDialogOpen(true)}
        >
          <MaterialSymbol icon="login" className="mr-1" />
          <span className="font-medium">Login</span>
        </div>
      )}

      {/* Dropdown Menu */}
      {showDropdown && user && (
        <div 
          className="absolute right-0 top-full mt-1 w-48 bg-card rounded-md shadow-lg border border-border py-1 z-50"
          onMouseLeave={() => setShowDropdown(false)}
        >
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-semibold">{user.username}</p>
            <p className="text-xs text-muted-foreground">Role: {user.role}</p>
          </div>
          <ul className="py-1">
            <li
              className="px-4 py-2 text-sm hover:bg-primary/10 flex items-center cursor-pointer"
              onClick={handleLogout}
            >
              <MaterialSymbol icon="logout" className="mr-2 text-primary" />
              Logout
            </li>
          </ul>
        </div>
      )}

      {/* Login Dialog */}
      {loginDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg border border-border w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Login to HashBase DBMS</h3>
              <button onClick={() => setLoginDialogOpen(false)}>
                <MaterialSymbol icon="close" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-input"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-input"
                  placeholder="Enter your password"
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={handleLogin}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md font-medium"
                >
                  Login
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Default admin credentials: adbms / adbms
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}