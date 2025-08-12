import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventorySchema, type Inventory, type InsertInventory } from "@shared/schema";
import { Package, Plus, Minus, AlertTriangle, Search, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const stockMovementSchema = z.object({
  inventoryId: z.string(),
  quantity: z.number().int().min(1),
  movementType: z.enum(["in", "out", "adjustment"]),
  reason: z.string().min(1, "Reason is required"),
});

export default function InventoryPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory = [], isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: lowStockItems = [] } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory/low-stock"],
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["/api/suppliers"],
  });

  const createItemMutation = useMutation({
    mutationFn: (data: InsertInventory) => 
      fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Inventory item created successfully" });
    },
  });

  const stockMovementMutation = useMutation({
    mutationFn: (data: z.infer<typeof stockMovementSchema>) =>
      fetch("/api/stock-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      setIsStockDialogOpen(false);
      setSelectedItem(null);
      toast({ title: "Stock movement recorded successfully" });
    },
  });

  const itemForm = useForm<InsertInventory>({
    resolver: zodResolver(insertInventorySchema),
    defaultValues: {
      itemCode: "",
      itemName: "",
      description: "",
      category: "",
      unit: "",
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      unitCost: "0",
      location: "",
      supplierId: "",
    },
  });

  const stockForm = useForm<z.infer<typeof stockMovementSchema>>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      inventoryId: "",
      quantity: 0,
      movementType: "in",
      reason: "",
    },
  });

  const filteredInventory = inventory.filter((item: Inventory) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (item: Inventory) => {
    if (item.currentStock <= item.minStock) return { label: "Low", color: "destructive" };
    if (item.currentStock >= item.maxStock) return { label: "High", color: "warning" };
    return { label: "Normal", color: "default" };
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory items and stock levels
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-inventory">
              <Package className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <Form {...itemForm}>
              <form onSubmit={itemForm.handleSubmit((data) => createItemMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={itemForm.control}
                    name="itemCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Code</FormLabel>
                        <FormControl>
                          <Input data-testid="input-item-code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="itemName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input data-testid="input-item-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input data-testid="input-category" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input data-testid="input-unit" placeholder="pc, kg, liter" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="currentStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Stock</FormLabel>
                        <FormControl>
                          <Input data-testid="input-current-stock" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock</FormLabel>
                        <FormControl>
                          <Input data-testid="input-min-stock" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="maxStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Stock</FormLabel>
                        <FormControl>
                          <Input data-testid="input-max-stock" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="unitCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Cost</FormLabel>
                        <FormControl>
                          <Input data-testid="input-unit-cost" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input data-testid="input-location" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Supplier</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-supplier">
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
                </div>
                <FormField
                  control={itemForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input data-testid="input-description" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createItemMutation.isPending} data-testid="button-save-item">
                  {createItemMutation.isPending ? "Creating..." : "Create Item"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Stock Alert ({lowStockItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((item: Inventory) => (
                <Badge key={item.id} variant="destructive" data-testid={`badge-low-stock-${item.id}`}>
                  {item.itemName} ({item.currentStock} {item.unit})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-search"
            placeholder="Search items by name, code, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredInventory.map((item: Inventory) => {
            const status = getStockStatus(item);
            return (
              <Card key={item.id} data-testid={`card-inventory-${item.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.itemName}</CardTitle>
                    <Badge variant={status.color as any}>{status.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.itemCode}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current Stock:</span>
                      <span className="font-medium">{item.currentStock} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Unit Cost:</span>
                      <span className="font-medium">{formatCurrency(item.unitCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Value:</span>
                      <span className="font-medium">{formatCurrency(item.totalValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Category:</span>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    {item.location && (
                      <div className="flex justify-between">
                        <span className="text-sm">Location:</span>
                        <span className="font-medium">{item.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(item);
                        stockForm.setValue("inventoryId", item.id);
                        stockForm.setValue("movementType", "in");
                        setIsStockDialogOpen(true);
                      }}
                      data-testid={`button-stock-in-${item.id}`}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      In
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(item);
                        stockForm.setValue("inventoryId", item.id);
                        stockForm.setValue("movementType", "out");
                        setIsStockDialogOpen(true);
                      }}
                      data-testid={`button-stock-out-${item.id}`}
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Out
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(item);
                        stockForm.setValue("inventoryId", item.id);
                        stockForm.setValue("movementType", "adjustment");
                        setIsStockDialogOpen(true);
                      }}
                      data-testid={`button-adjust-${item.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Adjust
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Stock Movement Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Stock Movement - {selectedItem?.itemName}
            </DialogTitle>
          </DialogHeader>
          <Form {...stockForm}>
            <form onSubmit={stockForm.handleSubmit((data) => stockMovementMutation.mutate(data))} className="space-y-4">
              <FormField
                control={stockForm.control}
                name="movementType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Movement Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-movement-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in">Stock In</SelectItem>
                        <SelectItem value="out">Stock Out</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={stockForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {stockForm.watch("movementType") === "adjustment" ? "New Stock Level" : "Quantity"}
                    </FormLabel>
                    <FormControl>
                      <Input data-testid="input-movement-quantity" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={stockForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Input data-testid="input-movement-reason" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={stockMovementMutation.isPending} data-testid="button-save-movement">
                {stockMovementMutation.isPending ? "Recording..." : "Record Movement"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}