import { DatabaseState, TableSchema, ColumnSchema, TransactionInfo } from '@shared/schema';
import { apiRequest } from './queryClient';

// Class to handle database operations
export class Database {
  private static instance: Database;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Execute a SQL query
  async executeQuery(query: string): Promise<any> {
    try {
      const response = await apiRequest('POST', '/api/query', { query });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // Get table information
  async getTableInfo(): Promise<string> {
    try {
      const response = await apiRequest('GET', '/api/tables');
      const tables = await response.json();
      
      let info = '';
      
      for (const tableName in tables) {
        const table = tables[tableName];
        info += `Table: ${tableName}\n`;
        info += `Columns: ${Object.keys(table.columns).join(', ')}\n`;
        info += `Primary Keys: ${table.primary_keys.join(', ') || 'None'}\n`;
        info += `Records: ${Object.keys(table.records).length}\n\n`;
      }
      
      return info || 'No tables found in database.';
    } catch (error) {
      console.error('Error getting table info:', error);
      return 'Error retrieving table information.';
    }
  }

  // Get index information
  async getIndexInfo(): Promise<string> {
    try {
      const response = await apiRequest('GET', '/api/indexes');
      const indexes = await response.json();
      
      let info = '';
      
      for (const tableName in indexes) {
        for (const columnName in indexes[tableName]) {
          info += `Index on ${tableName}.${columnName}\n`;
          info += `Keys: ${Object.keys(indexes[tableName][columnName]).length}\n\n`;
        }
      }
      
      return info || 'No indexes found in database.';
    } catch (error) {
      console.error('Error getting index info:', error);
      return 'Error retrieving index information.';
    }
  }

  // Get information about active transactions and locks
  async getTransactionInfo(): Promise<any> {
    try {
      const response = await apiRequest('GET', '/api/transactions');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting transaction info:', error);
      throw error;
    }
  }
  
  // Transaction operations
  async beginTransaction(transactionId: string): Promise<{message: string, executionTime: string} | string> {
    try {
      const response = await apiRequest('POST', '/api/transactions/begin', { transactionId });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error beginning transaction:', error);
      return (error as Error).message;
    }
  }

  async commitTransaction(transactionId: string): Promise<{message: string, executionTime: string} | string> {
    try {
      const response = await apiRequest('POST', '/api/transactions/commit', { transactionId });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error committing transaction:', error);
      return (error as Error).message;
    }
  }

  async rollbackTransaction(transactionId: string): Promise<{message: string, executionTime: string} | string> {
    try {
      const response = await apiRequest('POST', '/api/transactions/rollback', { transactionId });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error rolling back transaction:', error);
      return (error as Error).message;
    }
  }

  async executeInTransaction(transactionId: string, query: string): Promise<{message: string, executionTime: string} | string> {
    try {
      const response = await apiRequest('POST', '/api/transactions/execute', { 
        transactionId, 
        query 
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error executing in transaction:', error);
      return (error as Error).message;
    }
  }

  // Index operations
  async createIndex(tableName: string, columnName: string, isComposite: boolean = false): Promise<string> {
    try {
      const response = await apiRequest('POST', '/api/indexes', { 
        tableName, 
        columnName,
        isComposite
      });
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error creating index:', error);
      return (error as Error).message;
    }
  }

  async dropIndex(tableName: string, columnName: string, isComposite: boolean = false): Promise<string> {
    try {
      const response = await apiRequest('DELETE', '/api/indexes', { 
        tableName, 
        columnName,
        isComposite
      });
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error dropping index:', error);
      return (error as Error).message;
    }
  }

  // Join operations
  async joinTables(
    table1: string, 
    table2: string, 
    joinColumn1: string, 
    joinColumn2: string, 
    columns?: string[]
  ): Promise<any> {
    try {
      const response = await apiRequest('POST', '/api/join', { 
        table1, 
        table2, 
        joinColumn1, 
        joinColumn2,
        columns
      });
      return await response.json();
    } catch (error) {
      console.error('Error executing join:', error);
      throw error;
    }
  }
}

export default Database.getInstance();
