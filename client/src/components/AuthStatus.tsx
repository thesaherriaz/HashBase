import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MaterialSymbol } from '@/components/ui/material-symbol';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type User = {
  id: string;
  username: string;
  role: string;
};

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { toast } = useToast();

  // Fetch current user on component mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Please provide both username and password',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setLoginDialogOpen(false);
        toast({
          title: 'Login successful',
          description: `Welcome back, ${data.user.username}!`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Login failed',
          description: errorData.message || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Login error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setUser(null);
        toast({
          title: 'Logout successful',
          description: 'You have been logged out',
        });
      } else {
        toast({
          title: 'Logout failed',
          description: 'Failed to log out',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Logout error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {user ? (
        <div className="flex items-center">
          <div className="mr-3 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm">
            <MaterialSymbol icon="account_circle" className="mr-1" />
            <span className="font-medium">{user.username}</span>
            <span className="ml-1 text-xs text-primary/70">({user.role})</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center"
          >
            {loading ? (
              <MaterialSymbol icon="autorenew" className="mr-1 animate-spin" />
            ) : (
              <MaterialSymbol icon="logout" className="mr-1" />
            )}
            Logout
          </Button>
        </div>
      ) : (
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => setLoginDialogOpen(true)}
          disabled={loading}
          className="flex items-center"
        >
          {loading ? (
            <MaterialSymbol icon="autorenew" className="mr-1 animate-spin" />
          ) : (
            <MaterialSymbol icon="login" className="mr-1" />
          )}
          Login
        </Button>
      )}

      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login to HashBase DBMS</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}