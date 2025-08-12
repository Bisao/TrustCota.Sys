import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import RequisitionForm from "@/components/requisitions/requisition-form";
import { Requisition } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

export default function Requisitions() {
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: requisitions = [], isLoading } = useQuery<Requisition[]>({
    queryKey: ["/api/requisitions"],
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: t('pending') + " Aprovação" },
      approved: { variant: "default" as const, label: t('approved') },
      rejected: { variant: "destructive" as const, label: t('rejected') },
      in_progress: { variant: "secondary" as const, label: "Em Progresso" },
      completed: { variant: "default" as const, label: t('completed') },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Requisição
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Requisição</DialogTitle>
            </DialogHeader>
            <RequisitionForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Requisições</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">{t('loading')}</div>
          ) : requisitions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma requisição encontrada. Crie sua primeira requisição.
            </div>
          ) : (
            <div className="grid gap-4">
              {requisitions.map((requisition) => (
                <Card key={requisition.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-lg">{requisition.description}</h3>
                          {getStatusBadge(requisition.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Valor Total:</strong> {formatAmount(requisition.estimatedCost)}</p>
                          <p><strong>Departamento:</strong> {requisition.department}</p>
                          <p><strong>Prioridade:</strong> {requisition.priority}</p>
                          <p><strong>{t('created')}:</strong> {formatDate(requisition.createdAt?.toString() || new Date().toISOString())}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          {t('view')}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          {t('edit')}
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