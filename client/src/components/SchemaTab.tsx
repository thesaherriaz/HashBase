import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Trash2, 
  Edit, 
  Key, 
  Lock, 
  Database, 
  Users, 
  Shield, 
  RefreshCw,
  Info,
  Plus
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface SchemaTabProps {
  onStatusChange: (status: string) => void;
}

export default function SchemaTab({ onStatusChange }: SchemaTabProps) {
  const [activeView, setActiveView] = useState<string>('tables');
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showAddTableDialog, setShowAddTableDialog] = useState(false);
  
  useEffect(() => {
    onStatusChange('Managing database schema');
  }, [onStatusChange]);

  // Fetch all tables
  const { 
    data: tables = {}, 
    isLoading: tablesLoading, 
    refetch: refetchTables 
  } = useQuery({
    queryKey: ['/api/tables'],
    queryFn: async () => {
      const response = await fetch('/api/tables');
      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }
      return response.json();
    },
  });

  // Fetch all users
  const { 
    data: users = [], 
    isLoading: usersLoading,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    enabled: user?.role === 'admin', // Only fetch if user is admin
  });

  // Fetch all indexes
  const { 
    data: indexes = {}, 
    isLoading: indexesLoading,
    refetch: refetchIndexes
  } = useQuery({
    queryKey: ['/api/indexes'],
    queryFn: async () => {
      const response = await fetch('/api/indexes');
      if (!response.ok) {
        throw new Error('Failed to fetch indexes');
      }
      return response.json();
    },
  });

  // Drop table mutation
  const dropTableMutation = useMutation({
    mutationFn: async (tableName: string) => {
      const response = await fetch(`/api/tables/${tableName}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to drop table');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Table dropped",
        description: "Table has been successfully removed",
      });
      refetchTables();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to drop table",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create table mutation
  const createTableMutation = useMutation({
    mutationFn: async (tableData: any) => {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableData),
      });
      if (!response.ok) {
        throw new Error('Failed to create table');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Table created",
        description: "New table has been successfully created",
      });
      setShowAddTableDialog(false);
      refetchTables();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create table",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create index mutation
  const createIndexMutation = useMutation({
    mutationFn: async ({ tableName, columnName }: { tableName: string, columnName: string }) => {
      const response = await fetch('/api/indexes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName, columnName }),
      });
      if (!response.ok) {
        throw new Error('Failed to create index');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Index created",
        description: "New index has been successfully created",
      });
      refetchIndexes();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create index",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Drop index mutation
  const dropIndexMutation = useMutation({
    mutationFn: async ({ tableName, columnName }: { tableName: string, columnName: string }) => {
      const response = await fetch(`/api/indexes/${tableName}/${columnName}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to drop index');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Index dropped",
        description: "Index has been successfully removed",
      });
      refetchIndexes();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to drop index",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Grant permission mutation
  const grantPermissionMutation = useMutation({
    mutationFn: async ({ tableName, userId, permission }: { tableName: string, userId: string, permission: string }) => {
      const response = await fetch('/api/permissions/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName, userId, permission }),
      });
      if (!response.ok) {
        throw new Error('Failed to grant permission');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Permission granted",
        description: "Table permission has been granted to user",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to grant permission",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refetchTables();
    refetchIndexes();
    if (user?.role === 'admin') {
      refetchUsers();
    }
    toast({
      title: "Refreshed",
      description: "Schema information has been refreshed",
    });
  };

  const handleCreateTable = (formData: FormData) => {
    const name = formData.get('tableName') as string;
    const columnName = formData.get('columnName') as string;
    const columnType = formData.get('columnType') as string;
    const isPrimaryKey = formData.get('isPrimaryKey') === 'on';
    
    const columns: Record<string, any> = {};
    columns[columnName] = {
      type: columnType,
      constraints: isPrimaryKey ? ['primary_key'] : []
    };

    createTableMutation.mutate({
      name,
      columns
    });
  };

  const renderTablesList = () => {
    if (tablesLoading) {
      return (
        <div className="flex justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Tables</h3>
          <div className="space-x-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowAddTableDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Table
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Columns</TableHead>
              <TableHead>Records</TableHead>
              <TableHead>Constraints</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(tables).length > 0 ? (
              Object.entries(tables).map(([tableName, tableData]: [string, any]) => (
                <TableRow key={tableName}>
                  <TableCell className="font-medium">{tableName}</TableCell>
                  <TableCell>{Object.keys(tableData.columns).length}</TableCell>
                  <TableCell>{Object.keys(tableData.records).length}</TableCell>
                  <TableCell>
                    {tableData.primary_keys && tableData.primary_keys.length > 0 && (
                      <Badge variant="outline" className="mr-1">
                        <Key className="h-3 w-3 mr-1" />
                        PK: {tableData.primary_keys.join(', ')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => setSelectedTable(tableName)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (confirm(`Are you sure you want to drop table '${tableName}'?`)) {
                          dropTableMutation.mutate(tableName);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Drop
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No tables found. Create your first table using the button above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {selectedTable && tables[selectedTable] && (
          <Dialog open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Table Details: {selectedTable}</DialogTitle>
                <DialogDescription>
                  View column information, indexes, and table structure
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="columns">
                <TabsList>
                  <TabsTrigger value="columns">Columns</TabsTrigger>
                  <TabsTrigger value="indexes">Indexes</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="columns">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Constraints</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(tables[selectedTable].columns).map(([colName, colData]: [string, any]) => (
                        <TableRow key={colName}>
                          <TableCell className="font-medium">{colName}</TableCell>
                          <TableCell>{colData.type}</TableCell>
                          <TableCell>
                            {colData.constraints && colData.constraints.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {colData.constraints.map((constraint: string) => (
                                  <Badge key={constraint} variant="outline">
                                    {constraint === 'primary_key' && <Key className="h-3 w-3 mr-1" />}
                                    {constraint}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="indexes">
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Column</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {indexes[selectedTable] ? (
                          Object.keys(indexes[selectedTable]).length > 0 ? (
                            Object.keys(indexes[selectedTable]).map((colName) => (
                              <TableRow key={colName}>
                                <TableCell className="font-medium">{colName}</TableCell>
                                <TableCell>Hash Index</TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => {
                                      if (confirm(`Drop index on ${selectedTable}.${colName}?`)) {
                                        dropIndexMutation.mutate({
                                          tableName: selectedTable,
                                          columnName: colName
                                        });
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Drop
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-muted-foreground">
                                No indexes found for this table
                              </TableCell>
                            </TableRow>
                          )
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              No indexes found for this table
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Create New Index</h4>
                      <div className="flex space-x-2">
                        <Select 
                          onValueChange={(value) => {
                            createIndexMutation.mutate({
                              tableName: selectedTable,
                              columnName: value
                            });
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(tables[selectedTable].columns).map((colName) => (
                              <SelectItem key={colName} value={colName}>
                                {colName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button disabled={createIndexMutation.isPending}>
                          {createIndexMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            "Create Index"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="permissions">
                  {user?.role === 'admin' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Manage Table Permissions</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>User</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user: any) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.username} ({user.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Permission</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select permission" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="read">Read</SelectItem>
                              <SelectItem value="write">Write</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button className="w-full">Grant Permission</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={showAddTableDialog} onOpenChange={setShowAddTableDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Table</DialogTitle>
              <DialogDescription>
                Define your table structure. You can add more columns after creation.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateTable(new FormData(e.target as HTMLFormElement));
            }}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tableName">Table Name</Label>
                  <Input id="tableName" name="tableName" required placeholder="e.g. customers" />
                </div>
                
                <div className="space-y-2">
                  <Label>First Column</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="columnName" required placeholder="Column name (e.g. id)" />
                    <Select name="columnType" required defaultValue="string">
                      <SelectTrigger>
                        <SelectValue placeholder="Data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="int">Integer</SelectItem>
                        <SelectItem value="float">Float</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="datetime">DateTime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="isPrimaryKey" name="isPrimaryKey" />
                  <Label htmlFor="isPrimaryKey">Set as primary key</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddTableDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTableMutation.isPending}>
                  {createTableMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Create Table
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  const renderUsersList = () => {
    if (user?.role !== 'admin') {
      return (
        <div className="p-8 text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            You need administrator privileges to view and manage users.
          </p>
        </div>
      );
    }

    if (usersLoading) {
      return (
        <div className="flex justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Users</h3>
          <div className="space-x-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-1" />
                      Permissions
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tables" className="w-full" value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="tables">
            <Database className="h-4 w-4 mr-2" />
            Tables & Indexes
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users & Permissions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Schema</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                {renderTablesList()}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                {renderUsersList()}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}