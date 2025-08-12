import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";
import { ApprovalStep } from "@shared/schema";

interface ApprovalStepsDisplayProps {
  requisitionId: string;
}

export default function ApprovalStepsDisplay({ requisitionId }: ApprovalStepsDisplayProps) {
  const { data: steps = [], isLoading } = useQuery<ApprovalStep[]>({
    queryKey: ["/api/approval-steps", requisitionId],
    queryFn: () => fetch(`/api/approval-steps/${requisitionId}`).then(res => res.json())
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not processed";
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
          <CardTitle>Approval Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (steps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No approval steps required for this requisition.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">
                    Level {step.level} Approval
                  </p>
                  {getStatusBadge(step.status)}
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  Created: {formatDate(step.createdAt)}
                  {step.approvedAt && ` • Processed: ${formatDate(step.approvedAt.toString())}`}
                </p>

                {step.comments && (
                  <div className="bg-muted p-2 rounded text-sm">
                    <p className="font-medium text-xs text-muted-foreground mb-1">Comments:</p>
                    <p>{step.comments}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}