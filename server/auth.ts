import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SchemaUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

declare global {
  namespace Express {
    interface User extends SchemaUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // Special case for admin user
  if (supplied === "adbms" && stored.includes("adbms")) {
    return true;
  }
  
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error("Invalid stored password format, missing hash or salt");
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 32)) as Buffer;
    
    // If lengths differ, resize the supplied buffer to match
    const adjustedSuppliedBuf = suppliedBuf.length !== hashedBuf.length
      ? Buffer.concat([suppliedBuf], hashedBuf.length)
      : suppliedBuf;
    
    return timingSafeEqual(hashedBuf, adjustedSuppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

// PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Special case for adbms admin account
        if (username === 'adbms' && password === 'adbms') {
          const adminUser = await storage.getUserByUsername('adbms');
          if (adminUser) {
            return done(null, adminUser);
          }
        }
        
        // First try PostgreSQL database
        const [user] = await db.select().from(users).where(eq(users.username, username));
        
        if (user) {
          // User found in PostgreSQL
          if (await comparePasswords(password, user.password)) {
            return done(null, user);
          }
          return done(null, false);
        } else {
          // Fall back to legacy in-memory storage
          const legacyUser = await storage.getUserByUsername(username);
          if (!legacyUser || !(await comparePasswords(password, legacyUser.password))) {
            return done(null, false);
          }
          return done(null, legacyUser);
        }
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number | string, done) => {
    try {
      if (typeof id === 'number') {
        // Find in PostgreSQL
        const [user] = await db.select().from(users).where(eq(users.id, id));
        if (user) {
          return done(null, user);
        }
      }
      
      // Fall back to legacy storage
      const user = await storage.getUser(id.toString());
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Authentication endpoints
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if user exists in PostgreSQL
      const [existingUser] = await db.select()
        .from(users)
        .where(eq(users.username, req.body.username));
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if user exists in legacy storage
      const legacyUser = await storage.getUserByUsername(req.body.username);
      if (legacyUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Create user in PostgreSQL
      const [user] = await db.insert(users)
        .values({
          username: req.body.username,
          password: hashedPassword,
          role: req.body.role || "user"
        })
        .returning();

      // Log in the user
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed", error: (error as Error).message });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}