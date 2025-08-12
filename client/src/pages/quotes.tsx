import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, Equal } from "lucide-react";
import QuoteComparison from "@/components/quotes/quote-comparison";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Quote } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

export default function Quotes() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: t('pending') },
      accepted: { variant: "default" as const, label: t('approved') },
      rejected: { variant: "destructive" as const, label: t('rejected') },
      expired: { variant: "secondary" as const, label: "Expirado" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Equal className="w-4 h-4 mr-2" />
              Comparar Cotações
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Comparação de Cotações</DialogTitle>
            </DialogHeader>
            <QuoteComparison />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Cotações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">{t('loading')}</div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma cotação encontrada. Solicite cotações aos fornecedores.
            </div>
          ) : (
            <div className="grid gap-4">
              {quotes.map((quote) => (
                <Card key={quote.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-lg">Cotação #{quote.id.slice(-6)}</h3>
                          {getStatusBadge(quote.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>{t('supplier')}:</strong> {quote.supplierId}</p>
                          <p><strong>Valor Total:</strong> {formatAmount(quote.totalAmount)}</p>
                          <p><strong>Válida até:</strong> {formatDate(quote.validUntil)}</p>
                          <p><strong>{t('created')}:</strong> {formatDate(quote.createdAt?.toString() || null)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedQuote(quote);
                            setIsViewDialogOpen(true);
                          }}
                          data-testid={`button-view-quote-${quote.id}`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {t('view')}
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