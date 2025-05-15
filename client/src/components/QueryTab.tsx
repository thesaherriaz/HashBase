import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Database from '@/lib/database';
import { processQuery } from '@/lib/sqlParser';

interface QueryTabProps {
  onStatusChange: (status: string) => void;
}

export default function QueryTab({ onStatusChange }: QueryTabProps) {
  const [query, setQuery] = useState('');
  const [output, setOutput] = useState('');
  const [tableInfo, setTableInfo] = useState('No tables found in database.');
  
  // Load table info when component mounts
  useEffect(() => {
    refreshTableInfo();
  }, []);
  
  // Refresh table information
  const refreshTableInfo = async () => {
    try {
      const info = await Database.getTableInfo();
      setTableInfo(info);
    } catch (error) {
      console.error('Error refreshing table info:', error);
      setTableInfo('Error loading table information.');
    }
  };
  
  // Execute the SQL query
  const executeQuery = async () => {
    if (!query.trim()) {
      setOutput('Error: Query cannot be empty.');
      return;
    }
    
    try {
      onStatusChange('Executing query...');
      const result = await processQuery(query);
      
      // Format the result
      const formattedResult = typeof result === 'object'
        ? JSON.stringify(result, null, 2)
        : result.toString();
      
      setOutput(formattedResult);
      
      // Refresh table info
      await refreshTableInfo();
      
      onStatusChange('Query executed successfully');
    } catch (error) {
      console.error('Error executing query:', error);
      setOutput(`Error: ${(error as Error).message}`);
      onStatusChange('Query execution failed');
    }
  };
  
  return (
    <div>
      <div className="query-input-container mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your SQL-like query here..."
          className="w-full p-3"
        />
      </div>
      
      <Button 
        onClick={executeQuery}
        className="mb-4"
      >
        Execute Query
      </Button>
      
      <div className="query-output-container mb-4">
        <Textarea
          value={output}
          readOnly
          className="w-full h-40 bg-light-bg"
        />
      </div>
      
      <div className="group-box bg-white rounded-lg p-4 shadow-md mb-4">
        <div className="group-title text-lg font-semibold text-primary mb-2">📋 Table Info</div>
        <Textarea
          value={tableInfo}
          readOnly
          className="w-full h-32 bg-light-bg"
        />
      </div>
      
      <div className="group-box bg-white rounded-lg p-4 shadow-md">
        <div className="group-title text-lg font-semibold text-primary mb-2">Query Examples</div>
        <div className="bg-light-bg p-4 rounded-lg text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-bold">CREATE TABLE:</span> CREATE TABLE students (id INT, name STRING, age INT) CONSTRAINTS (id PRIMARY_KEY)</li>
            <li><span className="font-bold">INSERT:</span> INSERT INTO students VALUES (1, 'Alice', 21)</li>
            <li><span className="font-bold">SELECT:</span> SELECT * FROM students WHERE id = 1</li>
            <li><span className="font-bold">UPDATE:</span> UPDATE students SET name = 'Bob' WHERE id = 1</li>
            <li><span className="font-bold">DELETE:</span> DELETE FROM students WHERE id = 1</li>
            <li><span className="font-bold">DROP TABLE:</span> DROP TABLE students</li>
            <li><span className="font-bold">GROUP BY:</span> SELECT age, COUNT(*) FROM students GROUP BY age</li>
            <li><span className="font-bold">HAVING:</span> SELECT age, COUNT(*) FROM students GROUP BY age HAVING COUNT(*) {'>'}  1</li>
            <li><span className="font-bold">DISTINCT:</span> SELECT DISTINCT age FROM students</li>
            <li><span className="font-bold">JOIN:</span> SELECT s.name, c.course FROM students s JOIN courses c ON s.id = c.student_id</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
