import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ArchitectureTabProps {
  onStatusChange: (status: string) => void;
}

export default function ArchitectureTab({ onStatusChange }: ArchitectureTabProps) {
  const [activeView, setActiveView] = useState<string>('system');
  
  useEffect(() => {
    onStatusChange('Viewing system architecture');
  }, [onStatusChange]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="system" className="w-full" value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="system">System Architecture</TabsTrigger>
          <TabsTrigger value="components">Component Diagram</TabsTrigger>
          <TabsTrigger value="data">Data Flow</TabsTrigger>
        </TabsList>
        
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
                  <text x="400" y="30" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="bold">Hash-based DBMS Architecture</text>
                  
                  {/* Frontend Section */}
                  <rect x="100" y="100" width="250" height="300" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2"/>
                  <text x="225" y="130" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Client Interface</text>
                  
                  {/* UI Components */}
                  <rect x="125" y="150" width="200" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="225" y="175" textAnchor="middle" fill="#0f172a" fontSize="12">UI Components</text>
                  
                  {/* State Management */}
                  <rect x="125" y="200" width="200" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="225" y="225" textAnchor="middle" fill="#0f172a" fontSize="12">State Management</text>
                  
                  {/* API Clients */}
                  <rect x="125" y="250" width="200" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="225" y="275" textAnchor="middle" fill="#0f172a" fontSize="12">API Clients</text>
                  
                  {/* Validation */}
                  <rect x="125" y="300" width="200" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="225" y="325" textAnchor="middle" fill="#0f172a" fontSize="12">Form Validation</text>
                  
                  {/* Backend Section */}
                  <rect x="450" y="100" width="250" height="300" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2"/>
                  <text x="575" y="130" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Server Backend</text>
                  
                  {/* API Routes */}
                  <rect x="475" y="150" width="200" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="575" y="175" textAnchor="middle" fill="#0f172a" fontSize="12">API Routes</text>
                  
                  {/* Storage Interface */}
                  <rect x="475" y="200" width="200" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="575" y="225" textAnchor="middle" fill="#0f172a" fontSize="12">Storage Interface</text>
                  
                  {/* Core DBMS Engine */}
                  <rect x="475" y="250" width="200" height="40" rx="4" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                  <text x="575" y="275" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">Hash-based DBMS Engine</text>
                  
                  {/* Storage */}
                  <rect x="475" y="300" width="95" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="522.5" y="325" textAnchor="middle" fill="#0f172a" fontSize="12">JSON Files</text>
                  
                  {/* PostgreSQL */}
                  <rect x="580" y="300" width="95" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1"/>
                  <text x="627.5" y="325" textAnchor="middle" fill="#0f172a" fontSize="12">PostgreSQL</text>
                  
                  {/* Connection Lines */}
                  <line x1="325" y1="170" x2="475" y2="170" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5"/>
                  <line x1="325" y1="270" x2="475" y2="270" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5"/>
                  <line x1="575" y1="190" x2="575" y2="200" stroke="#64748b" strokeWidth="2"/>
                  <line x1="575" y1="240" x2="575" y2="250" stroke="#64748b" strokeWidth="2"/>
                  <line x1="575" y1="290" x2="575" y2="300" stroke="#64748b" strokeWidth="2"/>
                  
                  {/* Arrows */}
                  <polygon points="470,170 475,170 475,165 485,170 475,175 475,170" fill="#64748b"/>
                  <polygon points="470,270 475,270 475,265 485,270 475,275 475,270" fill="#64748b"/>
                </svg>
                <p className="text-sm text-muted-foreground mt-4">
                  The system architecture shows the client-side interface communicating with the server-side hash-based DBMS engine.
                  Data persistence is handled through both JSON files for the database content and PostgreSQL for user management.
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
                <svg width="100%" height="480" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
                  {/* Components diagram */}
                  <rect x="50" y="50" width="700" height="400" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="2"/>
                  <text x="400" y="30" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="bold">Component Relationships</text>
                  
                  {/* Main Components - Query Engine */}
                  <rect x="100" y="100" width="180" height="80" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
                  <text x="190" y="145" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Query Engine</text>
                  
                  {/* Transaction Manager */}
                  <rect x="500" y="100" width="180" height="80" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
                  <text x="590" y="145" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Transaction Manager</text>
                  
                  {/* Indexer */}
                  <rect x="100" y="300" width="180" height="80" rx="8" fill="#d1fae5" stroke="#10b981" strokeWidth="2"/>
                  <text x="190" y="345" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Indexer</text>
                  
                  {/* Join Processor */}
                  <rect x="500" y="300" width="180" height="80" rx="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2"/>
                  <text x="590" y="345" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Join Processor</text>
                  
                  {/* Storage */}
                  <rect x="300" y="200" width="180" height="80" rx="8" fill="#fee2e2" stroke="#ef4444" strokeWidth="2"/>
                  <text x="390" y="245" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Storage Manager</text>
                  
                  {/* Access Control */}
                  <rect x="300" y="380" width="180" height="50" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2"/>
                  <text x="390" y="410" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">Access Control</text>
                  
                  {/* Connection Lines */}
                  <line x1="190" y1="180" x2="300" y2="220" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="590" y1="180" x2="480" y2="220" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="190" y1="300" x2="300" y2="260" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="590" y1="300" x2="480" y2="260" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="390" y1="280" x2="390" y2="380" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="280" y1="140" x2="500" y2="140" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <line x1="280" y1="340" x2="500" y2="340" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  
                  {/* Arrow Definitions */}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                    </marker>
                  </defs>
                </svg>
                <p className="text-sm text-muted-foreground mt-4">
                  The component diagram illustrates how different modules of the DBMS interact. 
                  The Storage Manager serves as the central component connecting the Query Engine, 
                  Transaction Manager, Indexer, and Join Processor.
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
                <svg width="100%" height="480" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
                  {/* Data Flow diagram */}
                  <rect x="50" y="50" width="700" height="400" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="2"/>
                  <text x="400" y="30" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="bold">Data Flow in Hash-based DBMS</text>
                  
                  {/* User */}
                  <circle cx="120" cy="150" r="50" fill="#f1f5f9" stroke="#64748b" strokeWidth="2"/>
                  <text x="120" y="155" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">User</text>
                  
                  {/* UI */}
                  <rect x="250" y="120" width="120" height="60" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2"/>
                  <text x="310" y="155" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">UI</text>
                  
                  {/* API */}
                  <rect x="450" y="120" width="120" height="60" rx="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="2"/>
                  <text x="510" y="155" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">API</text>
                  
                  {/* SQL Parser */}
                  <rect x="250" y="240" width="120" height="60" rx="8" fill="#94a3b8" stroke="#64748b" strokeWidth="2"/>
                  <text x="310" y="275" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">SQL Parser</text>
                  
                  {/* Query Executor */}
                  <rect x="450" y="240" width="120" height="60" rx="8" fill="#64748b" stroke="#475569" strokeWidth="2"/>
                  <text x="510" y="275" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="bold">Executor</text>
                  
                  {/* Storage Manager */}
                  <rect x="350" y="350" width="120" height="60" rx="8" fill="#475569" stroke="#1e293b" strokeWidth="2"/>
                  <text x="410" y="385" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="bold">Storage</text>
                  
                  {/* Data Store */}
                  <circle cx="650" cy="350" r="50" fill="#e2e8f0" stroke="#64748b" strokeWidth="2"/>
                  <text x="650" y="355" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">Data</text>
                  
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
                  
                  <line x1="470" y1="350" x2="600" y2="350" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="535" y="340" textAnchor="middle" fill="#64748b" fontSize="12">Read/Write</text>
                  
                  <line x1="650" y1="300" x2="570" y2="240" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="620" y="280" textAnchor="middle" fill="#64748b" fontSize="12">Results</text>
                  
                  <line x1="450" y1="200" x2="300" y2="120" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="385" y="170" textAnchor="middle" fill="#64748b" fontSize="12">Response</text>
                  
                  <line x1="250" y1="150" x2="170" y2="150" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead-data)"/>
                  <text x="210" y="170" textAnchor="middle" fill="#64748b" fontSize="12">Results</text>
                </svg>
                <p className="text-sm text-muted-foreground mt-4">
                  The data flow diagram illustrates how user queries are processed through the system. 
                  Queries from the UI are sent to the API, parsed into an abstract syntax tree, 
                  executed by the query engine, and interact with storage before returning results to the user.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}