import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Plus } from "lucide-react";
import CreatePOButton from "@/components/purchase-orders/po-dialog";
import { PurchaseOrder } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

export default function PurchaseOrders() {
  const { t } = useLanguage();
  const { data: purchaseOrders = [], isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: t('pending') },
      sent: { variant: "secondary" as const, label: t('sent') },
      confirmed: { variant: "default" as const, label: t('confirmed') },
      delivered: { variant: "default" as const, label: t('delivered') },
      completed: { variant: "default" as const, label: t('completed') },
      cancelled: { variant: "destructive" as const, label: t('cancelled') },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <CreatePOButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('allPurchaseOrders')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">{t('loading')}</div>
          ) : purchaseOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('noPurchaseOrdersFound')}
            </div>
          ) : (
            <div className="grid gap-4">
              {purchaseOrders.map((po) => (
                <Card key={po.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-lg">PO #{po.poNumber}</h3>
                          {getStatusBadge(po.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>{t('supplier')}:</strong> {po.supplierId}</p>
                          <p><strong>{t('amount')}:</strong> {formatAmount(po.totalAmount)}</p>
                          <p><strong>{t('dueDate')}:</strong> {formatDate(po.expectedDelivery?.toString() || null)}</p>
                          <p><strong>{t('created')}:</strong> {formatDate(po.createdAt?.toString() || null)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          {t('view')}
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}