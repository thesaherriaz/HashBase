import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage } from "./storage";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Extend Session interface
declare module 'express-session' {
  interface SessionData {
    user: any;
  }
}

// Administrator credentials
const ADMIN_USERNAME = "adbms";
const ADMIN_PASSWORD = "adbms";

// Session store setup
const PostgresSessionStore = connectPg(session);
const sessionStore = new PostgresSessionStore({
  pool,
  createTableIfMissing: true
});

export function setupAuth(app: Express) {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || "hashbase-dbms-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Simple authentication middleware
  app.use((req, res, next) => {
    // Skip auth check for auth-related endpoints
    if (req.path === "/api/login" || 
        req.path === "/api/logout" || 
        req.path === "/api/register") {
      return next();
    }
    
    // Check if user is authenticated
    if (req.session.user) {
      return next();
    }
    
    // Only check auth for API endpoints
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    next();
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    
    console.log(`Login attempt for username: ${username}`);
    
    // Check for admin login
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const adminUser = {
        id: 1,
        username: ADMIN_USERNAME,
        role: "admin"
      };
      
      req.session.user = adminUser;
      return res.status(200).json(adminUser);
    }
    
    // Check in storage
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Simple password comparison for demo purposes
      if (user.password === password) {
        // Don't include password in response
        const { password: _, ...userWithoutPassword } = user;
        req.session.user = userWithoutPassword;
        return res.status(200).json(userWithoutPassword);
      }
      
      return res.status(401).json({ message: "Invalid username or password" });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Register endpoint
  app.post("/api/register", async (req, res) => {
    const { username, password, role = "user" } = req.body;
    
    try {
      // Check if username exists
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create user
      const newUser = await storage.createUser({
        username,
        password,
        role
      });
      
      // Log in the user
      req.session.user = newUser;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.status(200).json(req.session.user);
  });
}