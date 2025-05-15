import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MaterialSymbol } from '@/components/ui/material-symbol';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Database from '@/lib/database';

interface TransactionTabProps {
  onStatusChange: (status: string) => void;
}

interface TransactionLockInfo {
  transactionId: string;
  status: string;
  locks: string[];
}

export default function TransactionTab({ onStatusChange }: TransactionTabProps) {
  const [transactionId, setTransactionId] = useState('');
  const [transactionQuery, setTransactionQuery] = useState('');
  const [output, setOutput] = useState('');
  const [activeTransaction, setActiveTransaction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionInfo, setTransactionInfo] = useState<TransactionLockInfo[]>([]);
  const [showTransactionInfo, setShowTransactionInfo] = useState(false);
  
  // Fetch transaction information periodically when showing transaction info
  useEffect(() => {
    if (!showTransactionInfo) return;
    
    // Fetch immediately
    fetchTransactionInfo();
    
    // Set up interval to fetch every 5 seconds
    const interval = setInterval(fetchTransactionInfo, 5000);
    
    // Clean up interval
    return () => clearInterval(interval);
  }, [showTransactionInfo]);
  
  // Function to fetch transaction information
  const fetchTransactionInfo = async () => {
    try {
      const data = await Database.getTransactionInfo();
      setTransactionInfo(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transaction info:', error);
    }
  };
  
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
      const response = await Database.beginTransaction(txId);
      const result = typeof response === 'string' ? response : response.message;
      const executionTime = typeof response === 'object' && response.executionTime ? response.executionTime : '';
      
      setOutput(`${new Date().toLocaleTimeString()} - Transaction started: ${txId}\n${result}${executionTime ? `\nExecution time: ${executionTime}` : ''}`);
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
      const response = await Database.commitTransaction(activeTransaction);
      const result = typeof response === 'string' ? response : response.message;
      const executionTime = typeof response === 'object' && response.executionTime ? response.executionTime : '';
      
      setOutput(prev => `${prev}\n${new Date().toLocaleTimeString()} - Transaction committed: ${activeTransaction}\n${result}${executionTime ? `\nExecution time: ${executionTime}` : ''}`);
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
      const response = await Database.rollbackTransaction(activeTransaction);
      const result = typeof response === 'string' ? response : response.message;
      const executionTime = typeof response === 'object' && response.executionTime ? response.executionTime : '';
      
      setOutput(prev => `${prev}\n${new Date().toLocaleTimeString()} - Transaction rolled back: ${activeTransaction}\n${result}${executionTime ? `\nExecution time: ${executionTime}` : ''}`);
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
      const response = await Database.executeInTransaction(activeTransaction, transactionQuery);
      const result = typeof response === 'string' ? response : response.message;
      const executionTime = typeof response === 'object' && response.executionTime ? response.executionTime : '';
      
      setOutput(prev => `${prev}\n${new Date().toLocaleTimeString()} - Query executed: ${transactionQuery}\n${result}${executionTime ? `\nExecution time: ${executionTime}` : ''}`);
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
      
      <div className="transaction-monitor-section mb-6">
        <div className="flex items-center mb-2">
          <MaterialSymbol icon="monitoring" className="text-primary mr-2" />
          <h3 className="text-lg font-semibold">Transaction Monitor</h3>
          
          <Button 
            onClick={() => {
              setShowTransactionInfo(!showTransactionInfo);
              if (!showTransactionInfo) {
                fetchTransactionInfo();
              }
            }}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            {showTransactionInfo ? (
              <>
                <MaterialSymbol icon="visibility_off" className="mr-2" size="20px" />
                Hide Active Transactions
              </>
            ) : (
              <>
                <MaterialSymbol icon="visibility" className="mr-2" size="20px" />
                Show Active Transactions
              </>
            )}
          </Button>
        </div>
        
        {showTransactionInfo && (
          <div className="bg-card border border-border rounded-lg shadow-sm p-4">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium">Active Transactions & Locks</h4>
                <Button 
                  onClick={fetchTransactionInfo}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Refresh"
                >
                  <MaterialSymbol icon="refresh" size="20px" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                View transactions currently running in the system and the locks they hold
              </p>
            </div>
            
            {transactionInfo.length === 0 ? (
              <Alert>
                <MaterialSymbol icon="info" className="h-4 w-4" />
                <AlertTitle>No active transactions</AlertTitle>
                <AlertDescription>
                  There are currently no active transactions in the system. Start a new transaction to see it listed here.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {transactionInfo.map((tx) => (
                  <div key={tx.transactionId} className="border border-border rounded-lg overflow-hidden">
                    <div className={`p-3 flex items-center justify-between ${
                      tx.status === 'active' ? 'bg-green-50 dark:bg-green-950' : 
                      tx.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-950' : 'bg-red-50 dark:bg-red-950'
                    }`}>
                      <div>
                        <span className="font-mono text-sm font-medium">{tx.transactionId}</span>
                        <div className="flex items-center text-xs">
                          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                            tx.status === 'active' ? 'bg-green-500' : 
                            tx.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                          <span className="capitalize">{tx.status}</span>
                        </div>
                      </div>
                      <div className="bg-card px-2 py-1 rounded-md text-xs">
                        {tx.locks.length} lock{tx.locks.length !== 1 ? 's' : ''} held
                      </div>
                    </div>
                    
                    {tx.locks.length > 0 && (
                      <div className="p-3 bg-muted/20">
                        <h5 className="text-xs font-medium mb-2">Locks:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {tx.locks.map((lock, idx) => (
                            <div key={idx} className="bg-card px-2 py-1 rounded text-xs font-mono flex items-center">
                              <MaterialSymbol 
                                icon={lock.includes('write') ? "lock" : "lock_open"} 
                                className={lock.includes('write') ? "text-red-500 mr-1" : "text-green-500 mr-1"} 
                                size="20px" 
                              />
                              {lock}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
        
        <div className="mt-4 border-t border-border pt-4">
          <h3 className="font-medium text-lg mb-3">Transaction Locking & Multi-user Access</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-primary mb-2">How Locks Work</h4>
              <div className="bg-muted/30 p-3 rounded border border-border">
                <p className="mb-2">Our DBMS uses automatic locking to prevent multiple users from interfering with each other:</p>
                <ul className="list-disc ml-4 text-muted-foreground space-y-1">
                  <li><strong className="text-primary">Read Locks</strong>: Allow other transactions to read but not modify the same data</li>
                  <li><strong className="text-primary">Write Locks</strong>: Prevent other transactions from both reading and modifying the same data</li>
                  <li>Locks are automatically acquired when you execute commands in a transaction</li>
                  <li>Locks are released when your transaction is committed or rolled back</li>
                </ul>
              </div>

              <h4 className="font-medium text-primary mt-4 mb-2">Transaction Isolation Levels</h4>
              <div className="bg-muted/30 p-3 rounded border border-border">
                <p className="mb-2">Our DBMS supports different transaction isolation levels:</p>
                <ul className="list-disc ml-4 text-muted-foreground space-y-1">
                  <li><strong className="text-primary">Read Committed</strong> (default): Each query sees only committed data</li>
                  <li><strong className="text-primary">Read Uncommitted</strong>: Can see uncommitted changes from other transactions</li>
                  <li><strong className="text-primary">Serializable</strong>: Strongest isolation, transactions executed as if serialized</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-primary mb-2">Multi-user Scenario Example</h4>
              <div className="bg-muted/30 p-3 rounded border border-border mb-4">
                <p className="mb-2 text-foreground"><strong>Scenario: Two users updating grades simultaneously</strong></p>
                
                <div className="grid grid-cols-2 gap-3 border-t border-border pt-2">
                  <div>
                    <strong className="text-primary">User 1 (Alice)</strong>
                    <div className="font-mono text-xs mt-1 space-y-1">
                      <div>BEGIN TX alice_tx;</div>
                      <div>UPDATE students SET grade = 'A' WHERE id = 1;</div>
                      <div className="text-muted-foreground">/* Locks student record id=1 */</div>
                      <div>/* Working on other things... */</div>
                    </div>
                  </div>
                  
                  <div>
                    <strong className="text-primary">User 2 (Bob)</strong>
                    <div className="font-mono text-xs mt-1 space-y-1">
                      <div>BEGIN TX bob_tx;</div>
                      <div>SELECT * FROM students WHERE id = 1;</div>
                      <div className="text-muted-foreground">/* Shows original grade */</div>
                      <div>UPDATE students SET grade = 'B' WHERE id = 1;</div>
                      <div className="text-muted-foreground">/* Waits for Alice's lock */</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 border-t border-border mt-2 pt-2">
                  <div>
                    <div className="font-mono text-xs space-y-1">
                      <div>COMMIT TX alice_tx;</div>
                      <div className="text-muted-foreground">/* Releases locks */</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-mono text-xs space-y-1">
                      <div className="text-muted-foreground">/* Bob's update now proceeds */</div>
                      <div>COMMIT TX bob_tx;</div>
                      <div className="text-muted-foreground">/* Student's grade is now 'B' */</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h4 className="font-medium text-primary mb-2">Active Transactions & Locks</h4>
              <div className="bg-muted/30 p-3 rounded border border-border">
                <p className="mb-2">Our system provides visibility into active transactions:</p>
                <ul className="list-disc ml-4 text-muted-foreground space-y-1">
                  <li>View all active transactions and their held locks</li>
                  <li>System provides automatic deadlock detection and prevention</li>
                  <li>Transactions can timeout if left open too long</li>
                  <li>You should always commit or rollback your transactions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
