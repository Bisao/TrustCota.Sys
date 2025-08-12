import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package, Check, X, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReceiptSchema, type Receipt, type PurchaseOrder } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const receiptFormSchema = insertReceiptSchema.extend({
  items: z.string().optional(),
  discrepancies: z.string().optional(),
});

type ReceiptFormData = z.infer<typeof receiptFormSchema>;

export default function ReceiptsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: receipts = [], isLoading } = useQuery<Receipt[]>({
    queryKey: ["/api/receipts"],
  });

  const { data: purchaseOrders = [] } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const createReceiptMutation = useMutation({
    mutationFn: async (data: ReceiptFormData) => {
      const response = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: data.items ? JSON.stringify(JSON.parse(data.items)) : null,
          discrepancies: data.discrepancies ? JSON.stringify(JSON.parse(data.discrepancies)) : null,
        }),
      });
      if (!response.ok) throw new Error("Failed to create receipt");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Success", description: "Receipt created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create receipt", variant: "destructive" });
    },
  });

  const form = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      purchaseOrderId: "",
      deliveryNote: "",
      qualityCheck: "pending",
      qualityNotes: "",
      status: "partial",
      items: "",
      discrepancies: "",
    },
  });

  const onSubmit = (data: ReceiptFormData) => {
    createReceiptMutation.mutate(data);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "partial":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "damaged":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "rejected":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getQualityBadgeColor = (quality: string) => {
    switch (quality) {
      case "passed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="receipts-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Receipt Management</h1>
          <p className="text-muted-foreground">Track and manage delivery receipts and quality inspections</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-receipt">
              <Plus className="mr-2 h-4 w-4" />
              Create Receipt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Receipt</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purchaseOrderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Order</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-purchase-order">
                              <SelectValue placeholder="Select PO" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {purchaseOrders.map((po) => (
                              <SelectItem key={po.id} value={po.id}>
                                {po.poNumber} - ${po.totalAmount}
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                            <SelectItem value="damaged">Damaged</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="deliveryNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Note</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter delivery note" {...field} value={field.value || ""} data-testid="input-delivery-note" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="qualityCheck"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quality Check</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-quality-check">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="passed">Passed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="qualityNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter quality inspection notes"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-quality-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="items"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Received Items (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='[{"itemName": "Sample Item", "quantityReceived": 10, "quantityOrdered": 10}]'
                          className="resize-none font-mono text-sm"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-items"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createReceiptMutation.isPending} data-testid="button-submit">
                    {createReceiptMutation.isPending ? "Creating..." : "Create Receipt"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-receipts">{receipts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete Receipts</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-complete-receipts">
              {receipts.filter(r => r.status === 'complete').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Passed</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-quality-passed">
              {receipts.filter(r => r.qualityCheck === 'passed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quality</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="stat-pending-quality">
              {receipts.filter(r => r.qualityCheck === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts</CardTitle>
          <CardDescription>Latest delivery receipts and quality inspections</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>Received Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quality Check</TableHead>
                <TableHead>Received By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id} data-testid={`receipt-row-${receipt.id}`}>
                  <TableCell className="font-mono" data-testid={`text-receipt-number-${receipt.id}`}>
                    {receipt.receiptNumber}
                  </TableCell>
                  <TableCell data-testid={`text-po-number-${receipt.id}`}>
                    {purchaseOrders.find(po => po.id === receipt.purchaseOrderId)?.poNumber || 'N/A'}
                  </TableCell>
                  <TableCell data-testid={`text-received-date-${receipt.id}`}>
                    {new Date(receipt.receivedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(receipt.status)} data-testid={`badge-status-${receipt.id}`}>
                      {receipt.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getQualityBadgeColor(receipt.qualityCheck || 'pending')} data-testid={`badge-quality-${receipt.id}`}>
                      {receipt.qualityCheck || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell data-testid={`text-received-by-${receipt.id}`}>
                    User #{receipt.receivedBy?.slice(-4)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" data-testid={`button-view-${receipt.id}`}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {receipts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No receipts found. Create your first receipt to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}