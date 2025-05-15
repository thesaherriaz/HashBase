import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MaterialSymbol } from '@/components/ui/material-symbol';
import Database from '@/lib/database';

interface TransactionTabProps {
  onStatusChange: (status: string) => void;
}

export default function TransactionTab({ onStatusChange }: TransactionTabProps) {
  const [transactionId, setTransactionId] = useState('');
  const [transactionQuery, setTransactionQuery] = useState('');
  const [output, setOutput] = useState('');
  const [activeTransaction, setActiveTransaction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Begin a new transaction
  const beginTransaction = async () => {
    try {
      setIsLoading(true);
      // Generate a transaction ID if not provided
      let txId = transactionId.trim();
      if (!txId) {
        txId = `transaction_${Date.now()}`;
        setTransactionId(txId);
      }
      
      onStatusChange(`Starting transaction ${txId}...`);
      const result = await Database.beginTransaction(txId);
      
      setOutput(`${new Date().toLocaleTimeString()} - Transaction started: ${txId}\n${result}`);
      setActiveTransaction(txId);
      onStatusChange(`Active transaction: ${txId}`);
    } catch (error) {
      console.error('Error beginning transaction:', error);
      setOutput(`${new Date().toLocaleTimeString()} - Error: ${(error as Error).message}`);
      onStatusChange('Transaction start failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Commit the current transaction
  const commitTransaction = async () => {
    if (!activeTransaction) {
      setOutput(`${new Date().toLocaleTimeString()} - Error: No active transaction to commit!`);
      return;
    }
    
    try {
      setIsLoading(true);
      onStatusChange(`Committing transaction ${activeTransaction}...`);
      const result = await Database.commitTransaction(activeTransaction);
      
      setOutput(prev => `${prev}\n${new Date().toLocaleTimeString()} - Transaction committed: ${activeTransaction}\n${result}`);
      setActiveTransaction(null);
      onStatusChange('Transaction committed successfully');
    } catch (error) {
      console.error('Error committing transaction:', error);
      setOutput(prev => `${prev}\n${new Date().toLocaleTimeString()} - Error: ${(error as Error).message}`);
      onStatusChange('Transaction commit failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Rollback the current transaction
  const rollbackTransaction = async () => {
    if (!activeTransaction) {
      setOutput(`${new Date().toLocaleTimeString()} - Error: No active transaction to rollback!`);
      return;
    }
    
    try {
      setIsLoading(true);
      onStatusChange(`Rolling back transaction ${activeTransaction}...`);
      const result = await Database.rollbackTransaction(activeTransaction);
      
      setOutput(prev => `${prev}\n${new Date().toLocaleTimeString()} - Transaction rolled back: ${activeTransaction}\n${result}`);
      setActiveTransaction(null);
      onStatusChange('Transaction rolled back successfully');
    } catch (error) {
      console.error('Error rolling back transaction:', error);
      setOutput(prev => `${prev}\n${new Date().toLocaleTimeString()} - Error: ${(error as Error).message}`);
      onStatusChange('Transaction rollback failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Execute a query within the current transaction
  const executeInTransaction = async () => {
    if (!activeTransaction) {
      setOutput(prev => `${prev}\n${new Date().toLocaleTimeString()} - Error: No active transaction!`);
      return;
    }
    
    if (!transactionQuery.trim()) {
      setOutput(prev => `${prev}\n${new Date().toLocaleTimeString()} - Error: Query cannot be empty.`);
      return;
    }
    
    try {
      setIsLoading(true);
      onStatusChange(`Executing query in transaction ${activeTransaction}...`);
      const result = await Database.executeInTransaction(activeTransaction, transactionQuery);
      
      setOutput(prev => `${prev}\n${new Date().toLocaleTimeString()} - Query executed: ${transactionQuery}\n${result}`);
      setTransactionQuery('');
      onStatusChange(`Query executed in transaction ${activeTransaction}`);
    } catch (error) {
      console.error('Error executing in transaction:', error);
      setOutput(prev => `${prev}\n${new Date().toLocaleTimeString()} - Error: ${(error as Error).message}`);
      onStatusChange('Query execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear the output log
  const clearOutput = () => {
    setOutput('');
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      executeInTransaction();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="transaction-status-section">
        <div className="flex items-center mb-2">
          <MaterialSymbol icon="database_sync" className="text-primary mr-2" />
          <h3 className="text-lg font-semibold">Transaction Control</h3>
        </div>
        
        <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-card">
          <div className="flex items-center p-4 bg-muted/30 border-b border-border">
            <div className="flex-1">
              <Input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Transaction ID (optional)"
                className="max-w-md"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Leave empty to generate an automatic transaction ID
              </div>
            </div>
            
            <div className="status-indicator px-4 py-1 rounded-full font-medium text-sm ml-auto">
              {activeTransaction ? (
                <span className="flex items-center text-green-600">
                  <MaterialSymbol icon="radio_button_checked" className="mr-1" fill />
                  Transaction Active
                </span>
              ) : (
                <span className="flex items-center text-muted-foreground">
                  <MaterialSymbol icon="radio_button_unchecked" className="mr-1" />
                  No Active Transaction
                </span>
              )}
            </div>
          </div>
          
          <div className="p-4 flex flex-wrap gap-3">
            <Button 
              onClick={beginTransaction}
              disabled={isLoading || !!activeTransaction}
              variant="default"
              className="flex-1 min-w-[120px]"
            >
              <MaterialSymbol icon="play_circle" className="mr-2" />
              Begin Transaction
            </Button>
            
            <Button 
              onClick={commitTransaction}
              disabled={isLoading || !activeTransaction}
              variant="default"
              className="flex-1 min-w-[120px]"
            >
              <MaterialSymbol icon="check_circle" className="mr-2" />
              Commit Transaction
            </Button>
            
            <Button 
              onClick={rollbackTransaction}
              disabled={isLoading || !activeTransaction}
              variant="outline"
              className="flex-1 min-w-[120px]"
            >
              <MaterialSymbol icon="cancel" className="mr-2" />
              Rollback Transaction
            </Button>
          </div>
          
          {activeTransaction && (
            <div className="p-4 pt-0">
              <div className="bg-muted/30 p-3 rounded-md border border-border">
                <div className="text-xs text-muted-foreground mb-1">Active Transaction ID:</div>
                <div className="font-mono text-sm overflow-x-auto">{activeTransaction}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="transaction-query-section">
        <div className="flex items-center mb-2">
          <MaterialSymbol icon="terminal" className="text-primary mr-2" />
          <h3 className="text-lg font-semibold">Transaction Query</h3>
          <div className="text-xs ml-auto text-muted-foreground">Press Ctrl+Enter to execute</div>
        </div>
        
        <div className="transaction-query-container relative border border-border rounded-lg overflow-hidden shadow-sm">
          <Textarea
            value={transactionQuery}
            onChange={(e) => setTransactionQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeTransaction 
              ? "Enter SQL query to execute within the transaction..." 
              : "Start a transaction before executing a query..."}
            disabled={!activeTransaction || isLoading}
            className="w-full min-h-[100px] p-3 font-mono text-sm border-0 focus:ring-0 resize-y bg-card"
          />
          
          <div className="flex bg-muted/50 border-t border-border p-2">
            <Button 
              onClick={executeInTransaction}
              disabled={isLoading || !activeTransaction || !transactionQuery.trim()}
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
                  Execute in Transaction
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => setTransactionQuery('')}
              variant="outline"
              size="icon"
              title="Clear Query"
              disabled={!activeTransaction || !transactionQuery}
            >
              <MaterialSymbol icon="backspace" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="transaction-log-section">
        <div className="flex items-center mb-2">
          <MaterialSymbol icon="receipt_long" className="text-primary mr-2" />
          <h3 className="text-lg font-semibold">Transaction Log</h3>
          
          <Button 
            onClick={clearOutput}
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7"
            title="Clear Log"
          >
            <MaterialSymbol icon="delete" size="20px" />
          </Button>
        </div>
        
        <div className="relative border border-border rounded-lg overflow-hidden shadow-sm">
          <pre className="w-full h-64 font-mono text-sm p-3 overflow-auto bg-muted/30 whitespace-pre-wrap">
            {output || 'No transaction activity logged yet.'}
          </pre>
        </div>
      </div>
      
      <div className="transaction-info-section border border-border rounded-lg shadow-sm bg-card p-4">
        <div className="flex items-center mb-3">
          <MaterialSymbol icon="info" className="text-primary mr-2" />
          <h3 className="text-lg font-semibold">Transaction Usage Guide</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-primary mb-2">What are Transactions?</h4>
            <p className="text-muted-foreground">
              Transactions allow you to group multiple SQL operations into a single unit that either 
              completes entirely or fails entirely, preserving data integrity.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Steps to Use Transactions</h4>
            <ol className="list-decimal ml-4 text-muted-foreground space-y-1">
              <li>Begin a new transaction</li>
              <li>Execute one or more SQL queries</li>
              <li>Commit the transaction to apply changes</li>
              <li>Or rollback to discard all changes</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Common Use Cases</h4>
            <ul className="list-disc ml-4 text-muted-foreground space-y-1">
              <li>Multiple related table updates</li>
              <li>Fund transfers between accounts</li>
              <li>Complex data operations that must succeed or fail together</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
