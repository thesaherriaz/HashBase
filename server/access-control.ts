import { User, AccessControl } from "@shared/schema";
import crypto from 'crypto';

export class AccessManager {
  private accessControl: AccessControl;
  private saveCallback: () => void;

  constructor(accessControl: AccessControl, saveCallback: () => void) {
    this.accessControl = accessControl;
    this.saveCallback = saveCallback;
  }

  async loginUser(username: string, password: string): Promise<User | null> {
    const users = this.accessControl.users;
    const user = Object.values(users).find(u => u.username === username);
    
    if (!user) {
      return null;
    }
    
    // Simple password check (in a real app, you'd use bcrypt)
    if (user.password === password) {
      // Set as current user
      this.accessControl.currentUser = user.id;
      this.saveCallback();
      return user;
    }
    
    return null;
  }
  
  async createUser(username: string, password: string, role: string): Promise<User | null> {
    // Check if current user is admin
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Permission denied: Only administrators can create users');
    }
    
    // Check if username already exists
    const existingUser = Object.values(this.accessControl.users)
      .find(u => u.username === username);
    
    if (existingUser) {
      throw new Error(`User '${username}' already exists`);
    }
    
    // Validate role
    if (!['admin', 'user', 'readonly'].includes(role)) {
      throw new Error(`Invalid role: ${role}. Valid roles are: admin, user, readonly`);
    }
    
    // Create new user
    const id = crypto.randomUUID();
    const newUser: User = {
      id,
      username,
      password,
      role: role as 'admin' | 'user' | 'readonly'
    };
    
    this.accessControl.users[id] = newUser;
    this.saveCallback();
    
    return newUser;
  }
  
  async getCurrentUser(): Promise<User | null> {
    const currentUserId = this.accessControl.currentUser;
    if (!currentUserId) {
      return null;
    }
    
    return this.accessControl.users[currentUserId] || null;
  }
  
  async logoutUser(): Promise<void> {
    this.accessControl.currentUser = undefined;
    this.saveCallback();
  }
  
  async grantTablePermission(tableName: string, userId: string, permission: 'read' | 'write' | 'admin'): Promise<string> {
    // Check if current user is admin
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return 'Permission denied: Only administrators can grant permissions';
    }
    
    // Check if user exists
    if (!this.accessControl.users[userId]) {
      return `User with ID '${userId}' does not exist`;
    }
    
    // Initialize table permissions if needed
    const tableNameLower = tableName.toLowerCase();
    if (!this.accessControl.tablePermissions[tableNameLower]) {
      this.accessControl.tablePermissions[tableNameLower] = {
        read: [],
        write: [],
        admin: []
      };
    }
    
    // Add permission if not already granted
    const permList = this.accessControl.tablePermissions[tableNameLower][permission];
    if (!permList.includes(userId)) {
      permList.push(userId);
      this.saveCallback();
      return `Granted '${permission}' permission on table '${tableName}' to user '${this.accessControl.users[userId].username}'`;
    }
    
    return `User '${this.accessControl.users[userId].username}' already has '${permission}' permission on table '${tableName}'`;
  }
  
  async revokeTablePermission(tableName: string, userId: string, permission: 'read' | 'write' | 'admin'): Promise<string> {
    // Check if current user is admin
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return 'Permission denied: Only administrators can revoke permissions';
    }
    
    // Check if user exists
    if (!this.accessControl.users[userId]) {
      return `User with ID '${userId}' does not exist`;
    }
    
    // Check if table has permissions
    const tableNameLower = tableName.toLowerCase();
    if (!this.accessControl.tablePermissions[tableNameLower]) {
      return `No permissions set for table '${tableName}'`;
    }
    
    // Remove permission if granted
    const permList = this.accessControl.tablePermissions[tableNameLower][permission];
    const index = permList.indexOf(userId);
    
    if (index !== -1) {
      permList.splice(index, 1);
      this.saveCallback();
      return `Revoked '${permission}' permission on table '${tableName}' from user '${this.accessControl.users[userId].username}'`;
    }
    
    return `User '${this.accessControl.users[userId].username}' does not have '${permission}' permission on table '${tableName}'`;
  }
  
  async hasTablePermission(tableName: string, permission: 'read' | 'write' | 'admin'): Promise<boolean> {
    const currentUser = await this.getCurrentUser();
    
    // No user logged in means no permissions
    if (!currentUser) {
      return false;
    }
    
    // Admin users have all permissions
    if (currentUser.role === 'admin') {
      return true;
    }
    
    // Check table-specific permissions
    const tableNameLower = tableName.toLowerCase();
    const tablePermissions = this.accessControl.tablePermissions[tableNameLower];
    
    if (tablePermissions && tablePermissions[permission].includes(currentUser.id)) {
      return true;
    }
    
    // Role-based default permissions
    if (permission === 'read') {
      // Both 'user' and 'readonly' roles can read by default
      return currentUser.role === 'user' || currentUser.role === 'readonly';
    } else if (permission === 'write') {
      // Only 'user' role can write by default
      return currentUser.role === 'user';
    }
    
    // For 'admin' permission, only admin users or users with explicit admin permission can alter tables
    return false;
  }
}