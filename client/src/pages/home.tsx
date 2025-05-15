import { useState } from 'react';
import QueryTab from '@/components/QueryTab';
import TransactionTab from '@/components/TransactionTab';
import JoinTab from '@/components/JoinTab';
import IndexerTab from '@/components/IndexerTab';
import AuthStatus from '@/components/AuthStatus';
import { MaterialSymbol } from '@/components/ui/material-symbol';

type Tab = 'query' | 'transaction' | 'join' | 'indexer';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('query');
  const [statusMessage, setStatusMessage] = useState<string>('Ready');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - Fixed at the top */}
      <header className="bg-card shadow-md border-b border-border fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center">
            <MaterialSymbol icon="database" size="40px" fill className="text-primary mr-3" />
            <h1 className="text-2xl font-bold text-foreground">
              HashBase <span className="text-primary font-normal">DBMS</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <MaterialSymbol icon="memory_alt" className="mr-1" />
              <span className="hidden md:inline">In-Memory</span>
              <span className="mx-2">|</span>
              <MaterialSymbol icon="key" className="mr-1" />
              <span className="hidden md:inline">Hash-based</span>
              <span className="mx-2">|</span>
              <MaterialSymbol icon="bolt" className="mr-1" />
              <span>v1.0</span>
            </div>
            <AuthStatus />
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6 mt-24 mb-16">
        {/* Heading & Description */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2 text-foreground">Database Management Console</h2>
          <p className="text-muted-foreground">
            Execute queries, manage transactions, create joins, and optimize with indexes
          </p>
        </div>
        
        {/* Tab navigation */}
        <div className="tab-nav flex border-b border-border mb-6">
          <button 
            className={`tab py-3 px-6 rounded-t-lg mr-1 font-medium 
              ${activeTab === 'query' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-tab-bg hover:bg-primary/5'}`}
            onClick={() => setActiveTab('query')}
          >
            <MaterialSymbol icon="code" className="align-middle mr-2" />
            SQL Queries
          </button>
          <button 
            className={`tab py-3 px-6 rounded-t-lg mr-1 font-medium 
              ${activeTab === 'transaction' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-tab-bg hover:bg-primary/5'}`}
            onClick={() => setActiveTab('transaction')}
          >
            <MaterialSymbol icon="sync" className="align-middle mr-2" />
            Transaction Management
          </button>
          <button 
            className={`tab py-3 px-6 rounded-t-lg mr-1 font-medium 
              ${activeTab === 'join' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-tab-bg hover:bg-primary/5'}`}
            onClick={() => setActiveTab('join')}
          >
            <MaterialSymbol icon="merge_type" className="align-middle mr-2" />
            Join Operations
          </button>
          <button 
            className={`tab py-3 px-6 rounded-t-lg font-medium 
              ${activeTab === 'indexer' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-tab-bg hover:bg-primary/5'}`}
            onClick={() => setActiveTab('indexer')}
          >
            <MaterialSymbol icon="sort" className="align-middle mr-2" />
            Indexer
          </button>
        </div>
        
        {/* Tab content */}
        <div className="tab-content-container bg-card rounded-lg shadow-md p-6 border border-border">
          {activeTab === 'query' && <QueryTab onStatusChange={setStatusMessage} />}
          {activeTab === 'transaction' && <TransactionTab onStatusChange={setStatusMessage} />}
          {activeTab === 'join' && <JoinTab onStatusChange={setStatusMessage} />}
          {activeTab === 'indexer' && <IndexerTab onStatusChange={setStatusMessage} />}
        </div>
      </main>
      
      {/* Status bar - Fixed at the bottom */}
      <footer className="bg-card border-t border-border shadow-sm fixed bottom-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center text-sm">
            <MaterialSymbol icon="info" size="20px" className="text-primary mr-2" />
            <span className="font-medium">{statusMessage}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Hash-Based DBMS
          </div>
        </div>
      </footer>
    </div>
  );
}
