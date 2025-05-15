// Simple SQL Parser for the database engine
// This handles parsing SQL statements and dispatching them to the database engine

import Database from './database';

export async function processQuery(query: string): Promise<any> {
  try {
    const result = await Database.executeQuery(query);
    
    // Convert execution time to milliseconds points if available
    if (result && result.executionTime) {
      // Parse the execution time (format: "Xs Yms")
      const timeRegex = /(\d+)s\s+(\d+)ms/;
      const matches = result.executionTime.match(timeRegex);
      
      if (matches && matches.length === 3) {
        const seconds = parseInt(matches[1], 10);
        const milliseconds = parseInt(matches[2], 10);
        // Convert to total milliseconds
        result.executionTimeMs = (seconds * 1000) + milliseconds;
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`SQL Error: ${(error as Error).message}`);
  }
}

export function parseWhereClause(whereClause: string): Array<{column: string, operator: string, value: any}> {
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

export async function joinTables(
  table1: string, 
  table2: string, 
  joinColumn1: string, 
  joinColumn2: string, 
  selectedColumns: string[]
): Promise<any> {
  try {
    return await Database.joinTables(table1, table2, joinColumn1, joinColumn2, selectedColumns);
  } catch (error) {
    throw new Error(`Join Error: ${(error as Error).message}`);
  }
}
