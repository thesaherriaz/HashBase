import { useState } from 'react';
import QueryTab from '@/components/QueryTab';
import TransactionTab from '@/components/TransactionTab';
import JoinTab from '@/components/JoinTab';
import IndexerTab from '@/components/IndexerTab';
import { MaterialSymbol } from '@/components/ui/material-symbol';

type Tab = 'query' | 'transaction' | 'join' | 'indexer';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('query');
  const [statusMessage, setStatusMessage] = useState<string>('Ready');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Advanced Database Management System</h1>
      
      {/* Tab navigation */}
      <div className="tab-nav flex border-b border-border mb-4">
        <button 
          className={`tab py-2 px-6 rounded-t-lg mr-1 ${activeTab === 'query' ? 'bg-primary text-white font-bold' : 'bg-tab-bg'}`}
          onClick={() => setActiveTab('query')}
        >
          <MaterialSymbol icon="code" className="align-middle mr-1" />
          SQL Queries
        </button>
        <button 
          className={`tab py-2 px-6 rounded-t-lg mr-1 ${activeTab === 'transaction' ? 'bg-primary text-white font-bold' : 'bg-tab-bg'}`}
          onClick={() => setActiveTab('transaction')}
        >
          <MaterialSymbol icon="sync" className="align-middle mr-1" />
          Transaction Management
        </button>
        <button 
          className={`tab py-2 px-6 rounded-t-lg mr-1 ${activeTab === 'join' ? 'bg-primary text-white font-bold' : 'bg-tab-bg'}`}
          onClick={() => setActiveTab('join')}
        >
          <MaterialSymbol icon="merge_type" className="align-middle mr-1" />
          Join Operations
        </button>
        <button 
          className={`tab py-2 px-6 rounded-t-lg ${activeTab === 'indexer' ? 'bg-primary text-white font-bold' : 'bg-tab-bg'}`}
          onClick={() => setActiveTab('indexer')}
        >
          <MaterialSymbol icon="sort" className="align-middle mr-1" />
          Indexer
        </button>
      </div>
      
      {/* Tab content */}
      <div className="tab-content-container bg-white rounded-lg shadow-lg p-4">
        {activeTab === 'query' && <QueryTab onStatusChange={setStatusMessage} />}
        {activeTab === 'transaction' && <TransactionTab onStatusChange={setStatusMessage} />}
        {activeTab === 'join' && <JoinTab onStatusChange={setStatusMessage} />}
        {activeTab === 'indexer' && <IndexerTab onStatusChange={setStatusMessage} />}
      </div>
      
      {/* Status bar */}
      <div className="mt-4 p-3 bg-light-bg border-t border-border text-sm font-medium">
        {statusMessage}
      </div>
    </div>
  );
}
