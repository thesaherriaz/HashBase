import { 
  DatabaseState, 
  TableSchema, 
  ColumnSchema, 
  TransactionInfo,
  AccessControl,
  User
} from "@shared/schema";
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AccessManager } from './access-control';
import { ConcurrencyManager } from './concurrency-manager';

// Interface for storage operations
export interface IStorage {
  // Database operations
  getDatabase(): Promise<DatabaseState>;
  saveDatabase(db: DatabaseState): Promise<void>;
  
  // Table operations
  createTable(name: string, schema: Record<string, ColumnSchema>, constraints: any): Promise<string>;
  dropTable(name: string): Promise<string>;
  getTables(): Promise<Record<string, TableSchema>>;
  getTable(name: string): Promise<TableSchema | undefined>;
  
  // Record operations
  insertRecord(tableName: string, key: string, values: Record<string, any>): Promise<string>;
  updateRecords(tableName: string, updates: Record<string, any>, whereClause?: string): Promise<string>;
  deleteRecords(tableName: string, whereClause?: string): Promise<string>;
  selectRecords(tableName: string, columns: string, whereClause?: string): Promise<any[]>;
  
  // Transaction operations
  beginTransaction(transactionId: string): Promise<string>;
  commitTransaction(transactionId: string): Promise<string>;
  rollbackTransaction(transactionId: string): Promise<string>;
  executeInTransaction(transactionId: string, query: string): Promise<any>;
  
  // Index operations
  createIndex(tableName: string, columnName: string | string[]): Promise<string>;
  dropIndex(tableName: string, columnName: string | string[]): Promise<string>;
  getIndexes(): Promise<Record<string, Record<string, Record<string, string[]>>>>;
  
  // Join operations
  joinTables(table1: string, table2: string, joinColumn1: string, joinColumn2: string, columns?: string[]): Promise<any[]>;
  
  // Access control operations
  loginUser(username: string, password: string): Promise<User | null>;
  createUser(username: string, password: string, role: string): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
  logoutUser(): Promise<void>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  
  // Permission operations
  grantTablePermission(tableName: string, userId: string, permission: 'read' | 'write' | 'admin'): Promise<string>;
  revokeTablePermission(tableName: string, userId: string, permission: 'read' | 'write' | 'admin'): Promise<string>;
  hasTablePermission(tableName: string, permission: 'read' | 'write' | 'admin'): Promise<boolean>;
  verifyPassword(password: string): Promise<boolean>;
}

// In-memory implementation of storage
export class MemStorage implements IStorage {
  private database: DatabaseState;
  private accessManager: AccessManager;
  private concurrencyManager: ConcurrencyManager;

  constructor() {
    // Initialize with empty database
    this.database = {
      tables: {},
      indexes: {},
      activeTransactions: {},
      implicitTransactionCounter: 0,
      accessControl: {
        users: {},
        tablePermissions: {}
      }
    };
    
    const dbFilePath = path.join(process.cwd(), 'database.json');
    
    // Try to load from file first
    if (fs.existsSync(dbFilePath)) {
      try {
        const data = fs.readFileSync(dbFilePath, 'utf8');
        const loadedDB = JSON.parse(data);
        
        // Ensure we have the full structure
        this.database = {
          ...loadedDB,
          accessControl: loadedDB.accessControl || {
            users: {},
            tablePermissions: {}
          }
        };
        
        console.log('Database loaded from file:', dbFilePath);
      } catch (error) {
        console.error('Failed to load database from file:', error);
        // Create a default admin user
        this.createDefaultAdmin();
      }
    } else {
      // Create a default admin user
      this.createDefaultAdmin();
      // Save the new database
      this.save();
    }
    
    // Initialize the access manager
    this.accessManager = new AccessManager(
      this.database.accessControl, 
      () => this.save()
    );
    
    // Initialize the concurrency manager
    this.concurrencyManager = new ConcurrencyManager();
  }
  
