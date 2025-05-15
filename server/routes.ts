import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  // API routes for the database operations
  app.get("/api/database", async (_req, res) => {
    try {
      const db = await storage.getDatabase();
      res.json(db);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Table operations
  app.get("/api/tables", async (_req, res) => {
    try {
      const tables = await storage.getTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/tables/:name", async (req, res) => {
    try {
      const table = await storage.getTable(req.params.name);
      if (!table) {
        return res
          .status(404)
          .json({ message: `Table '${req.params.name}' not found` });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/tables", async (req, res) => {
    try {
      const { name, columns, constraints } = req.body;
      if (!name || !columns) {
        return res
          .status(400)
          .json({ message: "Name and columns are required" });
      }
      const result = await storage.createTable(name, columns, constraints);
      res.json({ message: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/tables/:name", async (req, res) => {
    try {
      const result = await storage.dropTable(req.params.name);
      res.json({ message: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // SQL Query execution
  app.post("/api/query", async (req, res) => {
    // Start timer for execution time measurement
    const startTime = process.hrtime();
    
    try {
      const { query, password } = req.body;
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }
      
      // Get current user from access control
      const currentUser = await storage.getCurrentUser();
      const isAdmin = currentUser?.role === 'admin';

      // Parse the query to determine what type it is
      const queryType = query.trim().split(" ")[0].toUpperCase();
      let result;

      if (queryType === "SELECT") {
        // Extract table name and columns
        const match = query.match(
          /SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*?))?/i,
        );
        if (!match) {
          return res
            .status(400)
            .json({ message: "Invalid SELECT query syntax" });
        }

        const columns = match[1];
        const tableName = match[2];
        const whereClause = match[3];

        result = await storage.selectRecords(tableName, columns, whereClause);
      } else if (queryType === "INSERT") {
        // Extract table name and values
        const match = query.match(
          /INSERT\s+INTO\s+(\w+)\s+VALUES\s+\((.*?)\)/i,
        );
        if (!match) {
          return res
            .status(400)
            .json({ message: "Invalid INSERT query syntax" });
        }

        const tableName = match[1];
        const valuesStr = match[2];
        const values = valuesStr.split(",").map((val: string) => {
          val = val.trim();
          if (
            (val.startsWith("'") && val.endsWith("'")) ||
            (val.startsWith('"') && val.endsWith('"'))
          ) {
            return val.substring(1, val.length - 1);
          }
          return isNaN(Number(val)) ? val : Number(val);
        });

        // Get table schema to create record object
        const table = await storage.getTable(tableName);
        if (!table) {
          return res
            .status(404)
            .json({ message: `Table '${tableName}' not found` });
        }

        const columns = Object.keys(table.columns);
        const record: Record<string, any> = {};

        columns.forEach((col, index) => {
          record[col] = values[index];
        });

        // Use first value as key or primary key if available
        let recordKey = values[0].toString();
        if (table.primary_keys.length > 0) {
          const pkIndex = columns.indexOf(table.primary_keys[0]);
          recordKey = values[pkIndex].toString();
        }

        result = await storage.insertRecord(tableName, recordKey, record);
      } else if (queryType === "UPDATE") {
        // Extract table name, set clause, and where clause
        const match = query.match(
          /^UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i,
        );
        if (!match) {
          return res
            .status(400)
            .json({ message: "Invalid UPDATE query syntax" });
        }

        const tableName = match[1];
        const setClause = match[2];
        const whereClause = match[3];
        
        // Check if user has write permission for this table
        const hasPermission = await storage.hasTablePermission(tableName, 'write');
        if (!hasPermission && !isAdmin) {
          return res.status(403).json({ 
            message: "Access denied: You don't have write permission for this table", 
            executionTime: `${process.hrtime(startTime)[0]}s ${Math.round(process.hrtime(startTime)[1] / 1000000)}ms` 
          });
        }
        
        // For sensitive UPDATE operations, verify password
        if (!isAdmin) {
          const passwordValid = await storage.verifyPassword(password);
          if (!passwordValid) {
            return res.status(403).json({ 
              message: "Access denied: Password verification failed for UPDATE operation", 
              executionTime: `${process.hrtime(startTime)[0]}s ${Math.round(process.hrtime(startTime)[1] / 1000000)}ms` 
            });
          }
        }

        // Parse SET clause
        const updates: Record<string, any> = {};
        const setParts = setClause
          .split(",")
          .map((part: string) => part.trim());

        for (const part of setParts) {
          const [column, valuePart] = part
            .split("=")
            .map((p: string) => p.trim());

          let value = valuePart;
          if (
            (value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))
          ) {
            value = value.substring(1, value.length - 1);
          } else if (!isNaN(Number(value))) {
            value = Number(value);
          }

          updates[column.toLowerCase()] = value;
        }

        result = await storage.updateRecords(tableName, updates, whereClause);
      } else if (queryType === "DELETE") {
        // Extract table name and where clause
        const match = query.match(
          /^DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i,
        );
        if (!match) {
          return res
            .status(400)
            .json({ message: "Invalid DELETE query syntax" });
        }

        const tableName = match[1];
        const whereClause = match[2];
        
        // Check if user has write permission for this table
        const hasPermission = await storage.hasTablePermission(tableName, 'write');
        if (!hasPermission && !isAdmin) {
          return res.status(403).json({ 
            message: "Access denied: You don't have write permission for this table", 
            executionTime: `${process.hrtime(startTime)[0]}s ${Math.round(process.hrtime(startTime)[1] / 1000000)}ms` 
          });
        }
        
        // For sensitive DELETE operations, verify password
        if (!isAdmin) {
          const passwordValid = await storage.verifyPassword(password);
          if (!passwordValid) {
            return res.status(403).json({ 
              message: "Access denied: Password verification failed for DELETE operation", 
              executionTime: `${process.hrtime(startTime)[0]}s ${Math.round(process.hrtime(startTime)[1] / 1000000)}ms` 
            });
          }
        }

        result = await storage.deleteRecords(tableName, whereClause);
      } else if (
        queryType === "CREATE" &&
        query.toUpperCase().includes("TABLE")
      ) {
        // Extract table name, columns, and constraints
        const match = query.match(
          /CREATE\s+TABLE\s+(\w+)\s+\((.*?)(?:\)\s+CONSTRAINTS\s+\((.*?)\)|\))/i,
        );
        if (!match) {
          return res
            .status(400)
            .json({ message: "Invalid CREATE TABLE query syntax" });
        }

        const tableName = match[1];
        const columnDefs = match[2].split(",").map((col: string) => col.trim());
        const constraintStr = match[3] || "";

        // Parse columns
        const columns: Record<string, any> = {};
        for (const colDef of columnDefs) {
          const [colName, colType] = colDef
            .split(" ")
            .map((part: string) => part.trim());
          columns[colName.toLowerCase()] = {
            type: colType.toLowerCase(),
            constraints: [],
          };
        }

        // Parse constraints
        const constraints: Record<string, any> = {};
        let primaryKeys: string[] = [];

        if (constraintStr) {
          const constraintParts = constraintStr
            .split(",")
            .map((c: string) => c.trim());
          for (const constraint of constraintParts) {
            if (constraint.toUpperCase().includes("PRIMARY_KEY")) {
              const pkCol = constraint.split(" ")[0].trim().toLowerCase();
              if (columns[pkCol]) {
                primaryKeys.push(pkCol);
                columns[pkCol].constraints.push("primary_key");
              }
            }
          }
        }

        result = await storage.createTable(tableName, columns, { primaryKeys });
      } else if (
        queryType === "DROP" &&
        query.toUpperCase().includes("TABLE")
      ) {
        // Extract table name
        const match = query.match(/DROP\s+TABLE\s+(\w+)/i);
        if (!match) {
          return res
            .status(400)
            .json({ message: "Invalid DROP TABLE query syntax" });
        }

        const tableName = match[1];
        
        // Check if user has admin permission for this table
        const hasPermission = await storage.hasTablePermission(tableName, 'admin');
        if (!hasPermission && !isAdmin) {
          return res.status(403).json({ 
            message: "Access denied: You don't have admin permission to drop this table", 
            executionTime: `${process.hrtime(startTime)[0]}s ${Math.round(process.hrtime(startTime)[1] / 1000000)}ms` 
          });
        }
        
        // For DROP TABLE operations, always verify password regardless of admin status
        const passwordValid = await storage.verifyPassword(password);
        if (!passwordValid) {
          return res.status(403).json({ 
            message: "Access denied: Password verification failed for DROP TABLE operation", 
            executionTime: `${process.hrtime(startTime)[0]}s ${Math.round(process.hrtime(startTime)[1] / 1000000)}ms` 
          });
        }
        
        result = await storage.dropTable(tableName);
      } else {
        return res
          .status(400)
          .json({ message: `Unsupported query type: ${queryType}` });
      }

      // Calculate execution time
      const endTime = process.hrtime(startTime);
      const executionTime = `${endTime[0]}s ${Math.round(endTime[1] / 1000000)}ms`;
      
      res.json({ 
        result,
        executionTime 
      });
    } catch (error) {
      // Calculate execution time even for errors
      const endTime = process.hrtime(startTime);
      const executionTime = `${endTime[0]}s ${Math.round(endTime[1] / 1000000)}ms`;
      res.status(500).json({ error: (error as Error).message, executionTime });
    }
  });

  // Transaction operations
  app.post("/api/transactions/begin", async (req, res) => {
    // Start timer for execution time measurement
    const startTime = process.hrtime();
    
    try {
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ 
          message: "Transaction ID is required",
          executionTime: `${process.hrtime(startTime)[0]}s ${Math.round(process.hrtime(startTime)[1] / 1000000)}ms`
        });
      }
      const result = await storage.beginTransaction(transactionId);
      
      // Calculate execution time
      const endTime = process.hrtime(startTime);
      const executionTime = `${endTime[0]}s ${Math.round(endTime[1] / 1000000)}ms`;
      
      res.json({ 
        message: result,
        executionTime
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/transactions/commit", async (req, res) => {
    try {
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }
      const result = await storage.commitTransaction(transactionId);
      res.json({ message: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/transactions/rollback", async (req, res) => {
    try {
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }
      const result = await storage.rollbackTransaction(transactionId);
      res.json({ message: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/transactions/execute", async (req, res) => {
    try {
      const { transactionId, query } = req.body;
      if (!transactionId || !query) {
        return res
          .status(400)
          .json({ message: "Transaction ID and query are required" });
      }
      const result = await storage.executeInTransaction(transactionId, query);
      res.json({ message: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Index operations
  app.post("/api/indexes", async (req, res) => {
    try {
      const { tableName, columnName, isComposite } = req.body;
      if (!tableName || !columnName) {
        return res
          .status(400)
          .json({ message: "Table name and column name are required" });
      }

      // Parse column names for composite indexes
      let columns = columnName;
      if (isComposite && typeof columnName === "string") {
        columns = columnName.split(",").map((col) => col.trim());
      }

      const result = await storage.createIndex(tableName, columns);
      res.json({ message: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/indexes", async (req, res) => {
    try {
      const { tableName, columnName, isComposite } = req.body;
      if (!tableName || !columnName) {
        return res
          .status(400)
          .json({ message: "Table name and column name are required" });
      }

      // Parse column names for composite indexes
      let columns = columnName;
      if (isComposite && typeof columnName === "string") {
        columns = columnName.split(",").map((col) => col.trim());
      }

      const result = await storage.dropIndex(tableName, columns);
      res.json({ message: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/indexes", async (_req, res) => {
    try {
      const indexes = await storage.getIndexes();
      res.json(indexes);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Join operations
  app.post("/api/join", async (req, res) => {
    try {
      const { table1, table2, joinColumn1, joinColumn2, columns } = req.body;
      if (!table1 || !table2 || !joinColumn1 || !joinColumn2) {
        return res.status(400).json({
          message: "Table names and join columns are required",
        });
      }

      const result = await storage.joinTables(
        table1,
        table2,
        joinColumn1,
        joinColumn2,
        columns,
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Transaction operations
  // Get list of all transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.listTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Terminate all active transactions
  app.post("/api/transactions/terminate-all", async (req, res) => {
    try {
      const result = await storage.terminateAllTransactions();
      res.json({ message: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Begin a transaction
  app.post("/api/transactions/begin", async (req, res) => {
    try {
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }

      const result = await storage.beginTransaction(transactionId);
      res.json({ message: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Commit a transaction
  app.post("/api/transactions/commit", async (req, res) => {
    try {
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }

      const result = await storage.commitTransaction(transactionId);
      res.json({ message: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Rollback a transaction
  app.post("/api/transactions/rollback", async (req, res) => {
    try {
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
      }

      const result = await storage.rollbackTransaction(transactionId);
      res.json({ message: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Execute a query in a transaction
  app.post("/api/transactions/execute", async (req, res) => {
    try {
      const { transactionId, query } = req.body;
      if (!transactionId || !query) {
        return res
          .status(400)
          .json({ message: "Transaction ID and query are required" });
      }

      const result = await storage.executeInTransaction(transactionId, query);
      res.json({ message: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Authentication operations
  app.post("/api/logout", async (req, res) => {
    // Start timer for execution time measurement
    const startTime = process.hrtime();
    
    try {
      
      await storage.logoutUser();
      
      // Calculate execution time
      const endTime = process.hrtime(startTime);
      const executionTime = `${endTime[0]}s ${Math.round(endTime[1] / 1000000)}ms`;
      
      res.json({ 
        message: "Logout successful",
        executionTime
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  app.get("/api/user", async (req, res) => {
    // Start timer for execution time measurement
    const startTime = process.hrtime();
    
    try {
      
      const user = await storage.getCurrentUser();
      
      // Calculate execution time
      const endTime = process.hrtime(startTime);
      const executionTime = `${endTime[0]}s ${Math.round(endTime[1] / 1000000)}ms`;
      
      if (user) {
        res.json(user);
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  app.post("/api/login", async (req, res) => {
    // Start timer for execution time measurement
    const startTime = process.hrtime();
    
    try {
      
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ 
          message: "Username and password are required",
          executionTime: `${process.hrtime(startTime)[0]}s ${Math.round(process.hrtime(startTime)[1] / 1000000)}ms`
        });
      }
      
      const user = await storage.loginUser(username, password);
      
      // Calculate execution time
      const endTime = process.hrtime(startTime);
      const executionTime = `${endTime[0]}s ${Math.round(endTime[1] / 1000000)}ms`;
      
      if (user) {
        res.json({ 
          user,
          executionTime
        });
      } else {
        res.status(401).json({
          message: "Invalid username or password",
          executionTime
        });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Permission operations
  app.post("/api/permissions/grant", async (req, res) => {
    try {
      // Start timer for execution time measurement
      const startTime = process.hrtime();
      
      const { tableName, userId, permission, password } = req.body;
      if (!tableName || !userId || !permission) {
        return res.status(400).json({ 
          message: "Table name, user ID and permission are required",
          executionTime: `${process.hrtime(startTime)[0]}s ${Math.round(process.hrtime(startTime)[1] / 1000000)}ms`
        });
      }
      
      // Check if current user is admin - only admins can grant permissions
      const currentUser = await storage.getCurrentUser();
      const isAdmin = currentUser?.role === 'admin';
      
      if (!isAdmin) {
        return res.status(403).json({ 
          message: "Access denied: Only administrators can grant permissions", 
          executionTime: `${process.hrtime(startTime)[0]}s ${Math.round(process.hrtime(startTime)[1] / 1000000)}ms` 
        });
      }
      
      const result = await storage.grantTablePermission(tableName, userId, permission as 'read' | 'write' | 'admin');
      
      // Calculate execution time
      const endTime = process.hrtime(startTime);
      const executionTime = `${endTime[0]}s ${Math.round(endTime[1] / 1000000)}ms`;
      
      res.json({ 
        message: result,
        executionTime
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
