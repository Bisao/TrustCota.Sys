import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApprovalStep } from "@shared/schema";

export default function PendingApprovals() {
  const [selectedStep, setSelectedStep] = useState<ApprovalStep | null>(null);
  const [comments, setComments] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const { toast } = useToast();

  const { data: pendingApprovals = [], isLoading } = useQuery<ApprovalStep[]>({
    queryKey: ["/api/pending-approvals"],
  });

  const approveMutation = useMutation({
    mutationFn: ({ stepId, comments }: { stepId: string; comments?: string }) =>
      apiRequest(`/api/approval-steps/${stepId}/approve`, "POST", { comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requisitions"] });
      toast({
        title: "Success",
        description: "Requisition approved successfully.",
      });
      setSelectedStep(null);
      setComments("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve requisition.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ stepId, comments }: { stepId: string; comments: string }) =>
      apiRequest(`/api/approval-steps/${stepId}/reject`, "POST", { comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requisitions"] });
      toast({
        title: "Success",
        description: "Requisition rejected successfully.",
      });
      setSelectedStep(null);
      setComments("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject requisition.",
        variant: "destructive",
      });
    },
  });

  const handleAction = () => {
    if (!selectedStep) return;

    if (actionType === "approve") {
      approveMutation.mutate({ stepId: selectedStep.id, comments });
    } else {
      if (!comments.trim()) {
        toast({
          title: "Error",
          description: "Comments are required when rejecting a requisition.",
          variant: "destructive",
        });
        return;
      }
      rejectMutation.mutate({ stepId: selectedStep.id, comments });
    }
  };

  const openActionDialog = (step: ApprovalStep, action: "approve" | "reject") => {
    setSelectedStep(step);
    setActionType(action);
    setComments("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Pending Approvals ({pendingApprovals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No pending approvals
            </p>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((step) => (
                <div key={step.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Requisition Approval</h4>
                      <p className="text-sm text-muted-foreground">
                        Level {step.level} • {formatDate(step.createdAt)}
                      </p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => openActionDialog(step, "approve")}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openActionDialog(step, "reject")}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedStep} onOpenChange={() => setSelectedStep(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Requisition
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {actionType === "approve" 
                ? "You can optionally add comments for this approval."
                : "Please provide a reason for rejecting this requisition."
              }
            </p>
            
            <Textarea
              placeholder={
                actionType === "approve" 
                  ? "Optional comments..." 
                  : "Reason for rejection (required)"
              }
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required={actionType === "reject"}
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedStep(null)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className={
                  actionType === "approve" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : ""
                }
                variant={actionType === "reject" ? "destructive" : "default"}
              >
                {(approveMutation.isPending || rejectMutation.isPending) 
                  ? "Processing..." 
                  : actionType === "approve" 
                    ? "Approve" 
                    : "Reject"
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}