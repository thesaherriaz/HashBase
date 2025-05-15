import { 
  DatabaseState, 
  TableSchema, 
  ColumnSchema, 
  TransactionInfo
} from "@shared/schema";

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
  createIndex(tableName: string, columnName: string): Promise<string>;
  dropIndex(tableName: string, columnName: string): Promise<string>;
  getIndexes(): Promise<Record<string, Record<string, Record<string, string[]>>>>;
  
  // Join operations
  joinTables(table1: string, table2: string, joinColumn1: string, joinColumn2: string, columns?: string[]): Promise<any[]>;
}

// In-memory implementation of storage
export class MemStorage implements IStorage {
  private database: DatabaseState;

  constructor() {
    // Initialize with empty database
    this.database = {
      tables: {},
      indexes: {},
      activeTransactions: {},
      implicitTransactionCounter: 0
    };
    
    // Load from localStorage if available (client-side)
    if (typeof localStorage !== 'undefined') {
      const savedDB = localStorage.getItem('database');
      if (savedDB) {
        try {
          this.database = JSON.parse(savedDB);
        } catch (e) {
          console.error("Failed to load database from localStorage:", e);
        }
      }
    }
  }

  private save() {
    // Save to localStorage if available (client-side)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('database', JSON.stringify(this.database));
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
      let value = match[4];
      
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
    
    // Release all locks
    this.database.activeTransactions[transactionId].locks = [];
    
    // Mark transaction as committed
    this.database.activeTransactions[transactionId].status = 'committed';
    
    // Remove checkpoint (no longer needed)
    delete this.database.activeTransactions[transactionId].checkpoint;
    
    this.save();
    return `Transaction ${transactionId} committed successfully.`;
  }

  async rollbackTransaction(transactionId: string): Promise<string> {
    if (!this.database.activeTransactions[transactionId]) {
      return `Transaction ${transactionId} does not exist!`;
    }
    
    // Restore database from checkpoint
    if (this.database.activeTransactions[transactionId].checkpoint) {
      this.database.tables = this.database.activeTransactions[transactionId].checkpoint;
    }
    
    // Release all locks
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
    
    // Execute the query
    // This would normally call into the SQL parser/executor
    // For now, we'll log it and return a placeholder result
    
    this.database.activeTransactions[transactionId].operations.push({
      query,
      timestamp: new Date().toISOString()
    });
    
    this.save();
    return "Query executed in transaction";
  }

  async createIndex(tableName: string, columnName: string): Promise<string> {
    const table = this.database.tables[tableName.toLowerCase()];
    
    if (!table) {
      return `Table '${tableName}' does not exist!`;
    }
    
    if (!table.columns[columnName.toLowerCase()]) {
      return `Column '${columnName}' does not exist in table '${tableName}'!`;
    }
    
    // Initialize indexes structure if needed
    if (!this.database.indexes[tableName]) {
      this.database.indexes[tableName] = {};
    }
    
    // Check if index already exists
    if (this.database.indexes[tableName][columnName]) {
      return `Index on '${tableName}.${columnName}' already exists!`;
    }
    
    // Create index
    this.database.indexes[tableName][columnName] = {};
    
    // Populate index with existing data
    const records = table.records;
    
    for (const key in records) {
      const record = records[key];
      const indexValue = record[columnName].toString();
      
      if (!this.database.indexes[tableName][columnName][indexValue]) {
        this.database.indexes[tableName][columnName][indexValue] = [];
      }
      
      this.database.indexes[tableName][columnName][indexValue].push(key);
    }
    
    this.save();
    return `Index created on '${tableName}.${columnName}' successfully.`;
  }

  async dropIndex(tableName: string, columnName: string): Promise<string> {
    if (!this.database.indexes[tableName] || 
        !this.database.indexes[tableName][columnName]) {
      return `Index on '${tableName}.${columnName}' does not exist!`;
    }
    
    // Drop index
    delete this.database.indexes[tableName][columnName];
    
    // Clean up empty structures
    if (Object.keys(this.database.indexes[tableName]).length === 0) {
      delete this.database.indexes[tableName];
    }
    
    this.save();
    return `Index on '${tableName}.${columnName}' dropped successfully.`;
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
}

export const storage = new MemStorage();
