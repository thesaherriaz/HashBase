/**
 * Concurrency Manager for the DBMS
 * 
 * This class implements lock-based concurrency control for the database system.
 * It supports both read and write locks with deadlock prevention.
 */

export type LockType = 'read' | 'write';

export interface Lock {
  transactionId: string;
  type: LockType;
  timestamp: number;
}

export interface LockQueueItem {
  transactionId: string;
  type: LockType;
  timestamp: number;
  resolve: (value: boolean) => void;
  reject: (reason?: any) => void;
}

export class ConcurrencyManager {
  // Holds the current locks: lockKey -> array of locks
  private locks: Map<string, Lock[]>;
  
  // Holds the queue of lock requests: lockKey -> array of queued requests
  private lockQueue: Map<string, LockQueueItem[]>;
  
  // Tracks the resources locked by each transaction
  private transactionLocks: Map<string, string[]>;
  
  constructor() {
    this.locks = new Map();
    this.lockQueue = new Map();
    this.transactionLocks = new Map();
  }
  
  /**
   * Create a lock key for a table + record combination
   */
  private getLockKey(tableName: string, recordKey?: string): string {
    return recordKey ? `${tableName}:${recordKey}` : tableName;
  }
  
  /**
   * Check if a transaction can acquire a lock
   */
  private canAcquireLock(lockKey: string, transactionId: string, lockType: LockType): boolean {
    const currentLocks = this.locks.get(lockKey) || [];
    
    // If no locks, we can acquire
    if (currentLocks.length === 0) {
      return true;
    }
    
    // Check if this transaction already holds this lock
    const existingLock = currentLocks.find(lock => lock.transactionId === transactionId);
    if (existingLock) {
      // If requesting a write lock and already has read lock, need to upgrade
      if (existingLock.type === 'read' && lockType === 'write') {
        // Can upgrade if this is the only transaction holding a read lock
        return currentLocks.length === 1;
      }
      // Already has the lock
      return true;
    }
    
    // New lock request
    if (lockType === 'read') {
      // Can get a read lock if no transaction holds a write lock
      return !currentLocks.some(lock => lock.type === 'write');
    } else {
      // Can't get a write lock if any other transaction holds any lock
      return false;
    }
  }
  
  /**
   * Attempt to acquire a lock for a transaction
   */
  async acquireLock(
    transactionId: string, 
    tableName: string, 
    lockType: LockType, 
    recordKey?: string
  ): Promise<boolean> {
    // Create the lock key based on table and optional record
    const lockKey = this.getLockKey(tableName, recordKey);
    
    // Check if we can acquire the lock immediately
    if (this.canAcquireLock(lockKey, transactionId, lockType)) {
      this.grantLock(lockKey, transactionId, lockType);
      return true;
    }
    
    // Otherwise, queue the request
    return new Promise<boolean>((resolve, reject) => {
      const queueItem: LockQueueItem = {
        transactionId,
        type: lockType,
        timestamp: Date.now(),
        resolve,
        reject
      };
      
      // Get or create the queue for this lock
      const queue = this.lockQueue.get(lockKey) || [];
      queue.push(queueItem);
      this.lockQueue.set(lockKey, queue);
      
      // Set a timeout to prevent indefinite waiting (deadlock prevention)
      setTimeout(() => {
        // Remove from queue if still waiting
        const currentQueue = this.lockQueue.get(lockKey) || [];
        const index = currentQueue.findIndex(item => 
          item.transactionId === transactionId && 
          item.timestamp === queueItem.timestamp
        );
        
        if (index !== -1) {
          currentQueue.splice(index, 1);
          this.lockQueue.set(lockKey, currentQueue);
          reject(new Error(`Lock acquisition timeout for transaction ${transactionId} on ${lockKey}`));
        }
      }, 5000); // 5 second timeout
    });
  }
  
