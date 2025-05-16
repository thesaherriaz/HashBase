import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="comprehensive" className="font-bold text-primary">Architecture Diagram</TabsTrigger>
          <TabsTrigger value="docs" className="font-bold text-primary">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comprehensive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HashBase DBMS: 3-Tier Architecture</CardTitle>
              <CardDescription>
                Complete hand-drawn style architectural diagram showing all components, relationships, and data flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-auto bg-slate-50 p-4 rounded-lg border border-slate-200">
                <svg width="1000" height="800" viewBox="0 0 1000 800" xmlns="http://www.w3.org/2000/svg">
                  {/* Paper texture filter */}
                  <defs>
                    <filter id="paper-texture">
                      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
                      <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="2" result="diffLight">
                        <feDistantLight azimuth="45" elevation="60"/>
                      </feDiffuseLighting>
                      <feComposite in="SourceGraphic" in2="diffLight" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
                    </filter>
                    
                    <filter id="pencil">
                      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise"/>
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G"/>
                    </filter>
                    
                    <marker id="arrow" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                      <path d="M 0 0 L 10 3.5 L 0 7 Z" fill="#333" filter="url(#pencil)"/>
                    </marker>
                  </defs>
                  
                  {/* Background paper */}
                  <rect width="1000" height="800" fill="#f8f9fa" filter="url(#paper-texture)"/>
                  
                  {/* Title */}
                  <text x="500" y="40" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    HashBase DBMS Architecture
                  </text>
                  
                  {/* Client Layer - Orange/Yellow */}
                  <path d="M 100,80 Q 130,75 160,82 Q 190,89 220,80 Q 250,71 280,78 Q 310,85 340,80 Q 370,75 400,82 
                         Q 430,89 460,80 Q 490,71 520,78 Q 550,85 580,80 Q 610,75 640,82 Q 670,89 700,80 Q 730,71 760,78 
                         Q 790,85 820,80 Q 850,75 880,82 L 900,82 L 900,200 L 100,200 Z" 
                      fill="#ffeca9" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                
                  <text x="180" y="110" textAnchor="start" fontSize="24" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Client Layer
                  </text>
                  
                  {/* Server Layer - Blue */}
                  <path d="M 100,220 Q 130,215 160,222 Q 190,229 220,220 Q 250,211 280,218 Q 310,225 340,220 Q 370,215 400,222 
                         Q 430,229 460,220 Q 490,211 520,218 Q 550,225 580,220 Q 610,215 640,222 Q 670,229 700,220 Q 730,211 760,218 
                         Q 790,225 820,220 Q 850,215 880,222 L 900,222 L 900,400 L 100,400 Z" 
                      fill="#a5d8ff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                
                  <text x="180" y="250" textAnchor="start" fontSize="24" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Server Layer
                  </text>
                  
                  {/* Data Layer - Green */}
                  <path d="M 100,420 Q 130,415 160,422 Q 190,429 220,420 Q 250,411 280,418 Q 310,425 340,420 Q 370,415 400,422 
                         Q 430,429 460,420 Q 490,411 520,418 Q 550,425 580,420 Q 610,415 640,422 Q 670,429 700,420 Q 730,411 760,418 
                         Q 790,425 820,420 Q 850,415 880,422 L 900,422 L 900,600 L 100,600 Z" 
                      fill="#b2f2bb" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                
                  <text x="180" y="450" textAnchor="start" fontSize="24" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Data Layer
                  </text>
                  
                  {/* Client Layer Components */}
                  <rect x="150" y="130" width="120" height="50" rx="10" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="210" y="160" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    UI Components
                  </text>
                  
                  <rect x="350" y="130" width="120" height="50" rx="10" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="410" y="160" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Query Editor
                  </text>
                  
                  <rect x="550" y="130" width="120" height="50" rx="10" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="610" y="160" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Transaction Monitor
                  </text>
                  
                  <rect x="750" y="130" width="120" height="50" rx="10" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="810" y="160" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Authentication
                  </text>
                  
                  {/* Server Layer Components */}
                  <rect x="125" y="270" width="120" height="50" rx="10" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="185" y="300" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    API Routes
                  </text>
                  
                  <rect x="275" y="270" width="120" height="50" rx="10" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="335" y="290" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    SQL Parser &
                  </text>
                  <text x="335" y="310" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Optimizer
                  </text>
                  
                  <rect x="425" y="270" width="120" height="50" rx="10" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="485" y="300" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Query Executor
                  </text>
                  
                  <rect x="575" y="270" width="120" height="50" rx="10" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="635" y="300" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Transaction Manager
                  </text>
                  
                  <rect x="725" y="270" width="120" height="50" rx="10" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="785" y="300" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Auth Service
                  </text>
                  
                  <rect x="175" y="340" width="120" height="40" rx="8" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="235" y="365" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Access Control
                  </text>
                  
                  <rect x="375" y="340" width="120" height="40" rx="8" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="435" y="365" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Lock Manager
                  </text>
                  
                  <rect x="575" y="340" width="120" height="40" rx="8" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="635" y="365" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Execution Timer
                  </text>
                  
                  {/* Data Layer Components */}
                  <path d="M 150,470 L 250,470 L 260,480 L 250,490 L 150,490 L 140,480 Z" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="200" y="485" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Hash-Based Storage
                  </text>
                  
                  <path d="M 350,470 L 450,470 L 460,480 L 450,490 L 350,490 L 340,480 Z" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="400" y="485" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Index Manager
                  </text>
                  
                  <path d="M 550,470 L 650,470 L 660,480 L 650,490 L 550,490 L 540,480 Z" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="600" y="485" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Transaction Store
                  </text>
                  
                  <path d="M 750,470 L 850,470 L 860,480 L 850,490 L 750,490 L 740,480 Z" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="800" y="485" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    User Store (PostgreSQL)
                  </text>
                  
                  {/* Database Files with cloud style */}
                  <path d="M 150,540 Q 160,530 170,535 Q 180,520 190,525 Q 200,515 210,520 Q 220,510 230,515 
                         Q 240,525 250,520 L 250,560 Q 240,565 230,560 Q 220,565 210,560 Q 200,565 190,560 
                         Q 180,565 170,560 Q 160,565 150,560 Z" 
                      fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="200" y="545" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    database.json
                  </text>
                  
                  <path d="M 350,540 Q 360,530 370,535 Q 380,520 390,525 Q 400,515 410,520 Q 420,510 430,515 
                         Q 440,525 450,520 L 450,560 Q 440,565 430,560 Q 420,565 410,560 Q 400,565 390,560 
                         Q 380,565 370,560 Q 360,565 350,560 Z" 
                      fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="400" y="545" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    indexes.json
                  </text>
                  
                  <path d="M 550,540 Q 560,530 570,535 Q 580,520 590,525 Q 600,515 610,520 Q 620,510 630,515 
                         Q 640,525 650,520 L 650,560 Q 640,565 630,560 Q 620,565 610,560 Q 600,565 590,560 
                         Q 580,565 570,560 Q 560,565 550,560 Z" 
                      fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="600" y="545" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    transactions.json
                  </text>
                  
                  <path d="M 750,540 Q 760,530 770,535 Q 780,520 790,525 Q 800,515 810,520 Q 820,510 830,515 
                         Q 840,525 850,520 L 850,560 Q 840,565 830,560 Q 820,565 810,560 Q 800,565 790,560 
                         Q 780,565 770,560 Q 760,565 750,560 Z" 
                      fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="800" y="545" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    users.pg
                  </text>

                  {/* Key Features Section */}
                  <rect x="100" y="620" width="800" height="120" rx="20" fill="#ffdfd8" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="500" y="645" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Key Features
                  </text>
                  
                  {/* Feature 1 */}
                  <circle cx="130" cy="665" r="7" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="150" y="670" textAnchor="start" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    ACID Compliance
                  </text>
                  
                  {/* Feature 2 */}
                  <circle cx="310" cy="665" r="7" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="330" y="670" textAnchor="start" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Hash-Based Storage (O(1) Access)
                  </text>
                  
                  {/* Feature 3 */}
                  <circle cx="600" cy="665" r="7" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="620" y="670" textAnchor="start" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Multi-Column Indexing
                  </text>
                  
                  {/* Feature 4 */}
                  <circle cx="130" cy="695" r="7" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="150" y="700" textAnchor="start" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Real-time Transaction Monitoring
                  </text>
                  
                  {/* Feature 5 */}
                  <circle cx="400" cy="695" r="7" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="420" y="700" textAnchor="start" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    SQL Query Support
                  </text>
                  
                  {/* Feature 6 */}
                  <circle cx="600" cy="695" r="7" fill="#fff" stroke="#333" strokeWidth="2" filter="url(#pencil)"/>
                  <text x="620" y="700" textAnchor="start" fontSize="14" fontWeight="bold" fill="#333" filter="url(#pencil)">
                    Role-Based Access Control
                  </text>
                  
                  {/* Connections - Client to Server */}
                  <path d="M 210,180 C 210,200 185,220 185,270" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  <path d="M 410,180 C 410,215 335,230 335,270" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  <path d="M 610,180 C 610,215 635,230 635,270" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  <path d="M 810,180 C 810,215 785,230 785,270" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  
                  {/* Server Internal Connections */}
                  <path d="M 185,320 C 185,330 235,335 235,340" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  <path d="M 335,320 C 335,330 435,335 435,340" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  <path d="M 485,320 C 485,330 635,335 635,340" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  
                  {/* Server to Data Layer */}
                  <path d="M 235,380 C 235,395 200,430 200,470" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  <path d="M 435,380 C 435,395 400,430 400,470" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  <path d="M 635,380 C 635,395 600,430 600,470" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  <path d="M 785,320 C 785,350 800,450 800,470" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  
                  {/* Data Layer to Storage */}
                  <path d="M 200,490 C 200,510 200,525 200,540" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  <path d="M 400,490 C 400,510 400,525 400,540" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  <path d="M 600,490 C 600,510 600,525 600,540" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                  <path d="M 800,490 C 800,510 800,525 800,540" fill="none" stroke="#333" strokeWidth="2" markerEnd="url(#arrow)" filter="url(#pencil)"/>
                </svg>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HashBase DBMS Documentation</CardTitle>
              <CardDescription>
                Comprehensive system documentation and key implementation details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-bold">System Overview</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  HashBase DBMS is a comprehensive database management system that uses hash-based storage for O(1) access time.
                  It provides full ACID transaction support, advanced indexing capabilities, and a SQL query interface. The system is
                  built on a 3-tier architecture with separate client, server, and data layers.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The database engine is written in TypeScript and provides a RESTful API for client applications. It supports
                  multiple concurrent users with role-based access control and transaction isolation.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-bold">Key Features</h3>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
                  <li><span className="font-semibold">Hash-Based Storage:</span> O(1) access time for key-based operations, enabling fast data retrieval</li>
                  <li><span className="font-semibold">ACID Compliance:</span> Full support for Atomicity, Consistency, Isolation, and Durability</li>
                  <li><span className="font-semibold">Advanced Indexing:</span> Support for single and multi-column indexes for optimized query performance</li>
                  <li><span className="font-semibold">Transaction Management:</span> Comprehensive transaction support with commit, rollback, and isolation</li>
                  <li><span className="font-semibold">Concurrency Control:</span> Lock-based concurrency management with deadlock prevention</li>
                  <li><span className="font-semibold">SQL Query Support:</span> Familiar SQL interface for database operations</li>
                  <li><span className="font-semibold">Access Control:</span> Role-based security with fine-grained permissions at the table level</li>
                  <li><span className="font-semibold">Real-time Monitoring:</span> Transaction and lock monitoring for system administrators</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-bold">Architectural Layers</h3>
                
                <div className="space-y-2">
                  <h4 className="text-md font-semibold">Client Layer</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The client layer provides the user interface for interacting with the database. It includes components for
                    executing SQL queries, monitoring transactions, and managing database objects. The client communicates with
                    the server via a RESTful API.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-md font-semibold">Server Layer</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The server layer handles request processing, SQL parsing, query optimization, and execution. It includes the
                    transaction manager for maintaining ACID properties, a lock manager for concurrency control, and an access
                    control system for security. The execution timer measures query performance in milliseconds.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-md font-semibold">Data Layer</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The data layer manages the actual storage and retrieval of data. It uses a hash-based structure for O(1) access
                    time, maintains indexes for fast querying, and provides persistence through JSON file storage. User authentication
                    data is stored in PostgreSQL for enhanced security.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-bold">Technical Implementation</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  HashBase DBMS is implemented using modern web technologies:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
                  <li><span className="font-semibold">Frontend:</span> React with TypeScript, shadcn UI components, and TanStack Query for data fetching</li>
                  <li><span className="font-semibold">Backend:</span> Node.js with Express, implementing RESTful API endpoints for database operations</li>
                  <li><span className="font-semibold">Storage:</span> JSON file-based persistence with optional PostgreSQL integration for user authentication</li>
                  <li><span className="font-semibold">Security:</span> Password hashing with scrypt, role-based access control, and session management</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}