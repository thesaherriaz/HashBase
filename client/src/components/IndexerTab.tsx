import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MaterialSymbol } from '@/components/ui/material-symbol';
import Database from '@/lib/database';

interface IndexerTabProps {
  onStatusChange: (status: string) => void;
}

export default function IndexerTab({ onStatusChange }: IndexerTabProps) {
  const [tableName, setTableName] = useState('');
  const [columnName, setColumnName] = useState('');
  const [isComposite, setIsComposite] = useState(false);
  const [dropTableName, setDropTableName] = useState('');
  const [dropColumnName, setDropColumnName] = useState('');
  const [dropIsComposite, setDropIsComposite] = useState(false);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load index info when component mounts
  useEffect(() => {
    refreshIndexes();
  }, []);
  
  // Refresh index information
  const refreshIndexes = async () => {
    try {
      setIsLoading(true);
      onStatusChange('Refreshing index information...');
      const info = await Database.getIndexInfo();
      setOutput(info);
      onStatusChange('Index list refreshed');
    } catch (error) {
      console.error('Error refreshing indexes:', error);
      setOutput('Error loading index information.');
      onStatusChange('Failed to refresh index list');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new index
  const createIndex = async () => {
    if (!tableName || !columnName) {
      setOutput(prev => `${prev}\nError: Table name and column name are required!`);
      return;
    }
    
    try {
      setIsLoading(true);
      const displayColumns = isComposite ? columnName.split(',').map(c => c.trim()).join(', ') : columnName;
      onStatusChange(`Creating ${isComposite ? 'composite ' : ''}index on ${tableName}.${displayColumns}...`);
      
      const result = await Database.createIndex(tableName, columnName, isComposite);
      
      setOutput(prev => `${prev}\n${result}`);
      
      // Refresh index list
      await refreshIndexes();
      
      // Clear input fields
      setTableName('');
      setColumnName('');
      setIsComposite(false);
      
      onStatusChange('Index created successfully');
    } catch (error) {
      console.error('Error creating index:', error);
      setOutput(prev => `${prev}\nError: ${(error as Error).message}`);
      onStatusChange('Index creation failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Drop an existing index
  const dropIndex = async () => {
    if (!dropTableName || !dropColumnName) {
      setOutput(prev => `${prev}\nError: Table name and column name are required!`);
      return;
    }
    
    try {
      setIsLoading(true);
      const displayColumns = dropIsComposite ? dropColumnName.split(',').map(c => c.trim()).join(', ') : dropColumnName;
      onStatusChange(`Dropping ${dropIsComposite ? 'composite ' : ''}index on ${dropTableName}.${displayColumns}...`);
      
      const result = await Database.dropIndex(dropTableName, dropColumnName, dropIsComposite);
      
      setOutput(prev => `${prev}\n${result}`);
      
      // Refresh index list
      await refreshIndexes();
      
      // Clear input fields
      setDropTableName('');
      setDropColumnName('');
      setDropIsComposite(false);
      
      onStatusChange('Index dropped successfully');
    } catch (error) {
      console.error('Error dropping index:', error);
      setOutput(prev => `${prev}\nError: ${(error as Error).message}`);
      onStatusChange('Index drop failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear output log
  const clearOutput = () => {
    setOutput('');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2">
        <MaterialSymbol icon="speed" className="text-primary mr-2" />
        <h3 className="text-lg font-semibold">Database Indexing</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border border-border rounded-lg shadow-sm bg-card">
          <div className="flex items-center p-3 border-b border-border bg-muted/30">
            <MaterialSymbol icon="add_chart" className="text-primary mr-2" />
            <h3 className="font-semibold">Create Index</h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="tableName" className="font-medium text-sm">Table Name:</label>
              <Input
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Enter table name"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="columnName" className="font-medium text-sm">Column Name:</label>
              <Input
                id="columnName"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                placeholder="Enter column name"
                disabled={isLoading}
              />
            </div>
            
            <Button 
              onClick={createIndex}
              disabled={isLoading || !tableName || !columnName}
              className="w-full"
              variant="default"
            >
              {isLoading ? (
                <>
                  <MaterialSymbol icon="refresh" className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <MaterialSymbol icon="add" className="mr-2" />
                  Create Index
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="border border-border rounded-lg shadow-sm bg-card">
          <div className="flex items-center p-3 border-b border-border bg-muted/30">
            <MaterialSymbol icon="delete_sweep" className="text-primary mr-2" />
            <h3 className="font-semibold">Drop Index</h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="dropTableName" className="font-medium text-sm">Table Name:</label>
              <Input
                id="dropTableName"
                value={dropTableName}
                onChange={(e) => setDropTableName(e.target.value)}
                placeholder="Enter table name"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="dropColumnName" className="font-medium text-sm">Column Name:</label>
              <Input
                id="dropColumnName"
                value={dropColumnName}
                onChange={(e) => setDropColumnName(e.target.value)}
                placeholder="Enter column name"
                disabled={isLoading}
              />
            </div>
            
            <Button 
              onClick={dropIndex}
              disabled={isLoading || !dropTableName || !dropColumnName}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <MaterialSymbol icon="refresh" className="mr-2 animate-spin" />
                  Dropping...
                </>
              ) : (
                <>
                  <MaterialSymbol icon="delete" className="mr-2" />
                  Drop Index
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="index-output-section">
        <div className="flex items-center mb-2">
          <MaterialSymbol icon="list" className="text-primary mr-2" />
          <h3 className="text-lg font-semibold">Existing Indexes</h3>
          
          <div className="ml-auto flex">
            <Button 
              onClick={refreshIndexes}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="mr-2"
            >
              {isLoading ? (
                <MaterialSymbol icon="refresh" className="mr-1 animate-spin" />
              ) : (
                <MaterialSymbol icon="refresh" className="mr-1" />
              )}
              Refresh
            </Button>
            
            <Button 
              onClick={clearOutput}
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Clear Output"
            >
              <MaterialSymbol icon="delete" size="20px" />
            </Button>
          </div>
        </div>
        
        <div className="relative border border-border rounded-lg overflow-hidden shadow-sm">
          <pre className="w-full h-64 font-mono text-sm p-3 overflow-auto bg-muted/30 whitespace-pre-wrap">
            {output || 'No indexes found in database. Create an index to improve query performance.'}
          </pre>
        </div>
      </div>
      
      <div className="indexing-info-section border border-border rounded-lg shadow-sm bg-card p-4">
        <div className="flex items-center mb-3">
          <MaterialSymbol icon="info" className="text-primary mr-2" />
          <h3 className="text-lg font-semibold">Indexing Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-primary mb-2">What are Indexes?</h4>
            <p className="text-muted-foreground">
              Database indexes are special data structures that improve the speed of data retrieval operations.
              They work similar to a book's index, providing a quick way to look up records without scanning 
              the entire table.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">When to Use Indexes</h4>
            <ul className="list-disc ml-4 text-muted-foreground space-y-1">
              <li>Columns frequently used in WHERE clauses</li>
              <li>Columns used in JOIN operations</li>
              <li>Columns used for sorting (ORDER BY)</li>
              <li>Columns with high cardinality (many unique values)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
