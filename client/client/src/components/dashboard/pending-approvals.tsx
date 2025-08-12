import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Requisition } from "@shared/schema";

export default function PendingApprovals() {
  const { data: requisitions = [], isLoading } = useQuery<Requisition[]>({
    queryKey: ["/api/requisitions"],
  });

  const pendingApprovals = requisitions.filter(req => req.status === 'pending').slice(0, 3);

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded mb-4"></div>
              </div>
            ))}
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No pending approvals.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{approval.description}</p>
                    <p className="text-xs text-muted-foreground">by User {approval.requesterId.slice(-6)}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatAmount(approval.estimatedAmount)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                    Approve
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