  private createDefaultAdmin() {
    if (Object.keys(this.database.accessControl.users).length === 0) {
      const adminPassword = 'adbms'; // Fixed password for demo purposes
      console.log('Created default admin user with password:', adminPassword);
      
      this.database.accessControl.users['adbms'] = {
        id: 1, // Using numeric ID to match PostgreSQL schema
        username: 'adbms',
        password: adminPassword,
        role: 'admin',
        createdAt: new Date()
      };
      
      // Create permissions for existing tables
      Object.keys(this.database.tables || {}).forEach(tableName => {
        if (!this.database.accessControl.tablePermissions[tableName]) {
          this.database.accessControl.tablePermissions[tableName] = {
            read: ['adbms'],
            write: ['adbms'],
            admin: ['adbms']
          };
        }
      });
    }
  }

  private save() {
    try {
      // Save to JSON file
      const dbFilePath = path.join(process.cwd(), 'database.json');
      const data = JSON.stringify(this.database, null, 2);
      fs.writeFileSync(dbFilePath, data, 'utf8');
      console.log('Database saved to:', dbFilePath);
    } catch (error) {
      console.error('Error saving database to file:', error);
    }
  }

  async getDatabase(): Promise<DatabaseState> {
    return this.database;
  }

  async saveDatabase(db: DatabaseState): Promise<void> {
    this.database = db;
    this.save();
  }

  async createTable(name: string, columns: Record<string, ColumnSchema>, constraints: any = {}): Promise<string> {
    const tableName = name.toLowerCase();
    
    if (this.database.tables[tableName]) {
      return `Table '${tableName}' already exists!`;
    }
    
    let primaryKeys: string[] = [];
    
    // Check for primary key constraints
    for (const [colName, colInfo] of Object.entries(columns)) {
      if (colInfo.constraints && colInfo.constraints.includes('primary_key')) {
        primaryKeys.push(colName);
      }
    }
    
    this.database.tables[tableName] = {
      columns,
      records: {},
      constraints,
      primary_keys: primaryKeys,
      foreign_keys: {}
    };
    
    this.save();
    return `Table '${tableName}' created successfully.`;
  }

  async dropTable(name: string): Promise<string> {
    const tableName = name.toLowerCase();
    
    if (!this.database.tables[tableName]) {
      return `Table '${tableName}' does not exist!`;
    }
    
    delete this.database.tables[tableName];
    
    // Remove indexes for this table
    if (this.database.indexes[tableName]) {
      delete this.database.indexes[tableName];
    }
    
    this.save();
    return `Table '${tableName}' dropped successfully.`;
  }

  async getTables(): Promise<Record<string, TableSchema>> {
    return this.database.tables;
  }

  async getTable(name: string): Promise<TableSchema | undefined> {
    return this.database.tables[name.toLowerCase()];
  }

  async insertRecord(tableName: string, key: string, record: Record<string, any>): Promise<string> {
    const table = this.database.tables[tableName.toLowerCase()];
    
    if (!table) {
      return `Table '${tableName}' does not exist!`;
    }
    
    // Check if primary key already exists
    if (table.primary_keys.length > 0) {
      const pkField = table.primary_keys[0];
      const pkValue = record[pkField];
      
      if (table.records[pkValue]) {
        return `Record with primary key '${pkValue}' already exists!`;
      }
      
      key = pkValue.toString();
    }
    
    // Insert the record
    table.records[key] = record;
    
    // Update indexes if they exist
    if (this.database.indexes[tableName]) {
      for (const indexedCol in this.database.indexes[tableName]) {
        const indexValue = record[indexedCol].toString();
        if (!this.database.indexes[tableName][indexedCol][indexValue]) {
          this.database.indexes[tableName][indexedCol][indexValue] = [];
        }
        this.database.indexes[tableName][indexedCol][indexValue].push(key);
      }
    }
    
    this.save();
    return `Record inserted successfully into table '${tableName}'.`;
  }

  async updateRecords(tableName: string, updates: Record<string, any>, whereClause?: string): Promise<string> {
    const table = this.database.tables[tableName.toLowerCase()];
    
    if (!table) {
      return `Table '${tableName}' does not exist!`;
    }
    
    let updatedCount = 0;
    
    // Parse and apply WHERE clause
    const records = table.records;
    for (const key in records) {
      let includeRecord = true;
      
      // Apply WHERE filtering if present
      if (whereClause) {
        includeRecord = this.evaluateWhereClause(records[key], whereClause);
      }
      
      if (includeRecord) {
        // Update the record
        for (const col in updates) {
          records[key][col] = updates[col];
        }
        updatedCount++;
      }
    }
    
    this.save();
    return `${updatedCount} record(s) updated in table '${tableName}'.`;
  }

