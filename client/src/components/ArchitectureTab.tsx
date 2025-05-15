import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import sampleArchiDiagram from "@assets/sample-archi-diagram.jpg";

interface ArchitectureTabProps {
  onStatusChange: (status: string) => void;
}

export default function ArchitectureTab({ onStatusChange }: ArchitectureTabProps) {
  const [activeView, setActiveView] = useState<string>('comprehensive');
  
  useEffect(() => {
    onStatusChange('Viewing system architecture');
  }, [onStatusChange]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="comprehensive" className="w-full" value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="comprehensive" className="font-bold text-primary">Complete System View</TabsTrigger>
          <TabsTrigger value="handdrawn">Hand-Drawn</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="data">Data Flow</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comprehensive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive HashBase DBMS Architecture</CardTitle>
              <CardDescription>
                Unified view of the entire system showing all components, relationships, data flow, and architectural layers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-auto">
                <svg width="1000" height="700" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-comprehensive" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f1f5f9" strokeWidth="0.5"/>
                    </pattern>
                    <marker id="arrowhead-comp" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/>
                    </marker>
                    <linearGradient id="client-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#e2e8f0" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                    <linearGradient id="server-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                    <linearGradient id="data-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                  </defs>
                  
                  {/* Background Grid */}
                  <rect x="0" y="0" width="1000" height="700" fill="url(#grid-comprehensive)" />
                  
                  {/* Title */}
                  <text x="500" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#0f172a">
                    HashBase DBMS - Complete System Overview
                  </text>
                  
                  {/* Main Layers */}
                  <rect x="100" y="60" width="800" height="160" fill="url(#client-gradient)" rx="10" stroke="#64748b" strokeWidth="2"/>
                  <text x="150" y="85" textAnchor="start" fontSize="18" fontWeight="bold" fill="#0f172a">Client Layer (React)</text>
                  
                  <rect x="100" y="240" width="800" height="180" fill="url(#server-gradient)" rx="10" stroke="#64748b" strokeWidth="2"/>
                  <text x="150" y="265" textAnchor="start" fontSize="18" fontWeight="bold" fill="#0f172a">Server Layer (Node.js)</text>
                  
                  <rect x="100" y="440" width="800" height="160" fill="url(#data-gradient)" rx="10" stroke="#64748b" strokeWidth="2"/>
                  <text x="150" y="465" textAnchor="start" fontSize="18" fontWeight="bold" fill="#f8fafc">Data Layer</text>
                  
                  {/* Client Layer Components */}
                  <rect x="150" y="100" width="110" height="50" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="205" y="130" textAnchor="middle" fontSize="14" fontWeight="bold">UI Components</text>
                  
                  <rect x="300" y="100" width="110" height="50" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="355" y="130" textAnchor="middle" fontSize="14" fontWeight="bold">Query Editor</text>
                  
                  <rect x="450" y="100" width="110" height="50" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="505" y="130" textAnchor="middle" fontSize="14" fontWeight="bold">Result Display</text>
                  
                  <rect x="600" y="100" width="110" height="50" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="655" y="120" textAnchor="middle" fontSize="14" fontWeight="bold">Transaction</text>
                  <text x="655" y="140" textAnchor="middle" fontSize="14" fontWeight="bold">Monitor</text>
                  
                  <rect x="750" y="100" width="110" height="50" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="805" y="130" textAnchor="middle" fontSize="14" fontWeight="bold">Authentication</text>
                  
                  <line x1="205" y1="150" x2="205" y2="180" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="355" y1="150" x2="355" y2="180" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="505" y1="150" x2="505" y2="180" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="655" y1="150" x2="655" y2="180" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="805" y1="150" x2="805" y2="180" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  
                  <rect x="150" y="180" width="710" height="20" rx="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="505" y="194" textAnchor="middle" fontSize="14" fontWeight="bold">REST API Interface</text>
                  
                  {/* Server Layer Components */}
                  <rect x="150" y="280" width="120" height="60" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="210" y="305" textAnchor="middle" fontSize="14" fontWeight="bold">API Routes</text>
                  <text x="210" y="325" textAnchor="middle" fontSize="12">Express.js</text>
                  
                  <rect x="310" y="280" width="120" height="60" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="370" y="305" textAnchor="middle" fontSize="14" fontWeight="bold">SQL Parser</text>
                  <text x="370" y="325" textAnchor="middle" fontSize="12">AST Generation</text>
                  
                  <rect x="470" y="280" width="120" height="60" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="530" y="305" textAnchor="middle" fontSize="14" fontWeight="bold">Query Executor</text>
                  <text x="530" y="325" textAnchor="middle" fontSize="12">Operations</text>
                  
                  <rect x="150" y="350" width="110" height="50" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="205" y="380" textAnchor="middle" fontSize="14" fontWeight="bold">Access Control</text>
                  
                  <rect x="270" y="350" width="110" height="50" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="325" y="370" textAnchor="middle" fontSize="14" fontWeight="bold">Transaction</text>
                  <text x="325" y="390" textAnchor="middle" fontSize="14" fontWeight="bold">Manager</text>
                  
                  <rect x="390" y="350" width="110" height="50" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="445" y="380" textAnchor="middle" fontSize="14" fontWeight="bold">Lock Manager</text>
                  
                  <rect x="510" y="350" width="110" height="50" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="565" y="380" textAnchor="middle" fontSize="14" fontWeight="bold">Execution Timer</text>
                  
                  <rect x="630" y="350" width="110" height="50" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2"/>
                  <text x="685" y="380" textAnchor="middle" fontSize="14" fontWeight="bold">Query Cache</text>
                  
                  <rect x="750" y="280" width="120" height="60" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="810" y="305" textAnchor="middle" fontSize="14" fontWeight="bold">Auth Service</text>
                  <text x="810" y="325" textAnchor="middle" fontSize="12">PostgreSQL</text>
                  
                  {/* Line from API Routes to other server components */}
                  <line x1="210" y1="340" x2="210" y2="350" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="270" y1="310" x2="310" y2="310" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="430" y1="310" x2="470" y2="310" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="530" y1="340" x2="530" y2="350" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="590" y1="310" x2="750" y2="310" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <path d="M 325 350 L 325 330 L 370 330" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="380" y1="375" x2="390" y2="375" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <path d="M 445 350 L 445 330 L 505 330" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="445" y1="400" x2="445" y2="440" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="565" y1="400" x2="565" y2="440" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="210" y1="400" x2="210" y2="440" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="325" y1="400" x2="325" y2="440" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="685" y1="400" x2="685" y2="440" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="810" y1="340" x2="810" y2="440" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  
                  {/* Data Layer Components */}
                  <rect x="150" y="480" width="130" height="60" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="215" y="510" textAnchor="middle" fontSize="14" fontWeight="bold">Hashbased Storage</text>
                  <text x="215" y="530" textAnchor="middle" fontSize="12">JSON Records</text>
                  
                  <rect x="310" y="480" width="130" height="60" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="375" y="510" textAnchor="middle" fontSize="14" fontWeight="bold">Index Manager</text>
                  <text x="375" y="530" textAnchor="middle" fontSize="12">Multi-column Indexing</text>
                  
                  <rect x="470" y="480" width="130" height="60" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="535" y="510" textAnchor="middle" fontSize="14" fontWeight="bold">Transaction Store</text>
                  <text x="535" y="530" textAnchor="middle" fontSize="12">Active Transactions</text>
                  
                  <rect x="630" y="480" width="130" height="60" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="695" y="510" textAnchor="middle" fontSize="14" fontWeight="bold">PostgreSQL</text>
                  <text x="695" y="530" textAnchor="middle" fontSize="12">User Authentication</text>
                  
                  <rect x="770" y="480" width="80" height="60" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="810" y="510" textAnchor="middle" fontSize="14" fontWeight="bold">File I/O</text>
                  <text x="810" y="530" textAnchor="middle" fontSize="12">Persistence</text>
                  
                  {/* Database Files */}
                  <rect x="190" y="570" width="60" height="30" rx="4" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="220" y="590" textAnchor="middle" fontSize="10">database.json</text>
                  
                  <rect x="370" y="570" width="60" height="30" rx="4" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="400" y="590" textAnchor="middle" fontSize="10">indexes.json</text>
                  
                  <rect x="550" y="570" width="60" height="30" rx="4" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="580" y="590" textAnchor="middle" fontSize="10">txn-log.json</text>
                  
                  <rect x="730" y="570" width="60" height="30" rx="4" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="760" y="590" textAnchor="middle" fontSize="10">users.pg</text>
                  
                  <line x1="220" y1="540" x2="220" y2="570" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="400" y1="540" x2="400" y2="570" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="580" y1="540" x2="580" y2="570" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead-comp)"/>
                  <line x1="760" y1="540" x2="760" y2="570" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrowhead-comp)"/>
                  
                  {/* Legend */}
                  <rect x="100" y="620" width="20" height="15" rx="3" fill="#f8fafc" stroke="#64748b" strokeWidth="1"/>
                  <text x="130" y="632" textAnchor="start" fontSize="12">Component</text>
                  
                  <rect x="220" y="620" width="20" height="15" rx="3" fill="#f8fafc" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2"/>
                  <text x="250" y="632" textAnchor="start" fontSize="12">Future Enhancement</text>
                  
                  <line x1="340" y1="628" x2="370" y2="628" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead-comp)"/>
                  <text x="415" y="632" textAnchor="start" fontSize="12">Data Flow</text>
                  
                  <rect x="470" y="620" width="20" height="15" rx="3" fill="url(#client-gradient)" stroke="#64748b" strokeWidth="1"/>
                  <text x="500" y="632" textAnchor="start" fontSize="12">Client Layer</text>
                  
                  <rect x="590" y="620" width="20" height="15" rx="3" fill="url(#server-gradient)" stroke="#64748b" strokeWidth="1"/>
                  <text x="620" y="632" textAnchor="start" fontSize="12">Server Layer</text>
                  
                  <rect x="710" y="620" width="20" height="15" rx="3" fill="url(#data-gradient)" stroke="#64748b" strokeWidth="1"/>
                  <text x="740" y="632" textAnchor="start" fontSize="12">Data Layer</text>
                </svg>
                
                <p className="text-sm text-muted-foreground mt-4 px-4">
                  This comprehensive diagram unifies all architectural views of HashBase DBMS into a single visualization. 
                  It shows the three primary layers (Client, Server, Data) and how they interconnect. 
                  All major components are represented including the SQL Parser, Query Executor, Transaction Manager,
                  Lock Manager for concurrency control, Access Control for authentication and authorization,
                  and the new Execution Timer that measures query performance. 
                  The diagram also illustrates both storage mechanisms: JSON-based hashmap storage for the core database
                  and PostgreSQL for user authentication.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="handdrawn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HashBase DBMS System Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="hand-drawn-diagram p-4 bg-muted/30 rounded-lg border-2 border-dashed border-border flex flex-col items-center">
                <svg width="100%" height="700" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg">
                  {/* Background paper effect */}
                  <rect x="0" y="0" width="1000" height="700" fill="#fdf6e3" stroke="#eee8d5" strokeWidth="3" rx="10" ry="10" />
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#eee8d5" strokeWidth="0.5" />
                  </pattern>
                  <rect x="0" y="0" width="1000" height="700" fill="url(#grid)" />
                  
                  {/* Title */}
                  <text x="500" y="40" textAnchor="middle" fontFamily="cursive" fontSize="24" fontWeight="bold" fill="#073642">HashBase DBMS Architecture</text>
                  
                  {/* Core Components */}
                  {/* Database Core */}
                  <ellipse cx="500" cy="300" rx="220" ry="150" fill="#fdf6e3" stroke="#268bd2" strokeWidth="3" strokeDasharray="5,3" />
                  <text x="500" y="200" textAnchor="middle" fontFamily="cursive" fontSize="18" fontWeight="bold" fill="#268bd2">Core DBMS Engine</text>
                  
                  {/* SQL Parser */}
                  <rect x="390" y="230" width="100" height="50" rx="10" ry="10" fill="#fdf6e3" stroke="#859900" strokeWidth="2" />
                  <text x="440" y="260" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">SQL Parser</text>
                  <path d="M 440 280 L 440 310 L 420 330" fill="none" stroke="#586e75" strokeWidth="2" strokeDasharray="2,2" />
                  <text x="420" y="340" textAnchor="end" fontFamily="cursive" fontSize="10" fill="#586e75">Parses SQL queries</text>
                  
                  {/* Query Optimizer */}
                  <rect x="510" y="230" width="100" height="50" rx="10" ry="10" fill="#fdf6e3" stroke="#859900" strokeWidth="2" />
                  <text x="560" y="260" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">Query Optimizer</text>
                  <path d="M 560 280 L 560 310 L 580 330" fill="none" stroke="#586e75" strokeWidth="2" strokeDasharray="2,2" />
                  <text x="580" y="340" textAnchor="start" fontFamily="cursive" fontSize="10" fill="#586e75">Optimizes execution plan</text>
                  
                  {/* Execution Time Tracker */}
                  <rect x="440" y="160" width="120" height="30" rx="8" ry="8" fill="#fdf6e3" stroke="#dc322f" strokeWidth="2" />
                  <text x="500" y="180" textAnchor="middle" fontFamily="cursive" fontSize="12" fill="#586e75">Execution Timer</text>
                  
                  {/* Composite Indexer */}
                  <rect x="330" y="320" width="90" height="50" rx="10" ry="10" fill="#fdf6e3" stroke="#cb4b16" strokeWidth="2" />
                  <text x="375" y="340" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">Composite</text>
                  <text x="375" y="358" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">Indexer</text>
                  <path d="M 375 370 L 375 400 L 355 420" fill="none" stroke="#586e75" strokeWidth="2" strokeDasharray="2,2" />
                  <text x="355" y="430" textAnchor="end" fontFamily="cursive" fontSize="10" fill="#586e75">Multi-column indexing</text>
                  
                  {/* Transaction Manager */}
                  <rect x="580" y="320" width="120" height="50" rx="10" ry="10" fill="#fdf6e3" stroke="#2aa198" strokeWidth="2" />
                  <text x="640" y="340" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">Transaction</text>
                  <text x="640" y="358" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">Manager</text>
                  <path d="M 640 370 L 640 400 L 670 420" fill="none" stroke="#586e75" strokeWidth="2" strokeDasharray="2,2" />
                  <text x="670" y="430" textAnchor="start" fontFamily="cursive" fontSize="10" fill="#586e75">ACID + Lock Mgmt</text>
                  
                  {/* Concurrency Manager */}
                  <rect x="500" y="360" width="100" height="40" rx="10" ry="10" fill="#fdf6e3" stroke="#2aa198" strokeWidth="2" />
                  <text x="550" y="385" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">Concurrency Mgr</text>
                  
                  {/* Storage Layer */}
                  <rect x="250" y="460" width="500" height="40" rx="10" ry="10" fill="#fdf6e3" stroke="#6c71c4" strokeWidth="2" />
                  <text x="500" y="485" textAnchor="middle" fontFamily="cursive" fontSize="16" fontWeight="bold" fill="#586e75">Storage Layer</text>
                  
                  {/* Data Storage */}
                  <rect x="280" y="520" width="80" height="80" fill="#fdf6e3" stroke="#b58900" strokeWidth="2" />
                  <rect x="290" y="530" width="80" height="80" fill="#fdf6e3" stroke="#b58900" strokeWidth="2" />
                  <rect x="300" y="540" width="80" height="80" fill="#fdf6e3" stroke="#b58900" strokeWidth="2" />
                  <text x="340" y="590" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">JSON Files</text>
                  
                  {/* PostgreSQL */}
                  <g transform="translate(450, 550)">
                    <path d="M 0,0 C 20,20 60,20 80,0 C 80,40 60,60 40,60 C 20,60 0,40 0,0 Z" fill="#fdf6e3" stroke="#268bd2" strokeWidth="2" />
                    <text x="40" y="35" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">PostgreSQL</text>
                  </g>
                  
                  {/* User Interface */}
                  <path d="M 650,550 Q 680,570 710,550 Q 710,590 680,610 Q 650,590 650,550 Z" fill="#fdf6e3" stroke="#cb4b16" strokeWidth="2" />
                  <text x="680" y="585" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">React UI</text>
                  
                  {/* Client */}
                  <circle cx="100" cy="300" r="60" fill="#fdf6e3" stroke="#dc322f" strokeWidth="2" />
                  <text x="100" y="305" textAnchor="middle" fontFamily="cursive" fontSize="16" fill="#586e75">Client</text>
                  
                  {/* API Server */}
                  <rect x="200" y="270" width="80" height="60" rx="10" ry="10" fill="#fdf6e3" stroke="#6c71c4" strokeWidth="2" />
                  <text x="240" y="305" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">API Server</text>
                  
                  {/* Access Control */}
                  <polygon points="150,380 200,380 225,420 175,460 125,420" fill="#fdf6e3" stroke="#dc322f" strokeWidth="2" />
                  <text x="175" y="410" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">Access</text>
                  <text x="175" y="430" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">Control</text>
                  <text x="175" y="450" textAnchor="middle" fontFamily="cursive" fontSize="10" fill="#586e75">Password Verification</text>
                  
                  {/* Connection Lines */}
                  <path d="M 160,300 L 200,300" fill="none" stroke="#586e75" strokeWidth="2" strokeDasharray="5,3" />
                  <text x="180" y="290" textAnchor="middle" fontFamily="cursive" fontSize="10" fill="#586e75">API Requests</text>
                  
                  <path d="M 280,300 L 320,300" fill="none" stroke="#586e75" strokeWidth="2" />
                  <text x="300" y="290" textAnchor="middle" fontFamily="cursive" fontSize="10" fill="#586e75">Query</text>
                  
                  <path d="M 240,330 L 240,380 L 225,380" fill="none" stroke="#586e75" strokeWidth="2" />
                  <text x="230" y="360" textAnchor="middle" fontFamily="cursive" fontSize="10" fill="#586e75">Auth</text>
                  
                  <path d="M 175,460 L 175,500 L 250,500" fill="none" stroke="#586e75" strokeWidth="2" />
                  <text x="200" y="480" textAnchor="middle" fontFamily="cursive" fontSize="10" fill="#586e75">Permissions</text>
                  
                  <path d="M 550,430 L 550,460" fill="none" stroke="#586e75" strokeWidth="2" />
                  <text x="560" y="445" textAnchor="start" fontFamily="cursive" fontSize="10" fill="#586e75">Logs</text>
                  
                  <path d="M 500,500 L 500,540" fill="none" stroke="#586e75" strokeWidth="2" />
                  <path d="M 340,520 L 340,500" fill="none" stroke="#586e75" strokeWidth="2" />
                  <path d="M 680,550 L 680,500" fill="none" stroke="#586e75" strokeWidth="2" />
                  
                  {/* Transaction Monitor */}
                  <rect x="700" y="320" width="100" height="60" rx="8" ry="8" fill="#fdf6e3" stroke="#2aa198" strokeWidth="2" />
                  <text x="750" y="345" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">Transaction</text>
                  <text x="750" y="365" textAnchor="middle" fontFamily="cursive" fontSize="14" fill="#586e75">Monitor</text>
                  <path d="M 700 350 L 640 350" fill="none" stroke="#586e75" strokeWidth="2" strokeDasharray="2,2" />
                  
                  {/* Arrows */}
                  <marker id="arrowhead" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto">
                    <polygon points="0 0, 5 2.5, 0 5" fill="#586e75" />
                  </marker>
                  
                  {/* Legend */}
                  <rect x="800" y="100" width="150" height="220" fill="#fdf6e3" stroke="#93a1a1" strokeWidth="2" rx="5" ry="5" />
                  <text x="875" y="120" textAnchor="middle" fontFamily="cursive" fontSize="14" fontWeight="bold" fill="#586e75">Legend</text>
                  
                  <rect x="820" y="140" width="15" height="15" fill="#fdf6e3" stroke="#268bd2" strokeWidth="2" />
                  <text x="845" y="152" textAnchor="start" fontFamily="cursive" fontSize="12" fill="#586e75">Core Components</text>
                  
                  <rect x="820" y="170" width="15" height="15" fill="#fdf6e3" stroke="#cb4b16" strokeWidth="2" />
                  <text x="845" y="182" textAnchor="start" fontFamily="cursive" fontSize="12" fill="#586e75">Indexer</text>
                  
                  <rect x="820" y="200" width="15" height="15" fill="#fdf6e3" stroke="#2aa198" strokeWidth="2" />
                  <text x="845" y="212" textAnchor="start" fontFamily="cursive" fontSize="12" fill="#586e75">Transactions</text>
                  
                  <rect x="820" y="230" width="15" height="15" fill="#fdf6e3" stroke="#dc322f" strokeWidth="2" />
                  <text x="845" y="242" textAnchor="start" fontFamily="cursive" fontSize="12" fill="#586e75">Client/Auth</text>
                  
                  <rect x="820" y="260" width="15" height="15" fill="#fdf6e3" stroke="#6c71c4" strokeWidth="2" />
                  <text x="845" y="272" textAnchor="start" fontFamily="cursive" fontSize="12" fill="#586e75">API/Storage</text>
                  
                  <rect x="820" y="290" width="15" height="15" fill="#fdf6e3" stroke="#dc322f" strokeWidth="2" strokeDasharray="4,2" />
                  <text x="845" y="302" textAnchor="start" fontFamily="cursive" fontSize="12" fill="#586e75">New Features</text>
                </svg>
                
                <div className="text-sm text-muted-foreground mt-6 space-y-3 max-w-3xl">
                  <p>
                    The hand-drawn diagram above illustrates the comprehensive architecture of our Hash-Based DBMS.
                    The system is built with multiple specialized components working in concert to provide efficient database operations.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Core DBMS Engine</span> - The central processing unit containing the primary database logic
                    </li>
                    <li>
                      <span className="font-medium">SQL Parser & Query Optimizer</span> - Converts SQL queries into efficient execution plans
                    </li>
                    <li>
                      <span className="font-medium">Hash Indexer</span> - Implements hash-based indexing for fast data retrieval
                    </li>
                    <li>
                      <span className="font-medium">Transaction Manager</span> - Ensures ACID compliance and transaction isolation
                    </li>
                    <li>
                      <span className="font-medium">WAL Manager</span> - Implements Write-Ahead Logging for durability and crash recovery
                    </li>
                    <li>
                      <span className="font-medium">Storage Layer</span> - Abstracts physical storage from the logical database structure
                    </li>
                    <li>
                      <span className="font-medium">Access Control</span> - Enforces authentication and authorization policies
                    </li>
                    <li>
                      <span className="font-medium">PostgreSQL Integration</span> - Stores user accounts and session data
                    </li>
                    <li>
                      <span className="font-medium">Finite State Machine</span> - Tracks and manages state transitions for database operations
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="system-diagram p-4 bg-muted/30 rounded-lg border-2 border-dashed border-border flex flex-col items-center">
                <svg width="100%" height="480" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
                  {/* Client Side */}
                  <rect x="50" y="50" width="700" height="400" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="2"/>
                  <text x="400" y="30" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="bold">HashBase DBMS Architecture</text>
                  
                  {/* Frontend Section */}
                  <rect x="100" y="100" width="250" height="300" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2"/>
                  <text x="225" y="130" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">React Client Interface</text>
                  
                  {/* UI Components */}
                  <rect x="125" y="150" width="95" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="172.5" y="175" textAnchor="middle" fill="#0f172a" fontSize="12">Query Editor</text>
                  
                  <rect x="230" y="150" width="95" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="277.5" y="175" textAnchor="middle" fill="#0f172a" fontSize="12">Transaction UI</text>
                  
                  {/* State Management */}
                  <rect x="125" y="200" width="200" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="225" y="225" textAnchor="middle" fill="#0f172a" fontSize="12">React Query State</text>
                  
                  {/* API Clients */}
                  <rect x="125" y="250" width="95" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="172.5" y="275" textAnchor="middle" fill="#0f172a" fontSize="12">Database API</text>
                  
                  <rect x="230" y="250" width="95" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="277.5" y="275" textAnchor="middle" fill="#0f172a" fontSize="12">Auth API</text>
                  
                  {/* New Features */}
                  <rect x="125" y="300" width="95" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2"/>
                  <text x="172.5" y="325" textAnchor="middle" fill="#0f172a" fontSize="12">Execution Timer</text>
                  
                  <rect x="230" y="300" width="95" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2"/>
                  <text x="277.5" y="325" textAnchor="middle" fill="#0f172a" fontSize="12">Lock Visualizer</text>
                  
                  {/* Backend Section */}
                  <rect x="450" y="100" width="250" height="300" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2"/>
                  <text x="575" y="130" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Node.js Backend</text>
                  
                  {/* API Routes */}
                  <rect x="475" y="150" width="200" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="575" y="175" textAnchor="middle" fill="#0f172a" fontSize="12">Express REST API</text>
                  
                  {/* Storage Interface */}
                  <rect x="475" y="200" width="200" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="575" y="225" textAnchor="middle" fill="#0f172a" fontSize="12">IStorage Interface</text>
                  
                  {/* Core DBMS Engine */}
                  <rect x="475" y="250" width="95" height="40" rx="4" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                  <text x="522.5" y="275" textAnchor="middle" fill="#0f172a" fontSize="12">SQL Engine</text>
                  
                  <rect x="580" y="250" width="95" height="40" rx="4" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                  <text x="627.5" y="275" textAnchor="middle" fill="#0f172a" fontSize="12">Transaction Mgr</text>
                  
                  {/* Storage */}
                  <rect x="475" y="300" width="95" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="522.5" y="325" textAnchor="middle" fill="#0f172a" fontSize="12">JSON Storage</text>
                  
                  {/* PostgreSQL */}
                  <rect x="580" y="300" width="95" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="627.5" y="325" textAnchor="middle" fill="#0f172a" fontSize="12">PostgreSQL</text>
                  
                  {/* New Backend Features */}
                  <rect x="475" y="350" width="95" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2"/>
                  <text x="522.5" y="375" textAnchor="middle" fill="#0f172a" fontSize="12">Performance Monitor</text>
                  
                  <rect x="580" y="350" width="95" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2"/>
                  <text x="627.5" y="375" textAnchor="middle" fill="#0f172a" fontSize="12">Access Control</text>
                  
                  {/* Connection Lines */}
                  <line x1="325" y1="170" x2="475" y2="170" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5"/>
                  <line x1="325" y1="270" x2="475" y2="270" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5"/>
                  <line x1="325" y1="320" x2="475" y2="370" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5"/>
                  <line x1="575" y1="190" x2="575" y2="200" stroke="#64748b" strokeWidth="2"/>
                  <line x1="575" y1="240" x2="522.5" y2="250" stroke="#64748b" strokeWidth="2"/>
                  <line x1="575" y1="240" x2="627.5" y2="250" stroke="#64748b" strokeWidth="2"/>
                  <line x1="522.5" y1="290" x2="522.5" y2="300" stroke="#64748b" strokeWidth="2"/>
                  <line x1="627.5" y1="290" x2="627.5" y2="300" stroke="#64748b" strokeWidth="2"/>
                  <line x1="522.5" y1="340" x2="522.5" y2="350" stroke="#64748b" strokeWidth="2"/>
                  <line x1="627.5" y1="340" x2="627.5" y2="350" stroke="#64748b" strokeWidth="2"/>
                  
                  {/* Arrows */}
                  <polygon points="470,170 475,170 475,165 485,170 475,175 475,170" fill="#64748b"/>
                  <polygon points="470,270 475,270 475,265 485,270 475,275 475,270" fill="#64748b"/>
                  <polygon points="470,370 475,370 475,365 485,370 475,375 475,370" fill="#64748b"/>
                  
                  {/* Legend */}
                  <rect x="65" y="410" width="30" height="15" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="105" y="422" textAnchor="start" fill="#0f172a" fontSize="10">Component</text>
                  
                  <rect x="165" y="410" width="30" height="15" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2"/>
                  <text x="205" y="422" textAnchor="start" fill="#0f172a" fontSize="10">New Feature</text>
                  
                  <line x1="265" y1="417" x2="285" y2="417" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5"/>
                  <text x="315" y="422" textAnchor="start" fill="#0f172a" fontSize="10">API Connection</text>
                </svg>
                <p className="text-sm text-muted-foreground mt-4">
                  This updated system architecture shows the React-based client interface communicating with the Node.js backend.
                  New features include execution time measurement, transaction lock visualization, performance monitoring, and enhanced
                  access control with password verification for sensitive operations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Component Relationship Diagram</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="components-diagram p-4 bg-muted/30 rounded-lg border-2 border-dashed border-border flex flex-col items-center">
                <svg width="100%" height="520" viewBox="0 0 800 540" xmlns="http://www.w3.org/2000/svg">
                  {/* Components diagram */}
                  <rect x="50" y="50" width="700" height="450" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="2"/>
                  <text x="400" y="30" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="bold">HashBase DBMS Component Relationships</text>
                  
                  {/* Main Components - Query Engine */}
                  <rect x="90" y="100" width="180" height="80" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
                  <text x="180" y="135" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Query Engine</text>
                  <text x="180" y="155" textAnchor="middle" fill="#0f172a" fontSize="12">SQL Parsing & Execution</text>
                  
                  {/* Transaction Manager */}
                  <rect x="510" y="100" width="180" height="80" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
                  <text x="600" y="135" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Transaction Manager</text>
                  <text x="600" y="155" textAnchor="middle" fill="#0f172a" fontSize="12">ACID Properties & Locks</text>
                  
                  {/* Storage */}
                  <rect x="300" y="200" width="180" height="80" rx="8" fill="#fee2e2" stroke="#ef4444" strokeWidth="2"/>
                  <text x="390" y="235" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Storage Manager</text>
                  <text x="390" y="255" textAnchor="middle" fill="#0f172a" fontSize="12">JSON + PostgreSQL</text>
                  
                  {/* Composite Indexer - Updated */}
                  <rect x="90" y="300" width="180" height="80" rx="8" fill="#d1fae5" stroke="#10b981" strokeWidth="2"/>
                  <text x="180" y="335" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Composite Indexer</text>
                  <text x="180" y="355" textAnchor="middle" fill="#0f172a" fontSize="12">Multi-column Hash Indexes</text>
                  
                  {/* Join Processor */}
                  <rect x="510" y="300" width="180" height="80" rx="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2"/>
                  <text x="600" y="335" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Join Processor</text>
                  <text x="600" y="355" textAnchor="middle" fill="#0f172a" fontSize="12">Table Join Operations</text>
                  
                  {/* Access Control - Enhanced */}
                  <rect x="180" y="440" width="180" height="50" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" strokeDasharray="4,2"/>
                  <text x="270" y="470" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">Enhanced Access Control</text>
                  
                  {/* Performance Monitor - New */}
                  <rect x="420" y="440" width="180" height="50" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" strokeDasharray="4,2"/>
                  <text x="510" y="470" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">Execution Timer</text>
                  
                  {/* Concurrency Manager - New */}
                  <rect x="420" y="100" width="70" height="40" rx="5" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" strokeDasharray="4,2"/>
                  <text x="455" y="125" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">Concurrency</text>
                  
                  {/* Transaction Monitor - New */}
                  <rect x="700" y="120" width="40" height="40" rx="4" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" strokeDasharray="4,2"/>
                  <text x="720" y="145" textAnchor="middle" fill="#0f172a" fontSize="10">Monitor</text>
                  
                  {/* Connection Lines */}
                  <line x1="180" y1="180" x2="300" y2="220" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="600" y1="180" x2="480" y2="220" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="180" y1="300" x2="300" y2="260" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="600" y1="300" x2="480" y2="260" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="390" y1="280" x2="270" y2="440" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="390" y1="280" x2="510" y2="440" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="270" y1="140" x2="420" y2="140" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="490" y1="120" x2="510" y2="120" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="690" y1="140" x2="700" y2="140" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="270" y1="340" x2="510" y2="340" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  
                  {/* Arrow Definitions */}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                    </marker>
                  </defs>
                  
                  {/* Legend */}
                  <rect x="100" y="380" width="15" height="15" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1"/>
                  <text x="125" y="392" textAnchor="start" fill="#0f172a" fontSize="10">Core Component</text>
                  
                  <rect x="200" y="380" width="15" height="15" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2"/>
                  <text x="225" y="392" textAnchor="start" fill="#0f172a" fontSize="10">New Feature</text>
                </svg>
                <p className="text-sm text-muted-foreground mt-4">
                  This component diagram shows the relationships between the core modules of the DBMS. 
                  Recent enhancements include the Composite Indexer for multi-column indexing, Execution Timer for 
                  performance monitoring, and Enhanced Access Control with password verification for sensitive operations.
                  The Transaction Manager now includes a monitoring interface to visualize locks in real-time.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Flow Diagram</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="data-flow-diagram p-4 bg-muted/30 rounded-lg border-2 border-dashed border-border flex flex-col items-center">
                <svg width="100%" height="520" viewBox="0 0 800 540" xmlns="http://www.w3.org/2000/svg">
                  {/* Data Flow diagram */}
                  <rect x="50" y="50" width="700" height="450" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="2"/>
                  <text x="400" y="30" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="bold">Data Flow in HashBase DBMS</text>
                  
                  {/* User */}
                  <circle cx="120" cy="150" r="50" fill="#f1f5f9" stroke="#64748b" strokeWidth="2"/>
                  <text x="120" y="155" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">User</text>
                  
                  {/* UI */}
                  <rect x="250" y="120" width="120" height="60" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2"/>
                  <text x="310" y="145" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">React UI</text>
                  <text x="310" y="165" textAnchor="middle" fill="#0f172a" fontSize="10">Query + Transaction Tabs</text>
                  
                  {/* API */}
                  <rect x="450" y="120" width="120" height="60" rx="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="2"/>
                  <text x="510" y="145" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Express API</text>
                  <text x="510" y="165" textAnchor="middle" fill="#0f172a" fontSize="10">REST Endpoints</text>
                  
                  {/* SQL Parser */}
                  <rect x="250" y="240" width="120" height="60" rx="8" fill="#94a3b8" stroke="#64748b" strokeWidth="2"/>
                  <text x="310" y="265" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">SQL Parser</text>
                  <text x="310" y="285" textAnchor="middle" fill="#0f172a" fontSize="10">Syntax Tree</text>
                  
                  {/* DBMS Engine */}
                  <rect x="450" y="240" width="120" height="60" rx="8" fill="#94a3b8" stroke="#64748b" strokeWidth="2"/>
                  <text x="510" y="265" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">DBMS Engine</text>
                  <text x="510" y="285" textAnchor="middle" fill="#0f172a" fontSize="10">Query Execution</text>
                  
                  {/* Transaction Manager */}
                  <rect x="350" y="340" width="120" height="60" rx="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="2"/>
                  <text x="410" y="365" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Transactions</text>
                  <text x="410" y="385" textAnchor="middle" fill="#0f172a" fontSize="10">ACID Properties</text>
                  
                  {/* Execution Timer - NEW */}
                  <rect x="250" y="340" width="80" height="60" rx="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" strokeDasharray="4,2"/>
                  <text x="290" y="365" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">Execution</text>
                  <text x="290" y="385" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">Timer</text>
                  
                  {/* Access Control - NEW */}
                  <rect x="490" y="340" width="80" height="60" rx="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" strokeDasharray="4,2"/>
                  <text x="530" y="365" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">Access</text>
                  <text x="530" y="385" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">Control</text>
                  
                  {/* Lock Monitor - NEW */}
                  <rect x="350" y="430" width="120" height="50" rx="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" strokeDasharray="4,2"/>
                  <text x="410" y="455" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Lock Monitor</text>
                  <text x="410" y="472" textAnchor="middle" fill="#0f172a" fontSize="8">Transaction Visualization</text>
                  
                  {/* Data Store */}
                  <path d="M 650,300 L 650,260 Q 650,250 640,250 L 600,250 Q 590,250 590,260 L 590,300 Q 590,310 600,310 L 640,310 Q 650,310 650,300 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="2"/>
                  <line x1="590" y1="260" x2="650" y2="260" stroke="#64748b" strokeWidth="1" />
                  <text x="620" y="275" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Storage</text>
                  <text x="620" y="295" textAnchor="middle" fill="#0f172a" fontSize="10">JSON + PostgreSQL</text>
                  
                  {/* Arrows */}
                  <defs>
                    <marker id="arrowhead-data" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                    </marker>
                  </defs>
                  
                  {/* Data flow connections */}
                  <line x1="170" y1="150" x2="250" y2="150" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="210" y="140" textAnchor="middle" fill="#64748b" fontSize="12">SQL Query</text>
                  
                  <line x1="370" y1="150" x2="450" y2="150" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="410" y="140" textAnchor="middle" fill="#64748b" fontSize="12">Request</text>
                  
                  <line x1="510" y1="180" x2="310" y2="240" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="410" y="220" textAnchor="middle" fill="#64748b" fontSize="12">Parse SQL</text>
                  
                  <line x1="370" y1="270" x2="450" y2="270" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="410" y="260" textAnchor="middle" fill="#64748b" fontSize="12">AST</text>
                  
                  <line x1="510" y1="300" x2="410" y2="350" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="470" y="335" textAnchor="middle" fill="#64748b" fontSize="12">Execute</text>
                  
                  <line x1="350" y1="270" x2="290" y2="340" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="310" y="310" textAnchor="middle" fill="#64748b" fontSize="10">Start Timer</text>
                  
                  <line x1="330" y1="370" x2="290" y2="370" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="310" y="355" textAnchor="middle" fill="#64748b" fontSize="10">Record Time</text>
                  
                  <line x1="470" y1="350" x2="600" y2="350" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="535" y="340" textAnchor="middle" fill="#64748b" fontSize="12">Read/Write</text>
                  
                  <line x1="470" y1="370" x2="490" y2="370" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="480" y="355" textAnchor="middle" fill="#64748b" fontSize="10">Verify</text>
                  
                  <line x1="410" y1="400" x2="410" y2="430" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="420" y="415" textAnchor="middle" fill="#64748b" fontSize="10">Visualize Locks</text>
                  
                  <line x1="390" y1="430" x2="310" y2="380" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="340" y="410" textAnchor="middle" fill="#64748b" fontSize="10">Transaction Time</text>
                  
                  <line x1="650" y1="300" x2="570" y2="240" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="620" y="280" textAnchor="middle" fill="#64748b" fontSize="12">Results</text>
                  
                  <line x1="450" y1="200" x2="300" y2="120" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="385" y="170" textAnchor="middle" fill="#64748b" fontSize="12">Response</text>
                  
                  <line x1="250" y1="150" x2="170" y2="150" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="210" y="160" textAnchor="middle" fill="#64748b" fontSize="12">Display</text>
                  
                  {/* Legend */}
                  <rect x="90" y="470" width="15" height="15" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="115" y="482" textAnchor="start" fill="#0f172a" fontSize="10">Core Component</text>
                  
                  <rect x="210" y="470" width="15" height="15" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" strokeDasharray="4,2"/>
                  <text x="235" y="482" textAnchor="start" fill="#0f172a" fontSize="10">New Feature</text>
                </svg>
                <p className="text-sm text-muted-foreground mt-4">
                  This updated data flow diagram illustrates how SQL queries are processed through the HashBase DBMS.
                  New features include the Execution Timer which measures and displays query performance in milliseconds,
                  the Lock Monitor for visualizing transaction locks, and enhanced Access Control with password verification
                  for sensitive operations like DELETE and UPDATE.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}