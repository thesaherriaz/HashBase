import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MaterialSymbol } from '@/components/ui/material-symbol';
import Database from '@/lib/database';
import { processQuery } from '@/lib/sqlParser';

interface QueryTabProps {
  onStatusChange: (status: string) => void;
}

export default function QueryTab({ onStatusChange }: QueryTabProps) {
  const [query, setQuery] = useState('');
  const [output, setOutput] = useState('');
  const [tableInfo, setTableInfo] = useState('No tables found in database.');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  
  // Load table info when component mounts
  useEffect(() => {
    refreshTableInfo();
  }, []);
  
  // Refresh table information
  const refreshTableInfo = async () => {
    try {
      onStatusChange('Refreshing table information...');
      const info = await Database.getTableInfo();
      setTableInfo(info);
      onStatusChange('Table information refreshed');
    } catch (error) {
      console.error('Error refreshing table info:', error);
      setTableInfo('Error loading table information.');
      onStatusChange('Failed to refresh table information');
    }
  };
  
  // Execute the SQL query
  const executeQuery = async () => {
    if (!query.trim()) {
      setOutput('Error: Query cannot be empty.');
      return;
    }
    
    try {
      setIsLoading(true);
      onStatusChange('Executing query...');
      
      const response = await processQuery(query);
      
      // Add to history
      setHistory(prev => [...prev.slice(-9), query]);
      
      // Extract the actual result and execution time
      const result = response.result;
      const executionTimeMs = response.executionTimeMs;
      const executionTimeStr = response.executionTime;
      
      // Format the result
      let formattedResult = typeof result === 'object'
        ? JSON.stringify(result, null, 2)
        : result.toString();
      
      // Add execution time in milliseconds points if available
      if (executionTimeMs !== undefined) {
        formattedResult = `Execution Time: ${executionTimeMs} ms\n\n${formattedResult}`;
      } else if (executionTimeStr) {
        formattedResult = `Execution Time: ${executionTimeStr}\n\n${formattedResult}`;
      }
      
      setOutput(formattedResult);
      
      // Refresh table info
      await refreshTableInfo();
      
      const timeMsg = executionTimeMs ? `(${executionTimeMs} ms)` : '';
      onStatusChange(`Query executed successfully ${timeMsg}`);
    } catch (error) {
      console.error('Error executing query:', error);
      setOutput(`Error: ${(error as Error).message}`);
      onStatusChange('Query execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      executeQuery();
    }
  };

  // Load a query from history
  const loadFromHistory = (historyItem: string) => {
    setQuery(historyItem);
  };
  
  return (
    <div className="space-y-6">
      <div className="query-input-section">
        <div className="flex items-center mb-2">
          <MaterialSymbol icon="terminal" className="text-primary mr-2" />
          <h3 className="text-lg font-semibold">SQL Query Editor</h3>
          <div className="text-xs ml-auto text-muted-foreground">Press Ctrl+Enter to execute</div>
        </div>
        
        <div className="query-input-container relative mb-4 border border-border rounded-lg overflow-hidden shadow-sm">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your SQL query here..."
            className="w-full min-h-[100px] p-3 font-mono text-sm border-0 focus:ring-0 resize-y bg-card"
          />
          
          <div className="flex bg-muted/50 border-t border-border p-2">
            <Button 
              onClick={executeQuery}
              disabled={isLoading}
              className="mr-2"
              variant="default"
            >
              {isLoading ? (
                <>
                  <MaterialSymbol icon="refresh" className="mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <MaterialSymbol icon="play_arrow" className="mr-2" />
                  Execute Query
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => setQuery('')}
              variant="outline"
              size="icon"
              title="Clear Editor"
            >
              <MaterialSymbol icon="backspace" />
            </Button>
            
            <div className="ml-auto flex space-x-1">
              {history.length > 0 && (
                <div className="relative group">
                  <Button 
                    variant="outline"
                    size="icon"
                    title="Query History"
                  >
                    <MaterialSymbol icon="history" />
                  </Button>
                  
                  <div className="absolute right-0 top-full hidden group-hover:block bg-popover p-2 rounded-md shadow-md border border-border z-10 min-w-[250px] max-w-[400px] mt-1">
                    <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-2 px-2">Recent Queries</h4>
                    <ul className="text-sm space-y-1">
                      {history.map((item, index) => (
                        <li key={index} className="truncate hover:bg-muted p-2 rounded cursor-pointer" onClick={() => loadFromHistory(item)}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="output-section">
          <div className="flex items-center mb-2">
            <MaterialSymbol icon="output" className="text-primary mr-2" />
            <h3 className="text-lg font-semibold">Query Results</h3>
          </div>
          
          <div className="relative border border-border rounded-lg overflow-hidden shadow-sm">
            <Textarea
              value={output}
              readOnly
              className="w-full h-64 font-mono text-sm p-3 resize-none border-0 focus:ring-0 bg-muted/30"
            />
            
            <div className="absolute top-2 right-2">
              <Button 
                onClick={() => setOutput('')}
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-70 hover:opacity-100"
                title="Clear Output"
              >
                <MaterialSymbol icon="close" size="20px" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="table-info-section">
          <div className="flex items-center mb-2">
            <MaterialSymbol icon="table_chart" className="text-primary mr-2" />
            <h3 className="text-lg font-semibold">Database Schema</h3>
            
            <Button 
              onClick={refreshTableInfo}
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7"
              title="Refresh Schema"
            >
              <MaterialSymbol icon="refresh" size="20px" />
            </Button>
          </div>
          
          <div className="border border-border rounded-lg overflow-hidden shadow-sm">
            <pre className="w-full h-64 font-mono text-sm p-3 overflow-auto bg-muted/30 whitespace-pre-wrap">
              {tableInfo}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="query-examples-section border border-border rounded-lg shadow-sm bg-card">
        <div className="flex items-center p-3 border-b border-border bg-muted/30">
          <MaterialSymbol icon="help" className="text-primary mr-2" />
          <h3 className="text-lg font-semibold">Query Examples</h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-primary mb-1">Data Definition</h4>
              <div className="code-snippet">CREATE TABLE students (id INT, name STRING, age INT) CONSTRAINTS (id PRIMARY_KEY)</div>
              <div className="code-snippet">DROP TABLE students</div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-primary mb-1">Data Manipulation</h4>
              <div className="code-snippet">INSERT INTO students VALUES (1, 'Alice', 21)</div>
              <div className="code-snippet">UPDATE students SET name = 'Bob' WHERE id = 1</div>
              <div className="code-snippet">DELETE FROM students WHERE id = 1</div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-primary mb-1">Basic Queries</h4>
              <div className="code-snippet">SELECT * FROM students</div>
              <div className="code-snippet">SELECT * FROM students WHERE id = 1</div>
              <div className="code-snippet">SELECT DISTINCT age FROM students</div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-primary mb-1">Advanced Queries</h4>
              <div className="code-snippet">SELECT age, COUNT(*) FROM students GROUP BY age</div>
              <div className="code-snippet">SELECT age, COUNT(*) FROM students GROUP BY age HAVING COUNT(*) {'>'} 1</div>
              <div className="code-snippet">SELECT s.name, c.course FROM students s JOIN courses c ON s.id = c.student_id</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
