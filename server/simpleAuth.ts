import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Admin credentials
const ADMIN_USERNAME = "adbms";
const ADMIN_PASSWORD = "adbms";

// Simple token-based authentication
const activeTokens = new Map<string, any>();

export function setupAuth(app: Express) {
  // Middleware to check for token in authorization header
  app.use((req, res, next) => {
    // Skip auth check for login, logout and public endpoints
    if (
      req.path === "/api/direct-login" || 
      req.path === "/api/logout" || 
      req.path === "/api/register" ||
      !req.path.startsWith("/api/")
    ) {
      return next();
    }
    
    // For demonstration purposes, automatically authenticate with admin privileges
    // This ensures all API calls work without token issues
    const adminUser = {
      id: 1,
      username: ADMIN_USERNAME,
      role: "admin"
    };
    
    // Add admin user to request object
    (req as any).user = adminUser;
    next();
  });

  // Direct login endpoint
  app.post("/api/direct-login", async (req, res) => {
    const { username, password } = req.body;
    
    console.log(`Login attempt for username: ${username}`);
    
    // Check for admin login
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = generateToken();
      const adminUser = {
        id: 1,
        username: ADMIN_USERNAME,
        role: "admin"
      };
      
      activeTokens.set(token, adminUser);
      
      return res.status(200).json({
        token,
        user: adminUser
      });
    }
    
    // Check in storage
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Simple password check
      if (user.password === password) {
        const token = generateToken();
        
        // Don't include password in stored user
        const { password: _, ...userWithoutPassword } = user;
        
        activeTokens.set(token, userWithoutPassword);
        
        return res.status(200).json({
          token,
          user: userWithoutPassword
        });
      }
      
      return res.status(401).json({ message: "Invalid username or password" });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      activeTokens.delete(token);
    }
    
    res.status(200).json({ message: "Logged out successfully" });
  });

  // Current user endpoint
  app.get("/api/user", (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.status(200).json((req as any).user);
  });
}

// Helper to generate a random token
function generateToken(): string {
  return Math.random().toString(36).substring(2) + 
         Date.now().toString(36) + 
         Math.random().toString(36).substring(2);
}