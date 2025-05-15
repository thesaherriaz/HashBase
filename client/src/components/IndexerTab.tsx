import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Database from '@/lib/database';

interface IndexerTabProps {
  onStatusChange: (status: string) => void;
}

export default function IndexerTab({ onStatusChange }: IndexerTabProps) {
  const [tableName, setTableName] = useState('');
  const [columnName, setColumnName] = useState('');
  const [dropTableName, setDropTableName] = useState('');
  const [dropColumnName, setDropColumnName] = useState('');
  const [output, setOutput] = useState('');
  
  // Load index info when component mounts
  useEffect(() => {
    refreshIndexes();
  }, []);
  
  // Refresh index information
  const refreshIndexes = async () => {
    try {
      const info = await Database.getIndexInfo();
      setOutput(info);
      onStatusChange('Index list refreshed');
    } catch (error) {
      console.error('Error refreshing indexes:', error);
      setOutput('Error loading index information.');
      onStatusChange('Failed to refresh index list');
    }
  };
  
  // Create a new index
  const createIndex = async () => {
    if (!tableName || !columnName) {
      setOutput('Error: Table name and column name are required!');
      return;
    }
    
    try {
      onStatusChange(`Creating index on ${tableName}.${columnName}...`);
      const result = await Database.createIndex(tableName, columnName);
      
      setOutput(result);
      
      // Refresh index list
      await refreshIndexes();
      
      // Clear input fields
      setTableName('');
      setColumnName('');
      
      onStatusChange('Index created successfully');
    } catch (error) {
      console.error('Error creating index:', error);
      setOutput(`Error: ${(error as Error).message}`);
      onStatusChange('Index creation failed');
    }
  };
  
  // Drop an existing index
  const dropIndex = async () => {
    if (!dropTableName || !dropColumnName) {
      setOutput('Error: Table name and column name are required!');
      return;
    }
    
    try {
      onStatusChange(`Dropping index on ${dropTableName}.${dropColumnName}...`);
      const result = await Database.dropIndex(dropTableName, dropColumnName);
      
      setOutput(result);
      
      // Refresh index list
      await refreshIndexes();
      
      // Clear input fields
      setDropTableName('');
      setDropColumnName('');
      
      onStatusChange('Index dropped successfully');
    } catch (error) {
      console.error('Error dropping index:', error);
      setOutput(`Error: ${(error as Error).message}`);
      onStatusChange('Index drop failed');
    }
  };
  
  return (
    <div>
      <div className="flex flex-wrap gap-6">
        <div className="group-box bg-white rounded-lg p-4 shadow-md flex-1 min-w-[300px]">
          <div className="group-title text-lg font-semibold text-primary mb-2">Create Index</div>
          <form className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="tableName" className="font-medium mb-1">Table Name:</label>
              <Input
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="columnName" className="font-medium mb-1">Column Name:</label>
              <Input
                id="columnName"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
              />
            </div>
          </form>
          
          <Button 
            onClick={createIndex}
            className="mt-4"
          >
            Create Index
          </Button>
        </div>
        
        <div className="group-box bg-white rounded-lg p-4 shadow-md flex-1 min-w-[300px]">
          <div className="group-title text-lg font-semibold text-primary mb-2">Drop Index</div>
          <form className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="dropTableName" className="font-medium mb-1">Table Name:</label>
              <Input
                id="dropTableName"
                value={dropTableName}
                onChange={(e) => setDropTableName(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="dropColumnName" className="font-medium mb-1">Column Name:</label>
              <Input
                id="dropColumnName"
                value={dropColumnName}
                onChange={(e) => setDropColumnName(e.target.value)}
              />
            </div>
          </form>
          
          <Button 
            onClick={dropIndex}
            className="mt-4"
          >
            Drop Index
          </Button>
        </div>
      </div>
      
      <Button 
        onClick={refreshIndexes}
        className="my-4"
      >
        Refresh Index List
      </Button>
      
      <div className="index-output-container">
        <Textarea
          value={output}
          readOnly
          className="w-full h-64 bg-light-bg"
        />
      </div>
    </div>
  );
}
