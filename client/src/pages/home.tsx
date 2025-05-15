import { useState } from 'react';
import QueryTab from '@/components/QueryTab';
import TransactionTab from '@/components/TransactionTab';
import JoinTab from '@/components/JoinTab';
import IndexerTab from '@/components/IndexerTab';
import AccountDropdown from '@/components/AccountDropdown';
import { MaterialSymbol } from '@/components/ui/material-symbol';

type Tab = 'query' | 'transaction' | 'join' | 'indexer';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('query');
  const [statusMessage, setStatusMessage] = useState<string>('Ready');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - Fixed at the top */}
      <header className="bg-card shadow-md border-b border-border fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <MaterialSymbol icon="database" size="40px" fill className="text-primary mr-2" />
            <h1 className="text-xl font-bold text-foreground">
              HashBase <span className="text-primary font-normal">DBMS</span>
            </h1>
          </div>
          
          {/* Right side navigation and account */}
          <div className="flex items-center space-x-4">
            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <button 
                className={`nav-item text-sm font-medium pb-1 
                  ${activeTab === 'query' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('query')}
              >
                SQL Queries
              </button>
              <button 
                className={`nav-item text-sm font-medium pb-1 
                  ${activeTab === 'transaction' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('transaction')}
              >
                Transaction Manager
              </button>
              <button 
                className={`nav-item text-sm font-medium pb-1 
                  ${activeTab === 'join' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('join')}
              >
                Join Operations
              </button>
              <button 
                className={`nav-item text-sm font-medium pb-1 
                  ${activeTab === 'indexer' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('indexer')}
              >
                Indexer
              </button>
            </nav>
            
            {/* Auth */}
            <AccountDropdown setActiveTab={(tab: any) => setActiveTab(tab)} />
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
        
        {/* Mobile tab navigation for smaller screens */}
        <div className="md:hidden tab-nav flex border-b border-border mb-6 overflow-x-auto">
          <button 
            className={`tab py-2 px-4 rounded-t-lg mr-1 font-medium text-sm
              ${activeTab === 'query' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-tab-bg hover:bg-primary/5'}`}
            onClick={() => setActiveTab('query')}
          >
            SQL
          </button>
          <button 
            className={`tab py-2 px-4 rounded-t-lg mr-1 font-medium text-sm
              ${activeTab === 'transaction' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-tab-bg hover:bg-primary/5'}`}
            onClick={() => setActiveTab('transaction')}
          >
            Trans.
          </button>
          <button 
            className={`tab py-2 px-4 rounded-t-lg mr-1 font-medium text-sm
              ${activeTab === 'join' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-tab-bg hover:bg-primary/5'}`}
            onClick={() => setActiveTab('join')}
          >
            Join
          </button>
          <button 
            className={`tab py-2 px-4 rounded-t-lg font-medium text-sm
              ${activeTab === 'indexer' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-tab-bg hover:bg-primary/5'}`}
            onClick={() => setActiveTab('indexer')}
          >
            Index
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