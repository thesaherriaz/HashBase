import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Database from '@/lib/database';

interface TransactionTabProps {
  onStatusChange: (status: string) => void;
}

export default function TransactionTab({ onStatusChange }: TransactionTabProps) {
  const [transactionId, setTransactionId] = useState('');
  const [transactionQuery, setTransactionQuery] = useState('');
  const [output, setOutput] = useState('');
  const [activeTransaction, setActiveTransaction] = useState<string | null>(null);
  
  // Begin a new transaction
  const beginTransaction = async () => {
    try {
      // Generate a transaction ID if not provided
      let txId = transactionId.trim();
      if (!txId) {
        txId = `transaction_${Date.now()}`;
        setTransactionId(txId);
      }
      
      onStatusChange(`Starting transaction ${txId}...`);
      const result = await Database.beginTransaction(txId);
      
      setOutput(result);
      setActiveTransaction(txId);
      onStatusChange(`Active transaction: ${txId}`);
    } catch (error) {
      console.error('Error beginning transaction:', error);
      setOutput(`Error: ${(error as Error).message}`);
      onStatusChange('Transaction start failed');
    }
  };
  
  // Commit the current transaction
  const commitTransaction = async () => {
    if (!activeTransaction) {
      setOutput('Error: No active transaction to commit!');
      return;
    }
    
    try {
      onStatusChange(`Committing transaction ${activeTransaction}...`);
      const result = await Database.commitTransaction(activeTransaction);
      
      setOutput(result);
      setActiveTransaction(null);
      onStatusChange('No active transaction');
    } catch (error) {
      console.error('Error committing transaction:', error);
      setOutput(`Error: ${(error as Error).message}`);
      onStatusChange('Transaction commit failed');
    }
  };
  
  // Rollback the current transaction
  const rollbackTransaction = async () => {
    if (!activeTransaction) {
      setOutput('Error: No active transaction to rollback!');
      return;
    }
    
    try {
      onStatusChange(`Rolling back transaction ${activeTransaction}...`);
      const result = await Database.rollbackTransaction(activeTransaction);
      
      setOutput(result);
      setActiveTransaction(null);
      onStatusChange('No active transaction');
    } catch (error) {
      console.error('Error rolling back transaction:', error);
      setOutput(`Error: ${(error as Error).message}`);
      onStatusChange('Transaction rollback failed');
    }
  };
  
  // Execute a query within the current transaction
  const executeInTransaction = async () => {
    if (!activeTransaction) {
      setOutput('Error: No active transaction!');
      return;
    }
    
    if (!transactionQuery.trim()) {
      setOutput('Error: Query cannot be empty.');
      return;
    }
    
    try {
      onStatusChange(`Executing query in transaction ${activeTransaction}...`);
      const result = await Database.executeInTransaction(activeTransaction, transactionQuery);
      
      setOutput((prev) => `${prev}\n> ${transactionQuery}\n${result}`);
      setTransactionQuery('');
      onStatusChange(`Query executed in transaction ${activeTransaction}`);
    } catch (error) {
      console.error('Error executing in transaction:', error);
      setOutput((prev) => `${prev}\nError: ${(error as Error).message}`);
      onStatusChange('Query execution failed');
    }
  };
  
  return (
    <div>
      <div className="transaction-controls flex flex-wrap gap-2 mb-4">
        <Input
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder="Transaction ID (optional)"
          className="flex-grow"
        />
        
        <Button onClick={beginTransaction}>Begin Transaction</Button>
        <Button onClick={commitTransaction}>Commit Transaction</Button>
        <Button onClick={rollbackTransaction}>Rollback Transaction</Button>
      </div>
      
      <div className="bg-light-bg p-3 rounded-lg mb-4 font-semibold">
        {activeTransaction 
          ? `Active transaction: ${activeTransaction}` 
          : 'No active transaction'}
      </div>
      
      <div className="transaction-query-container mb-4">
        <Input
          value={transactionQuery}
          onChange={(e) => setTransactionQuery(e.target.value)}
          placeholder="Enter query to execute within transaction..."
          className="w-full"
        />
      </div>
      
      <Button 
        onClick={executeInTransaction}
        className="mb-4"
      >
        Execute in Transaction
      </Button>
      
      <div className="transaction-output-container">
        <Textarea
          value={output}
          readOnly
          className="w-full h-64 bg-light-bg"
        />
      </div>
    </div>
  );
}
