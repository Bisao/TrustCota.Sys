import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Shield, CheckCircle, XCircle, AlertTriangle, FileText, Star } from "lucide-react";
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
import { insertSupplierQualificationSchema, type SupplierQualification, type Supplier } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const qualificationFormSchema = insertSupplierQualificationSchema.extend({
  bankingInfo: z.string().optional(),
});

type QualificationFormData = z.infer<typeof qualificationFormSchema>;

export default function SupplierQualificationsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: qualifications = [], isLoading } = useQuery<SupplierQualification[]>({
    queryKey: ["/api/supplier-qualifications"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const createQualificationMutation = useMutation({
    mutationFn: async (data: QualificationFormData) => {
      const response = await fetch("/api/supplier-qualifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          bankingInfo: data.bankingInfo ? JSON.parse(data.bankingInfo) : null,
        }),
      });
      if (!response.ok) throw new Error("Failed to create supplier qualification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-qualifications"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Success", description: "Supplier qualification created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create supplier qualification", variant: "destructive" });
    },
  });

  const form = useForm<QualificationFormData>({
    resolver: zodResolver(qualificationFormSchema),
    defaultValues: {
      supplierId: "",
      qualificationStatus: "pending",
      documents: [],
      certifications: [],
      legalDocuments: [],
      dueDiligenceNotes: "",
      complianceScore: "0",
      riskLevel: "medium",
      approvalWorkflowStatus: "pending",
      bankingInfo: "",
    },
  });

  const onSubmit = (data: QualificationFormData) => {
    createQualificationMutation.mutate(data);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "qualified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "under_review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "critical":
        return "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200";
      case "medium":
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
    <div className="space-y-6" data-testid="supplier-qualifications-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Supplier Qualifications</h1>
          <p className="text-muted-foreground">Manage supplier qualification processes and compliance</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-qualification">
              <Plus className="mr-2 h-4 w-4" />
              Create Qualification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Supplier Qualification</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-supplier">
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier) => (
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
                    name="qualificationStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-qualification-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
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
                    name="riskLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-risk-level">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="complianceScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compliance Score (0-100)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="85.5"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-compliance-score"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dueDiligenceNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Diligence Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter due diligence findings and notes"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-due-diligence-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankingInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banking Information (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='{"bankName": "Example Bank", "accountNumber": "****1234", "routingNumber": "123456789"}'
                          className="resize-none font-mono text-sm"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-banking-info"
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
                  <Button type="submit" disabled={createQualificationMutation.isPending} data-testid="button-submit">
                    {createQualificationMutation.isPending ? "Creating..." : "Create Qualification"}
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
            <CardTitle className="text-sm font-medium">Total Qualifications</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-qualifications">{qualifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified Suppliers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-qualified-suppliers">
              {qualifications.filter(q => q.qualificationStatus === 'qualified').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-under-review">
              {qualifications.filter(q => q.qualificationStatus === 'under_review').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="stat-high-risk">
              {qualifications.filter(q => q.riskLevel === 'high' || q.riskLevel === 'critical').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Qualifications</CardTitle>
          <CardDescription>Manage and track supplier qualification processes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Compliance Score</TableHead>
                <TableHead>Review Date</TableHead>
                <TableHead>Next Review</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qualifications.map((qualification) => {
                const supplier = suppliers.find(s => s.id === qualification.supplierId);
                return (
                  <TableRow key={qualification.id} data-testid={`qualification-row-${qualification.id}`}>
                    <TableCell className="font-medium" data-testid={`text-supplier-name-${qualification.id}`}>
                      {supplier?.name || 'Unknown Supplier'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(qualification.qualificationStatus)} data-testid={`badge-status-${qualification.id}`}>
                        {qualification.qualificationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskBadgeColor(qualification.riskLevel || 'medium')} data-testid={`badge-risk-${qualification.id}`}>
                        {qualification.riskLevel || 'medium'}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-compliance-score-${qualification.id}`}>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{qualification.complianceScore || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-review-date-${qualification.id}`}>
                      {qualification.reviewDate ? new Date(qualification.reviewDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell data-testid={`text-next-review-${qualification.id}`}>
                      {qualification.nextReviewDate ? new Date(qualification.nextReviewDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" data-testid={`button-view-${qualification.id}`}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {qualifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No supplier qualifications found. Create your first qualification to get started.
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