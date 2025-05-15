import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MaterialSymbol } from '@/components/ui/material-symbol';
import Database from '@/lib/database';
import { joinTables } from '@/lib/sqlParser';

interface JoinTabProps {
  onStatusChange: (status: string) => void;
}

export default function JoinTab({ onStatusChange }: JoinTabProps) {
  const [table1, setTable1] = useState('');
  const [table2, setTable2] = useState('');
  const [joinColumn1, setJoinColumn1] = useState('');
  const [joinColumn2, setJoinColumn2] = useState('');
  const [selectColumns, setSelectColumns] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Execute a join operation
  const executeJoin = async () => {
    if (!table1 || !table2 || !joinColumn1 || !joinColumn2) {
      setOutput('Error: Table names and join columns are required!');
      return;
    }
    
    try {
      setIsLoading(true);
      onStatusChange('Executing join operation...');
      
      // Parse selected columns
      const columns = selectColumns.trim() 
        ? selectColumns.split(',').map(col => col.trim()) 
        : [];
      
      const result = await joinTables(
        table1,
        table2,
        joinColumn1,
        joinColumn2,
        columns
      );
      
      setOutput(JSON.stringify(result, null, 2));
      onStatusChange('Join operation executed successfully');
    } catch (error) {
      console.error('Error executing join:', error);
      setOutput(`Error: ${(error as Error).message}`);
      onStatusChange('Join operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear output
  const clearOutput = () => {
    setOutput('');
  };

  // Clear all form fields
  const clearForm = () => {
    setTable1('');
    setTable2('');
    setJoinColumn1('');
    setJoinColumn2('');
    setSelectColumns('');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <MaterialSymbol icon="merge" className="text-primary mr-2" />
        <h3 className="text-lg font-semibold">Join Tables</h3>
      </div>
      
      <div className="join-configuration-section border border-border rounded-lg shadow-sm bg-card overflow-hidden">
        <div className="flex items-center p-3 border-b border-border bg-muted/30">
          <MaterialSymbol icon="schema" className="text-primary mr-2" />
          <h3 className="font-semibold">Join Configuration</h3>
          
          <Button 
            onClick={clearForm}
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7"
            title="Clear Form"
            disabled={isLoading}
          >
            <MaterialSymbol icon="delete_sweep" size="20px" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="table1" className="font-medium text-sm flex items-center">
                  <MaterialSymbol icon="table_chart" className="text-primary mr-2" size="20px" />
                  First Table
                </label>
                <Input
                  id="table1"
                  value={table1}
                  onChange={(e) => setTable1(e.target.value)}
                  placeholder="Enter first table name"
                  className="font-mono"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="joinColumn1" className="font-medium text-sm flex items-center">
                  <MaterialSymbol icon="key" className="text-primary mr-2" size="20px" />
                  First Table Join Column
                </label>
                <Input
                  id="joinColumn1"
                  value={joinColumn1}
                  onChange={(e) => setJoinColumn1(e.target.value)}
                  placeholder="Column to join on"
                  className="font-mono"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="table2" className="font-medium text-sm flex items-center">
                  <MaterialSymbol icon="table_chart" className="text-primary mr-2" size="20px" />
                  Second Table
                </label>
                <Input
                  id="table2"
                  value={table2}
                  onChange={(e) => setTable2(e.target.value)}
                  placeholder="Enter second table name"
                  className="font-mono"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="joinColumn2" className="font-medium text-sm flex items-center">
                  <MaterialSymbol icon="key" className="text-primary mr-2" size="20px" />
                  Second Table Join Column
                </label>
                <Input
                  id="joinColumn2"
                  value={joinColumn2}
                  onChange={(e) => setJoinColumn2(e.target.value)}
                  placeholder="Column to join on"
                  className="font-mono"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <label htmlFor="selectColumns" className="font-medium text-sm flex items-center">
              <MaterialSymbol icon="view_column" className="text-primary mr-2" size="20px" />
              Columns to Select
            </label>
            <Input
              id="selectColumns"
              value={selectColumns}
              onChange={(e) => setSelectColumns(e.target.value)}
              placeholder="comma-separated list of columns (leave empty to select all columns)"
              className="font-mono"
              disabled={isLoading}
            />
            <div className="text-xs text-muted-foreground">
              Example: table1.id, table1.name, table2.description
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button 
              onClick={executeJoin}
              disabled={isLoading || !table1 || !table2 || !joinColumn1 || !joinColumn2}
              className="px-6"
              variant="default"
            >
              {isLoading ? (
                <>
                  <MaterialSymbol icon="refresh" className="mr-2 animate-spin" />
                  Executing Join...
                </>
              ) : (
                <>
                  <MaterialSymbol icon="merge_type" className="mr-2" />
                  Execute Join Operation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="join-results-section">
        <div className="flex items-center mb-2">
          <MaterialSymbol icon="data_table" className="text-primary mr-2" />
          <h3 className="text-lg font-semibold">Join Results</h3>
          
          <Button 
            onClick={clearOutput}
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7"
            title="Clear Results"
          >
            <MaterialSymbol icon="delete" size="20px" />
          </Button>
        </div>
        
        <div className="relative border border-border rounded-lg overflow-hidden shadow-sm">
          <pre className="w-full h-64 font-mono text-sm p-3 overflow-auto bg-muted/30 whitespace-pre-wrap">
            {output || 'Execute a join operation to see results here.'}
          </pre>
        </div>
      </div>
      
      <div className="join-reference-section border border-border rounded-lg shadow-sm bg-card p-4">
        <div className="flex items-center mb-3">
          <MaterialSymbol icon="info" className="text-primary mr-2" />
          <h3 className="text-lg font-semibold">Join Operation Guide</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-primary mb-2">About Table Joins</h4>
            <p className="text-muted-foreground">
              Joins combine rows from two or more tables based on a related column. 
              The current implementation performs an inner join, which returns rows
              when there is at least one match in both tables.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Example Usage</h4>
            <div className="code-snippet mb-2">
              Table: students (id, name, age)
              <br />
              Table: courses (id, course_name, student_id)
            </div>
            <div className="code-snippet">
              Join students and courses on students.id = courses.student_id
              <br />
              Select columns: students.name, courses.course_name
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
