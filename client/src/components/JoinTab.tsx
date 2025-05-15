import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  
  // Execute a join operation
  const executeJoin = async () => {
    if (!table1 || !table2 || !joinColumn1 || !joinColumn2) {
      setOutput('Error: Table names and join columns are required!');
      return;
    }
    
    try {
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
    }
  };
  
  return (
    <div>
      <div className="group-box bg-white rounded-lg p-4 shadow-md mb-4">
        <div className="group-title text-lg font-semibold text-primary mb-2">Inner Join Configuration</div>
        <form className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="table1" className="font-medium mb-1">First Table:</label>
            <Input
              id="table1"
              value={table1}
              onChange={(e) => setTable1(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="table2" className="font-medium mb-1">Second Table:</label>
            <Input
              id="table2"
              value={table2}
              onChange={(e) => setTable2(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="joinColumn1" className="font-medium mb-1">First Table Join Column:</label>
            <Input
              id="joinColumn1"
              value={joinColumn1}
              onChange={(e) => setJoinColumn1(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="joinColumn2" className="font-medium mb-1">Second Table Join Column:</label>
            <Input
              id="joinColumn2"
              value={joinColumn2}
              onChange={(e) => setJoinColumn2(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="selectColumns" className="font-medium mb-1">Columns to Select:</label>
            <Input
              id="selectColumns"
              value={selectColumns}
              onChange={(e) => setSelectColumns(e.target.value)}
              placeholder="comma-separated list of columns"
            />
          </div>
        </form>
      </div>
      
      <Button 
        onClick={executeJoin}
        className="mb-4"
      >
        Execute Join
      </Button>
      
      <div className="join-output-container">
        <Textarea
          value={output}
          readOnly
          className="w-full h-64 bg-light-bg"
        />
      </div>
    </div>
  );
}
