import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
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
    
    // Admin login check
    if (username === "adbms" && password === "adbms") {
      // Create admin user object
      const adminUser = {
        id: 1,
        username: "adbms",
        role: "admin"
      };
      
      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(adminUser));
      
      toast({
        title: "Login successful",
        description: "Welcome Administrator!",
      });
      
      // Redirect to main page
      window.location.href = "/";
      return;
    }
    
    // For demo purposes, show error for non-admin logins
    toast({
      title: "Login failed",
      description: "Invalid username or password. Use admin credentials: adbms/adbms",
      variant: "destructive",
    });
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">HashBase DBMS</CardTitle>
            <CardDescription className="text-center">
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
              <div className="text-center text-sm text-muted-foreground mt-4">
                <p>Use admin credentials: adbms / adbms</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}