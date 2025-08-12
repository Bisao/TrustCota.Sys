import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Search, Filter, Download, Eye, User, Clock, FileText, Plus, Edit, Trash, CheckCircle, XCircle, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedEntity, setSelectedEntity] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["/api/audit-logs", searchTerm, selectedAction, selectedEntity, selectedUser, dateFrom, dateTo],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const actionTypes = [
    { value: "all", label: "All Actions" },
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "delete", label: "Delete" },
    { value: "approve", label: "Approve" },
    { value: "reject", label: "Reject" },
    { value: "login", label: "Login" },
    { value: "logout", label: "Logout" },
  ];

  const entityTypes = [
    { value: "all", label: "All Entities" },
    { value: "requisition", label: "Requisitions" },
    { value: "supplier", label: "Suppliers" },
    { value: "quote", label: "Quotes" },
    { value: "purchase_order", label: "Purchase Orders" },
    { value: "contract", label: "Contracts" },
    { value: "inventory", label: "Inventory" },
    { value: "user", label: "Users" },
  ];

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'delete':
        return <Trash className="w-4 h-4 text-red-500" />;
      case 'approve':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'reject':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'login':
        return <LogIn className="w-4 h-4 text-blue-500" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'approve':
        return 'bg-green-100 text-green-800';
      case 'reject':
        return 'bg-red-100 text-red-800';
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportLogs = () => {
    // Implementation for exporting logs to CSV/Excel
    console.log("Exporting logs...");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all system activities and user actions</p>
        </div>
        <Button onClick={exportLogs} data-testid="button-export-logs">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger data-testid="select-action">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger data-testid="select-entity">
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map((entity) => (
                  <SelectItem key={entity.value} value={entity.value}>
                    {entity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger data-testid="select-user">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">From:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">To:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedAction("all");
                setSelectedEntity("all");
                setSelectedUser("all");
                setDateFrom(undefined);
                setDateTo(undefined);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <div className="space-y-4">
        {logs.map((log: AuditLog) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getActionIcon(log.action)}
                    <Badge className={getActionBadgeColor(log.action)}>
                      {log.action.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{log.userName}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>{log.entityType}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(log.timestamp), "PPp")}</span>
                  </div>
                </div>

                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>

              {log.details && (
                <div className="mt-3 text-sm text-muted-foreground">
                  {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                </div>
              )}

              {log.ipAddress && (
                <div className="mt-2 text-xs text-muted-foreground">
                  IP: {log.ipAddress}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Audit Logs Found</h3>
            <p className="text-muted-foreground">
              No logs match your current filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}