  async deleteRecords(tableName: string, whereClause?: string): Promise<string> {
    const table = this.database.tables[tableName.toLowerCase()];
    
    if (!table) {
      return `Table '${tableName}' does not exist!`;
    }
    
    let deletedCount = 0;
    const keysToDelete: string[] = [];
    
    // Find records to delete
    const records = table.records;
    for (const key in records) {
      let includeRecord = true;
      
      // Apply WHERE filtering if present
      if (whereClause) {
        includeRecord = this.evaluateWhereClause(records[key], whereClause);
      }
      
      if (includeRecord) {
        keysToDelete.push(key);
      }
    }
    
    // Delete records
    for (const key of keysToDelete) {
      delete records[key];
      deletedCount++;
    }
    
    this.save();
    return `${deletedCount} record(s) deleted from table '${tableName}'.`;
  }

  async selectRecords(tableName: string, columns: string, whereClause?: string): Promise<any[]> {
    const table = this.database.tables[tableName.toLowerCase()];
    
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist!`);
    }
    
    const records = table.records;
    let result: any[] = [];
    
    // Get all matching records
    for (const key in records) {
      let includeRecord = true;
      
      // Apply WHERE filtering if present
      if (whereClause) {
        includeRecord = this.evaluateWhereClause(records[key], whereClause);
      }
      
      if (includeRecord) {
        result.push(records[key]);
      }
    }
    
    // Handle column selection
    if (columns.trim() !== '*') {
      const selectedColumns = columns.split(',').map(col => col.trim());
      result = result.map(record => {
        const selectedRecord: Record<string, any> = {};
        for (const col of selectedColumns) {
          selectedRecord[col] = record[col];
        }
        return selectedRecord;
      });
    }
    
    return result;
  }

  private evaluateWhereClause(record: Record<string, any>, whereClause: string): boolean {
    // Very simple WHERE clause evaluator
    const conditions = this.parseWhereClause(whereClause);
    let passes = true;
    
    for (const condition of conditions) {
      const { column, operator, value } = condition;
      const recordValue = record[column];
      
      switch(operator) {
        case '=':
          passes = recordValue == value;
          break;
        case '>':
          passes = recordValue > value;
          break;
        case '<':
          passes = recordValue < value;
          break;
        case '>=':
          passes = recordValue >= value;
          break;
        case '<=':
          passes = recordValue <= value;
          break;
        case '!=':
        case '<>':
          passes = recordValue != value;
          break;
      }
      
      if (!passes) break;
    }
    
    return passes;
  }

  private parseWhereClause(whereClause: string): Array<{column: string, operator: string, value: any}> {
    const conditions: Array<{column: string, operator: string, value: any}> = [];
    const conditionRegex = /(\w+)\s*([=<>!]+)\s*(['"]?)(.*?)(['"]?)(?:\s+AND|\s+OR|$)/gi;
    
    let match: RegExpExecArray | null;
    while ((match = conditionRegex.exec(whereClause)) !== null) {
      const column = match[1].toLowerCase();
      const operator = match[2];
      let value: any = match[4];
      
      // Convert value to appropriate type
      if (!isNaN(Number(value))) {
        value = Number(value);
      } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        value = value.toLowerCase() === 'true';
      } else if ((value.startsWith("'") && value.endsWith("'")) || 
                 (value.startsWith('"') && value.endsWith('"'))) {
        value = value.substring(1, value.length - 1);
      }
      
      conditions.push({ column, operator, value });
    }
    
    return conditions;
  }

  async beginTransaction(transactionId: string): Promise<string> {
    if (this.database.activeTransactions[transactionId]) {
      return `Transaction ${transactionId} already exists!`;
    }
    
    // Create checkpoint for rollback
    const checkpoint = JSON.parse(JSON.stringify(this.database.tables));
    
    // Create transaction
    this.database.activeTransactions[transactionId] = {
      status: 'active',
      operations: [],
      checkpoint,
      locks: []
    };
    
    // No locks are acquired at the beginning of a transaction
    // They will be acquired as needed during query execution
    
    this.save();
    return `Transaction ${transactionId} started successfully.`;
  }

  async commitTransaction(transactionId: string): Promise<string> {
    if (!this.database.activeTransactions[transactionId]) {
      return `Transaction ${transactionId} does not exist!`;
    }
    
    if (this.database.activeTransactions[transactionId].status !== 'active') {
      return `Transaction ${transactionId} is not active!`;
    }
    
    // Release all locks via concurrency manager
    this.concurrencyManager.releaseLocks(transactionId);
    
    // Clear the locks in the transaction record
    this.database.activeTransactions[transactionId].locks = [];
    
    // Mark transaction as committed
    this.database.activeTransactions[transactionId].status = 'committed';
    
    // Remove checkpoint (no longer needed)
    if (this.database.activeTransactions[transactionId]) {
      delete this.database.activeTransactions[transactionId].checkpoint;
    }
    
    this.save();
    return `Transaction ${transactionId} committed successfully.`;
  }

  // List all transactions with their status
  async listTransactions(): Promise<{id: string, status: string, locks: string[]}[]> {
    const transactions = [];
    
    for (const id in this.database.activeTransactions) {
      const tx = this.database.activeTransactions[id];
      transactions.push({
        id,
        status: tx.status,
        locks: tx.locks,
        operations: tx.operations.length
      });
    }
    
    return transactions;
  }
  
  // Forcibly terminate all active transactions
  async terminateAllTransactions(): Promise<string> {
    let terminatedCount = 0;
    
    for (const id in this.database.activeTransactions) {
      const tx = this.database.activeTransactions[id];
      if (tx.status === 'active') {
        // Release locks
        this.concurrencyManager.releaseLocks(id);
        
        // Set status to aborted
        tx.status = 'aborted';
        
        // Clear locks
        tx.locks = [];
        
        terminatedCount++;
      }
    }
    
    this.save();
    return `Terminated ${terminatedCount} active transactions.`;
  }
  
  async rollbackTransaction(transactionId: string): Promise<string> {
    if (!this.database.activeTransactions[transactionId]) {
      return `Transaction ${transactionId} does not exist!`;
    }
    
    if (this.database.activeTransactions[transactionId].status !== 'active') {
      return `Transaction ${transactionId} is not active!`;
    }
    
    // Restore database from checkpoint
    if (this.database.activeTransactions[transactionId].checkpoint) {
      this.database.tables = JSON.parse(JSON.stringify(this.database.activeTransactions[transactionId].checkpoint));
    }
    
    // Release all locks via concurrency manager
    this.concurrencyManager.releaseLocks(transactionId);
    
    // Clear the locks in the transaction record
    this.database.activeTransactions[transactionId].locks = [];
    
    // Mark transaction as rolled back
    this.database.activeTransactions[transactionId].status = 'rolled back';
    
    this.save();
    return `Transaction ${transactionId} rolled back successfully.`;
  }

  async executeInTransaction(transactionId: string, query: string): Promise<any> {
    if (!this.database.activeTransactions[transactionId]) {
      return `Transaction ${transactionId} does not exist!`;
    }
    
    if (this.database.activeTransactions[transactionId].status !== 'active') {
      return `Transaction ${transactionId} is not active!`;
    }
    
    // Log the operation
    this.database.activeTransactions[transactionId].operations.push({
      query,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Parse the query to determine the required locks
      // This is a simplified implementation - in a real system you would properly parse the SQL
      const isDrop = /DROP\s+TABLE/i.test(query);
      const isWriteOperation = /INSERT|UPDATE|DELETE|CREATE|ALTER/i.test(query);
      const tableName = this.extractTableName(query);
      
      // Skip lock acquisition for DROP TABLE operations
      if (tableName && !isDrop) {
        // Acquire the appropriate lock (read or write)
        const lockType = isWriteOperation ? 'write' : 'read';
        
        // Try to acquire the lock with timeout
        await this.concurrencyManager.acquireLock(transactionId, tableName, lockType);
        
        // Add to the transaction's lock list
        if (!this.database.activeTransactions[transactionId].locks.includes(tableName)) {
          this.database.activeTransactions[transactionId].locks.push(tableName);
        }
      }
      
      // Actually execute the query
      // Parse the query to determine what type it is
      const queryType = query.trim().split(' ')[0].toUpperCase();
      let result;
      
      if (queryType === 'SELECT') {
        // Extract table name and columns
        const match = query.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*?))?/i);
        if (!match) {
          return 'Invalid SELECT query syntax';
        }
        
        const columns = match[1];
        const tableName = match[2];
        const whereClause = match[3];
        
        result = await this.selectRecords(tableName, columns, whereClause);
      } 
      else if (queryType === 'INSERT') {
        // Extract table name and values
        const match = query.match(/INSERT\s+INTO\s+(\w+)\s+VALUES\s+\((.*?)\)/i);
        if (!match) {
          return 'Invalid INSERT query syntax';
        }
        
        const tableName = match[1];
        const valuesStr = match[2];
        const values = valuesStr.split(',').map((val: string) => {
          val = val.trim();
          if ((val.startsWith("'") && val.endsWith("'")) || 
              (val.startsWith('"') && val.endsWith('"'))) {
            return val.substring(1, val.length - 1);
          }
          return isNaN(Number(val)) ? val : Number(val);
        });
        
        // Get table schema to create record object
        const table = await this.getTable(tableName);
        if (!table) {
          return `Table '${tableName}' does not exist!`;
        }
        
        const columns = Object.keys(table.columns);
        const record: Record<string, any> = {};
        
        for (let i = 0; i < Math.min(columns.length, values.length); i++) {
          record[columns[i]] = values[i];
        }
        
        const key = table.primary_keys.length > 0 ? record[table.primary_keys[0]].toString() : Date.now().toString();
        result = await this.insertRecord(tableName, key, record);
      } 
      else if (queryType === 'UPDATE') {
        // Extract table name, set clause, and where clause
        const match = query.match(/UPDATE\s+(\w+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*?))?$/i);
        if (!match) {
          return 'Invalid UPDATE query syntax';
        }
        
        const tableName = match[1];
        const setClause = match[2];
        const whereClause = match[3];
        
        // Parse SET clause
        const updates: Record<string, any> = {};
        const setParts = setClause.split(',').map((part: string) => part.trim());
        
        for (const part of setParts) {
          const [column, valuePart] = part.split('=').map((p: string) => p.trim());
          
          let value: any = valuePart;
          if ((value.startsWith("'") && value.endsWith("'")) || 
              (value.startsWith('"') && value.endsWith('"'))) {
            value = value.substring(1, value.length - 1);
          } else if (!isNaN(Number(value))) {
            value = Number(value);
          }
          
          updates[column.toLowerCase()] = value;
        }
        
        result = await this.updateRecords(tableName, updates, whereClause);
      } 
      else if (queryType === 'DELETE') {
        // Extract table name and where clause
        const match = query.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*?))?$/i);
        if (!match) {
          return 'Invalid DELETE query syntax';
        }
        
        const tableName = match[1];
        const whereClause = match[2];
        
        result = await this.deleteRecords(tableName, whereClause);
      } else {
        return `Unsupported query type: ${queryType}`;
      }
      
      this.save();
      return result || "Query executed in transaction";
      
    } catch (error) {
      // If lock acquisition failed, return the error
      return `Failed to execute query: ${(error as Error).message}`;
    }
  }
  
  // Helper method to extract table name from a query
  private extractTableName(query: string): string | null {
    // This is a simple extraction and won't work for all SQL queries
    // In a real implementation, you would use a proper SQL parser
    const fromMatch = /FROM\s+([^\s,;]+)/i.exec(query);
    const insertMatch = /INSERT\s+INTO\s+([^\s(,;]+)/i.exec(query);
    const updateMatch = /UPDATE\s+([^\s,;]+)/i.exec(query);
    const deleteMatch = /DELETE\s+FROM\s+([^\s,;]+)/i.exec(query);
    const createMatch = /CREATE\s+TABLE\s+([^\s(,;]+)/i.exec(query);
    const dropMatch = /DROP\s+TABLE\s+([^\s,;]+)/i.exec(query);
    const alterMatch = /ALTER\s+TABLE\s+([^\s,;]+)/i.exec(query);
    
    if (fromMatch) return fromMatch[1];
    if (insertMatch) return insertMatch[1];
    if (updateMatch) return updateMatch[1];
    if (deleteMatch) return deleteMatch[1];
    if (createMatch) return createMatch[1];
    if (dropMatch) return dropMatch[1];
    if (alterMatch) return alterMatch[1];
    
    return null;
  }

  async createIndex(tableName: string, columnName: string | string[]): Promise<string> {
    const table = this.database.tables[tableName.toLowerCase()];
    const isComposite = Array.isArray(columnName);
    const columnNameDisplay = isComposite ? columnName.join(", ") : columnName;
    const indexKey = isComposite ? columnName.join("__") : columnName;
    
    if (!table) {
      return `Table '${tableName}' does not exist!`;
    }
    
    // Verify that all columns exist
    if (isComposite) {
      for (const col of columnName) {
        if (!table.columns[col.toLowerCase()]) {
          return `Column '${col}' does not exist in table '${tableName}'!`;
        }
      }
    } else if (!table.columns[columnName.toLowerCase()]) {
      return `Column '${columnName}' does not exist in table '${tableName}'!`;
    }
    
    // Initialize indexes structure if needed
    if (!this.database.indexes[tableName]) {
      this.database.indexes[tableName] = {};
    }
    
    // Check if index already exists
    if (this.database.indexes[tableName][indexKey]) {
      return `Index on '${tableName}.${columnNameDisplay}' already exists!`;
    }
    
    // Create index
    this.database.indexes[tableName][indexKey] = {};
    
    // Populate index with existing data
    const records = table.records;
    
    for (const key in records) {
      const record = records[key];
      // For composite indexes, combine the values with a delimiter
      let indexValue: string;
      
      if (isComposite) {
        indexValue = columnName.map(col => record[col]?.toString() || '').join('|');
      } else {
        indexValue = record[columnName]?.toString() || '';
      }
      
      if (!this.database.indexes[tableName][indexKey][indexValue]) {
        this.database.indexes[tableName][indexKey][indexValue] = [];
      }
      
      this.database.indexes[tableName][indexKey][indexValue].push(key);
    }
    
    this.save();
    return `Index created on '${tableName}.${columnNameDisplay}' successfully.`;
  }

  async dropIndex(tableName: string, columnName: string | string[]): Promise<string> {
    const isComposite = Array.isArray(columnName);
    const columnNameDisplay = isComposite ? columnName.join(", ") : columnName;
    const indexKey = isComposite ? columnName.join("__") : columnName;
    
    if (!this.database.indexes[tableName] || 
        !this.database.indexes[tableName][indexKey]) {
      return `Index on '${tableName}.${columnNameDisplay}' does not exist!`;
    }
    
    // Drop index
    delete this.database.indexes[tableName][indexKey];
    
    // Clean up empty structures
    if (Object.keys(this.database.indexes[tableName]).length === 0) {
      delete this.database.indexes[tableName];
    }
    
    this.save();
    return `Index on '${tableName}.${columnNameDisplay}' dropped successfully.`;
  }

  async getIndexes(): Promise<Record<string, Record<string, Record<string, string[]>>>> {
    return this.database.indexes;
  }

  async joinTables(table1: string, table2: string, 
                joinColumn1: string, joinColumn2: string, 
                columns?: string[]): Promise<any[]> {
    const t1 = this.database.tables[table1.toLowerCase()];
    const t2 = this.database.tables[table2.toLowerCase()];
    
    if (!t1) {
      throw new Error(`Table '${table1}' does not exist!`);
    }
    
    if (!t2) {
      throw new Error(`Table '${table2}' does not exist!`);
    }
    
    if (!t1.columns[joinColumn1.toLowerCase()]) {
      throw new Error(`Column '${joinColumn1}' does not exist in table '${table1}'!`);
    }
    
    if (!t2.columns[joinColumn2.toLowerCase()]) {
      throw new Error(`Column '${joinColumn2}' does not exist in table '${table2}'!`);
    }
    
    const result: any[] = [];
    const selectedCols = columns || [];
    
    // For each record in table1
    for (const key1 in t1.records) {
      const record1 = t1.records[key1];
      const joinValue1 = record1[joinColumn1];
      
      // For each record in table2
      for (const key2 in t2.records) {
        const record2 = t2.records[key2];
        const joinValue2 = record2[joinColumn2];
        
        // Join condition
        if (joinValue1 == joinValue2) { // Use loose equality for type coercion
          const joinedRecord: Record<string, any> = {};
          
          // If no specific columns selected, include all columns
          if (selectedCols.length === 0) {
            // Add prefixed columns from table1
            for (const col in record1) {
              joinedRecord[`${table1}.${col}`] = record1[col];
            }
            
            // Add prefixed columns from table2
            for (const col in record2) {
              joinedRecord[`${table2}.${col}`] = record2[col];
            }
          } 
          // Otherwise, only include selected columns
          else {
            for (const col of selectedCols) {
              // Format: table.column or just column
              if (col.includes('.')) {
                const [tableName, columnName] = col.split('.');
                if (tableName === table1 && record1[columnName] !== undefined) {
                  joinedRecord[col] = record1[columnName];
                } else if (tableName === table2 && record2[columnName] !== undefined) {
                  joinedRecord[col] = record2[columnName];
                }
              } 
              // If no table specified, check both tables
              else {
                if (record1[col] !== undefined) {
                  joinedRecord[`${table1}.${col}`] = record1[col];
                }
                if (record2[col] !== undefined) {
                  joinedRecord[`${table2}.${col}`] = record2[col];
                }
              }
            }
          }
          
          result.push(joinedRecord);
        }
      }
    }
    
    return result;
  }


  // Access control delegation methods
  async loginUser(username: string, password: string): Promise<User | null> {
    return this.accessManager.loginUser(username, password);
  }
  
  async createUser(username: string, password: string, role: string): Promise<User | null> {
    return this.accessManager.createUser(username, password, role);
  }
  
  async getCurrentUser(): Promise<User | null> {
    return this.accessManager.getCurrentUser();
  }
  
  async logoutUser(): Promise<void> {
    return this.accessManager.logoutUser();
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = this.database.accessControl.users;
    for (const userId in users) {
      if (users[userId].username === username) {
        // Convert LegacyUser to User
        const legacyUser = users[userId];
        return {
          id: legacyUser.id,
          username: legacyUser.username,
          password: legacyUser.password,
          role: legacyUser.role,
          createdAt: legacyUser.createdAt
        };
      }
    }
    return undefined;
  }

  async getUser(id: string): Promise<User | undefined> {
    const legacyUser = this.database.accessControl.users[id];
    if (!legacyUser) return undefined;
    
    // Convert LegacyUser to User
    return {
      id: legacyUser.id,
      username: legacyUser.username,
      password: legacyUser.password,
      role: legacyUser.role,
      createdAt: legacyUser.createdAt
    };
  }
  
  async grantTablePermission(tableName: string, userId: string, permission: 'read' | 'write' | 'admin'): Promise<string> {
    // First check if the table exists
    if (!this.database.tables[tableName.toLowerCase()]) {
      return `Table '${tableName}' does not exist`;
    }
    
    return this.accessManager.grantTablePermission(tableName, userId, permission);
  }
  
  async revokeTablePermission(tableName: string, userId: string, permission: 'read' | 'write' | 'admin'): Promise<string> {
    // First check if the table exists
    if (!this.database.tables[tableName.toLowerCase()]) {
      return `Table '${tableName}' does not exist`;
    }
    
    return this.accessManager.revokeTablePermission(tableName, userId, permission);
  }
  
  async hasTablePermission(tableName: string, permission: 'read' | 'write' | 'admin'): Promise<boolean> {
    return this.accessManager.hasTablePermission(tableName, permission);
  }
  
  async verifyPassword(password: string): Promise<boolean> {
    if (!password) return false;
    
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return false;
    
    // Special handling for admin user 'adbms'
    if (currentUser.username === 'adbms' && password === 'adbms') {
      return true;
    }
    
    // For admin users, always allow
    if (currentUser.role === 'admin') {
      return true;
    }
    
    // Simple password verification - in production use secure comparison
    return currentUser.password === password;
  }
}

export const storage = new MemStorage();
