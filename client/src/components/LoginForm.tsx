import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/queryClient";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Special case for admin login - hard-coded for reliability
      if (username === "adbms" && password === "adbms") {
        const adminUser = {
          id: 1,
          username: "adbms",
          role: "admin"
        };
        
        // Generate a simple token
        const token = Date.now().toString(36) + Math.random().toString(36).substring(2);
        
        // Save user info and token
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(adminUser));
        
        // Update global auth state
        auth.setUser(adminUser);
        auth.setToken(token);
        
        toast({
          title: "Admin Login successful",
          description: "Welcome Administrator!",
        });
        
        onLoginSuccess();
        return;
      }
      
      // Regular user login via API
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      
      const user = await response.json();
      
      // Generate a token for the user
      const token = Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      // Save user info and token
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Update global auth state
      auth.setUser(user);
      auth.setToken(token);
      
      toast({
        title: "Login successful",
        description: `Welcome ${user.username}!`,
      });
      
      onLoginSuccess();
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login to HashBase DBMS</CardTitle>
        <CardDescription>
          Enter your credentials to access the database management system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          <p>Admin Login: adbms / adbms</p>
          <p className="mt-1">Or create your own user account</p>
        </div>
      </CardFooter>
    </Card>
  );
}