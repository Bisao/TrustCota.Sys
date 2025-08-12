import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContractSchema, type Contract, type InsertContract } from "@shared/schema";
import { FileText, Plus, Calendar, AlertTriangle, Search, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ContractsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: expiringContracts = [] } = useQuery<Contract[]>({
    queryKey: ["/api/contracts/expiring"],
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["/api/suppliers"],
  });

  const createContractMutation = useMutation({
    mutationFn: (data: InsertContract) => 
      fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/expiring"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ title: "Contract created successfully" });
    },
  });

  const form = useForm<InsertContract>({
    resolver: zodResolver(insertContractSchema),
    defaultValues: {
      supplierId: "",
      title: "",
      description: "",
      contractType: "",
      startDate: new Date(),
      endDate: new Date(),
      value: "0",
      currency: "USD",
      status: "draft",
      autoRenewal: false,
      renewalPeriod: 12,
      terms: "",
      alertDays: 30,
    },
  });

  const filteredContracts = contracts.filter((contract: Contract) => {
    const matchesSearch = contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "draft": return "secondary";
      case "expired": return "destructive";
      case "terminated": return "outline";
      default: return "secondary";
    }
  };

  const formatCurrency = (amount: string, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(parseFloat(amount));
  };

  const isExpiringSoon = (endDate: string, alertDays: number = 30) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= alertDays && daysUntilExpiry > 0;
  };

  const isExpired = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    return expiry < today;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts Management</h1>
          <p className="text-muted-foreground">
            Manage supplier contracts and agreements
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-contract">
              <FileText className="mr-2 h-4 w-4" />
              Add Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createContractMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Title</FormLabel>
                        <FormControl>
                          <Input data-testid="input-contract-title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-contract-supplier">
                              <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier: any) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-contract-type">
                              <SelectValue placeholder="Select contract type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="goods">Goods</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="consulting">Consulting</SelectItem>
                            <SelectItem value="license">License</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-contract-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="terminated">Terminated</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-start-date"
                            type="date" 
                            {...field} 
                            value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-end-date"
                            type="date" 
                            {...field} 
                            value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Value</FormLabel>
                        <FormControl>
                          <Input data-testid="input-contract-value" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-currency">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="BRL">BRL</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="renewalPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Renewal Period (months)</FormLabel>
                        <FormControl>
                          <Input data-testid="input-renewal-period" type="number" {...field} value={field.value || 0} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alertDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alert Days Before Expiry</FormLabel>
                        <FormControl>
                          <Input data-testid="input-alert-days" type="number" {...field} value={field.value || 0} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea data-testid="textarea-description" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms and Conditions</FormLabel>
                      <FormControl>
                        <Textarea data-testid="textarea-terms" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="autoRenewal"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <input
                            data-testid="checkbox-auto-renewal"
                            type="checkbox"
                            checked={field.value || false}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Auto Renewal</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={createContractMutation.isPending} data-testid="button-save-contract">
                  {createContractMutation.isPending ? "Creating..." : "Create Contract"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expiring Contracts Alert */}
      {expiringContracts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Contracts Expiring Soon ({expiringContracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringContracts.map((contract: Contract) => (
                <div key={contract.id} className="flex items-center justify-between p-2 bg-white rounded border" data-testid={`alert-expiring-${contract.id}`}>
                  <span className="font-medium">{contract.title}</span>
                  <span className="text-sm text-muted-foreground">
                    Expires: {format(new Date(contract.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-search-contracts"
            placeholder="Search contracts by title or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredContracts.map((contract: Contract) => (
            <Card key={contract.id} className={isExpired(contract.endDate?.toString() || "") ? "border-red-200" : isExpiringSoon(contract.endDate?.toString() || "", contract.alertDays || 30) ? "border-orange-200" : ""} data-testid={`card-contract-${contract.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{contract.title}</CardTitle>
                  <Badge variant={getStatusColor(contract.status) as any}>
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{contract.contractNumber}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Type:</span>
                    <span className="font-medium">{contract.contractType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Value:</span>
                    <span className="font-medium">{formatCurrency(contract.value || "0", contract.currency || "USD")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Start Date:</span>
                    <span className="font-medium">{format(new Date(contract.startDate?.toString() || new Date()), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">End Date:</span>
                    <span className={`font-medium ${isExpired(contract.endDate?.toString() || "") ? 'text-red-600' : isExpiringSoon(contract.endDate?.toString() || "", contract.alertDays || 30) ? 'text-orange-600' : ''}`}>
                      {format(new Date(contract.endDate?.toString() || new Date()), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {contract.autoRenewal && (
                    <div className="flex justify-between">
                      <span className="text-sm">Auto Renewal:</span>
                      <Badge variant="secondary">
                        {contract.renewalPeriod} months
                      </Badge>
                    </div>
                  )}
                  {contract.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {contract.description}
                    </p>
                  )}
                </div>
                {(isExpired(contract.endDate?.toString() || "") || isExpiringSoon(contract.endDate?.toString() || "", contract.alertDays || 30)) && (
                  <div className="mt-3 p-2 rounded bg-orange-50 border border-orange-200">
                    <p className="text-sm text-orange-800 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {isExpired(contract.endDate?.toString() || "") ? "Contract has expired" : "Expires soon"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}