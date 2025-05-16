import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { loginMutation, registerMutation, user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate({
      username,
      password,
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      username,
      password,
      role: "user",
    });
  };

  return (
    <div className="container flex h-screen w-screen items-center justify-center">
      <div className="flex w-full max-w-5xl">
        <div className="hidden md:block w-1/2 p-8">
          <div className="flex h-full flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">HashBase DBMS</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                A modern hash-based database management system with comprehensive transaction
                management, advanced querying capabilities, and robust user authentication.
              </p>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-2">Key Features</h3>
                <ul className="space-y-2 ml-6 list-disc text-muted-foreground">
                  <li>Hash-based storage for O(1) access time</li>
                  <li>Full ACID transaction support</li>
                  <li>Advanced composite indexing</li>
                  <li>SQL query language with optimization</li>
                  <li>Real-time transaction monitoring</li>
                  <li>Role-based access control</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 HashBase DBMS. All rights reserved.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Welcome to HashBase DBMS</CardTitle>
              <CardDescription>
                Log in to your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input 
                        id="login-username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input 
                        id="login-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirm Password</Label>
                      <Input 
                        id="register-confirm-password" 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••" 
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                {activeTab === "login" 
                  ? "Don't have an account? " 
                  : "Already have an account? "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                >
                  {activeTab === "login" ? "Sign up" : "Log in"}
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}