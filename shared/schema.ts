import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Table model - represents a database table
export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  schema: jsonb("schema").notNull(), // Column definitions, constraints, etc.
  data: jsonb("data").notNull(), // Actual record data
});

export const insertTableSchema = createInsertSchema(tables).pick({
  name: true,
  schema: true,
  data: true,
});

// Indexes model
export const indexes = pgTable("indexes", {
  id: serial("id").primaryKey(),
  tableName: text("table_name").notNull(),
  columnName: text("column_name").notNull(),
  indexData: jsonb("index_data").notNull(), // The actual index data structure
});

export const insertIndexSchema = createInsertSchema(indexes).pick({
  tableName: true,
  columnName: true,
  indexData: true,
});

// Transactions model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull(),
  status: text("status").notNull(), // 'active', 'committed', 'rolled back'
  operations: jsonb("operations").notNull(), // Log of operations
  checkpoint: jsonb("checkpoint").notNull(), // Snapshot for rollback
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  transactionId: true,
  status: true,
  operations: true,
  checkpoint: true,
});

// Define the database structure
export const databaseSnapshot = pgTable("database_snapshot", {
  id: serial("id").primaryKey(),
  tables: jsonb("tables").notNull(),
  indexes: jsonb("indexes").notNull(),
  activeTransactions: jsonb("active_transactions").notNull(),
  implicitTransactionCounter: integer("implicit_transaction_counter").notNull(),
});

export const insertDatabaseSnapshotSchema = createInsertSchema(databaseSnapshot).pick({
  tables: true,
  indexes: true,
  activeTransactions: true,
  implicitTransactionCounter: true,
});

// Export types
export type InsertTable = z.infer<typeof insertTableSchema>;
export type Table = typeof tables.$inferSelect;

export type InsertIndex = z.infer<typeof insertIndexSchema>;
export type Index = typeof indexes.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertDatabaseSnapshot = z.infer<typeof insertDatabaseSnapshotSchema>;
export type DatabaseSnapshot = typeof databaseSnapshot.$inferSelect;

// Types for our database engine
export type DatabaseState = {
  tables: Record<string, TableSchema>,
  indexes: Record<string, Record<string, Record<string, string[]>>>,
  activeTransactions: Record<string, TransactionInfo>,
  implicitTransactionCounter: number
};

export type TableSchema = {
  columns: Record<string, ColumnSchema>,
  records: Record<string, Record<string, any>>,
  constraints: Record<string, any>,
  primary_keys: string[],
  foreign_keys: Record<string, any>
};

export type ColumnSchema = {
  type: string,
  constraints: string[]
};

export type TransactionInfo = {
  status: string,
  operations: Array<{
    query: string,
    timestamp: string
  }>,
  checkpoint?: Record<string, TableSchema>,
  locks: string[]
};
