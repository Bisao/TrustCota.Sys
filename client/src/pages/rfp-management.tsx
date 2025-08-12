import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Send, FileText, Users, Calendar, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

const rfpFormSchema = z.object({
  requisitionId: z.string().min(1, "Requisition is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  specifications: z.string().min(1, "Specifications are required"),
  deliveryRequirements: z.string().optional(),
  submissionDeadline: z.string().min(1, "Deadline is required"),
  estimatedBudget: z.string().optional(),
  currency: z.string().default("USD"),
  evaluationCriteria: z.array(z.string()).min(1, "At least one criterion is required")
});

type RfpFormValues = z.infer<typeof rfpFormSchema>;

export default function RfpManagement() {
  const [createOpen, setCreateOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedRfp, setSelectedRfp] = useState<any>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  
  const queryClient = useQueryClient();

  const { data: rfpRequests = [], isLoading: loadingRfps } = useQuery<any[]>({
    queryKey: ["/api/rfp-requests"],
  });

  const { data: requisitions = [] } = useQuery<any[]>({
    queryKey: ["/api/requisitions"],
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["/api/suppliers"],
  });

  const createRfpMutation = useMutation({
    mutationFn: async (data: RfpFormValues) => {
      const response = await fetch("/api/rfp-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          submissionDeadline: data.submissionDeadline,
          estimatedBudget: data.estimatedBudget ? parseFloat(data.estimatedBudget) : null
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "RFP request created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/rfp-requests"] });
      setCreateOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create RFP request", variant: "destructive" });
    }
  });

  const sendRfpMutation = useMutation({
    mutationFn: async ({ rfpId, supplierIds }: { rfpId: string; supplierIds: string[] }) => {
      const response = await fetch(`/api/rfp-requests/${rfpId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ supplierIds }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "RFP sent to suppliers successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/rfp-requests"] });
      setSendDialogOpen(false);
      setSelectedSuppliers([]);
    },
    onError: () => {
      toast({ title: "Failed to send RFP", variant: "destructive" });
    }
  });

  const form = useForm<RfpFormValues>({
    resolver: zodResolver(rfpFormSchema),
    defaultValues: {
      title: "",
      description: "",
      specifications: "",
      deliveryRequirements: "",
      currency: "USD",
      evaluationCriteria: ["price", "quality", "delivery"]
    }
  });

  const onSubmit = (data: RfpFormValues) => {
    createRfpMutation.mutate(data);
  };

  const handleSendRfp = () => {
    if (selectedRfp && selectedSuppliers.length > 0) {
      sendRfpMutation.mutate({
        rfpId: selectedRfp.id,
        supplierIds: selectedSuppliers
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      sent: "default",
      receiving: "outline",
      closed: "destructive"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>;
  };

  if (loadingRfps) {
    return <div className="flex items-center justify-center h-64">Loading RFP requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">RFP Management</h1>
          <p className="text-muted-foreground">
            Create and manage Request for Proposal documents
          </p>
        </div>
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create RFP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New RFP Request</DialogTitle>
              <DialogDescription>
                Create a detailed Request for Proposal to send to suppliers
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="requisitionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requisition</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select requisition" />
                          </SelectTrigger>
                          <SelectContent>
                            {requisitions.map((req: any) => (
                              <SelectItem key={req.id} value={req.id}>
                                {req.requisitionNumber} - {req.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RFP Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter RFP title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a detailed description of what you need"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical Specifications</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List technical requirements and specifications"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="submissionDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Submission Deadline</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Budget</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="Enter budget estimate"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createRfpMutation.isPending}>
                    {createRfpMutation.isPending ? "Creating..." : "Create RFP"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* RFP Requests Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rfpRequests.map((rfp: any) => (
          <Card key={rfp.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{rfp.title}</CardTitle>
                  <CardDescription>{rfp.description}</CardDescription>
                </div>
                {getStatusBadge(rfp.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(rfp.submissionDeadline), "MMM dd, yyyy")}
                  </span>
                </div>
                
                {rfp.estimatedBudget && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${parseFloat(rfp.estimatedBudget).toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4 text-muted-foreground" />
                  <span>{rfp.emailsSent || 0} sent</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{rfp.responsesReceived || 0} responses</span>
                </div>
              </div>

              <div className="flex space-x-2">
                {rfp.status === "draft" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRfp(rfp);
                      setSendDialogOpen(true);
                    }}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Send to Suppliers
                  </Button>
                )}
                
                <Button size="sm" variant="ghost">
                  <FileText className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Send RFP Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send RFP to Suppliers</DialogTitle>
            <DialogDescription>
              Select suppliers to receive this RFP request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {suppliers.map((supplier: any) => (
                <div key={supplier.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={supplier.id}
                    checked={selectedSuppliers.includes(supplier.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSuppliers([...selectedSuppliers, supplier.id]);
                      } else {
                        setSelectedSuppliers(selectedSuppliers.filter(id => id !== supplier.id));
                      }
                    }}
                  />
                  <Label htmlFor={supplier.id} className="flex-1">
                    <div>
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {supplier.category} • Rating: {supplier.rating || "N/A"}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendRfp}
                disabled={selectedSuppliers.length === 0 || sendRfpMutation.isPending}
              >
                {sendRfpMutation.isPending ? "Sending..." : `Send to ${selectedSuppliers.length} Suppliers`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}