  /**
   * Grant a lock to a transaction
   */
  private grantLock(lockKey: string, transactionId: string, lockType: LockType): void {
    // Get or create the current locks for this key
    const currentLocks = this.locks.get(lockKey) || [];
    
    // Check if this transaction already holds this lock
    const existingLockIndex = currentLocks.findIndex(lock => lock.transactionId === transactionId);
    
    if (existingLockIndex !== -1) {
      // If upgrading from read to write, update the lock type
      if (currentLocks[existingLockIndex].type === 'read' && lockType === 'write') {
        currentLocks[existingLockIndex].type = 'write';
      }
      // Otherwise, lock already exists, do nothing
    } else {
      // Add the new lock
      currentLocks.push({
        transactionId,
        type: lockType,
        timestamp: Date.now()
      });
    }
    
    this.locks.set(lockKey, currentLocks);
    
    // Track that this transaction holds this lock
    const transactionLockList = this.transactionLocks.get(transactionId) || [];
    if (!transactionLockList.includes(lockKey)) {
      transactionLockList.push(lockKey);
      this.transactionLocks.set(transactionId, transactionLockList);
    }
  }
  
  /**
   * Release all locks held by a transaction
   */
  releaseLocks(transactionId: string): void {
    // Get all locks held by this transaction
    const lockKeys = this.transactionLocks.get(transactionId) || [];
    
    for (const lockKey of lockKeys) {
      const currentLocks = this.locks.get(lockKey) || [];
      
      // Remove locks held by this transaction
      const updatedLocks = currentLocks.filter(lock => lock.transactionId !== transactionId);
      
      if (updatedLocks.length > 0) {
        this.locks.set(lockKey, updatedLocks);
      } else {
        this.locks.delete(lockKey);
      }
      
      // Process any waiting lock requests
      this.processLockQueue(lockKey);
    }
    
    // Clear transaction's lock tracking
    this.transactionLocks.delete(transactionId);
  }
  
  /**
   * Process queued lock requests after locks have been released
   */
  private processLockQueue(lockKey: string): void {
    const queue = this.lockQueue.get(lockKey) || [];
    if (queue.length === 0) return;
    
    // Sort queue by timestamp (oldest first)
    queue.sort((a, b) => a.timestamp - b.timestamp);
    
    // Track which requests we'll process in this batch
    const toProcess: LockQueueItem[] = [];
    
    // First check for write lock requests
    const writeRequest = queue.find(item => item.type === 'write');
    if (writeRequest && this.canAcquireLock(lockKey, writeRequest.transactionId, 'write')) {
      toProcess.push(writeRequest);
    } else {
      // If no write locks can be granted, try to grant read locks
      for (const request of queue) {
        if (request.type === 'read' && this.canAcquireLock(lockKey, request.transactionId, 'read')) {
          toProcess.push(request);
        }
      }
    }
    
    // Grant locks and remove from queue
    for (const request of toProcess) {
      this.grantLock(lockKey, request.transactionId, request.type);
      request.resolve(true);
      
      const index = queue.findIndex(item => 
        item.transactionId === request.transactionId && 
        item.timestamp === request.timestamp
      );
      
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }
    
    // Update the queue
    if (queue.length > 0) {
      this.lockQueue.set(lockKey, queue);
    } else {
      this.lockQueue.delete(lockKey);
    }
  }
  
  /**
   * Check if a transaction holds a specific lock
   */
  hasLock(transactionId: string, tableName: string, lockType: LockType, recordKey?: string): boolean {
    const lockKey = this.getLockKey(tableName, recordKey);
    const currentLocks = this.locks.get(lockKey) || [];
    
    const lock = currentLocks.find(lock => lock.transactionId === transactionId);
    if (!lock) return false;
    
    // Read lock is sufficient for read operations, but write operations need write lock
    if (lockType === 'read') {
      return true; // Any lock type is sufficient for reading
    } else {
      return lock.type === 'write'; // Need write lock for writing
    }
  }
  
  /**
   * Get statistics about current locks
   */
  getLockStats(): {
    totalLocks: number;
    readLocks: number;
    writeLocks: number;
    queuedRequests: number;
  } {
    let readLocks = 0;
    let writeLocks = 0;
    let queuedRequests = 0;
    
    for (const locks of this.locks.values()) {
      for (const lock of locks) {
        if (lock.type === 'read') {
          readLocks++;
        } else {
          writeLocks++;
        }
      }
    }
    
    for (const queue of this.lockQueue.values()) {
      queuedRequests += queue.length;
    }
    
    return {
      totalLocks: readLocks + writeLocks,
      readLocks,
      writeLocks,
      queuedRequests
    };
  }
}