import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Settings, Eye, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const approvalFlowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  minAmount: z.number().min(0),
  maxAmount: z.number().min(0),
  category: z.string().min(1, "Category is required"),
  department: z.string().optional(),
  steps: z.array(z.object({
    level: z.number(),
    approverId: z.string(),
    approverName: z.string(),
    isRequired: z.boolean().default(true)
  })).min(1, "At least one approval step is required")
});

type ApprovalFlowFormData = z.infer<typeof approvalFlowSchema>;

export default function FlowManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: flows = [], isLoading } = useQuery({
    queryKey: ["/api/approval-flows"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const form = useForm<ApprovalFlowFormData>({
    resolver: zodResolver(approvalFlowSchema),
    defaultValues: {
      name: "",
      description: "",
      minAmount: 0,
      maxAmount: 10000,
      category: "",
      department: "",
      steps: [
        { level: 1, approverId: "", approverName: "", isRequired: true }
      ]
    }
  });

  const createFlowMutation = useMutation({
    mutationFn: (data: ApprovalFlowFormData) => 
      apiRequest("/api/approval-flows", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/approval-flows"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Approval flow created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create approval flow", variant: "destructive" });
    }
  });

  const onSubmit = (data: ApprovalFlowFormData) => {
    createFlowMutation.mutate(data);
  };

  const addApprovalStep = () => {
    const currentSteps = form.getValues("steps");
    form.setValue("steps", [
      ...currentSteps,
      { level: currentSteps.length + 1, approverId: "", approverName: "", isRequired: true }
    ]);
  };

  const removeApprovalStep = (index: number) => {
    const currentSteps = form.getValues("steps");
    if (currentSteps.length > 1) {
      form.setValue("steps", currentSteps.filter((_, i) => i !== index));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold">Approval Flow Management</h1>
          <p className="text-muted-foreground">Configure and manage approval workflows for requisitions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-flow">
              <Plus className="w-4 h-4 mr-2" />
              Create Flow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Approval Flow</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flow Name</FormLabel>
                        <FormControl>
                          <Input data-testid="input-flow-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="office_supplies">Office Supplies</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="software">Software</SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Amount ($)</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-min-amount" 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Amount ($)</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-max-amount" 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
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
                        <Textarea data-testid="textarea-description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Approval Steps</h3>
                    <Button type="button" variant="outline" onClick={addApprovalStep}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Step
                    </Button>
                  </div>

                  {form.watch("steps").map((step, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Step {index + 1}</h4>
                        {form.watch("steps").length > 1 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeApprovalStep(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <FormField
                        control={form.control}
                        name={`steps.${index}.approverId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Approver</FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              const user = users.find((u: any) => u.id === value);
                              if (user) {
                                form.setValue(`steps.${index}.approverName`, user.username);
                              }
                            }} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select approver" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.filter((user: any) => user.role === 'approver' || user.role === 'admin').map((user: any) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.username} ({user.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <Button type="submit" disabled={createFlowMutation.isPending} data-testid="button-save-flow">
                  {createFlowMutation.isPending ? "Creating..." : "Create Flow"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flows.map((flow: any) => (
          <Card key={flow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{flow.name}</span>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{flow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{flow.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Range:</span>
                  <span className="font-medium">${flow.minAmount} - ${flow.maxAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Steps:</span>
                  <span className="font-medium">{flow.steps?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {flows.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Approval Flows</h3>
            <p className="text-muted-foreground mb-4">
              Create your first approval flow to start managing requisition approvals
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Flow
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}