import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ApprovalRule } from "@shared/schema";
import ApprovalRuleForm from "@/components/approval/approval-rule-form";
import { useLanguage } from "@/hooks/use-language";

export default function ApprovalRules() {
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const { toast } = useToast();

  const { data: rules = [], isLoading } = useQuery<ApprovalRule[]>({
    queryKey: ["/api/approval-rules"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/approval-rules/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/approval-rules"] });
      toast({
        title: "Sucesso",
        description: "Regra de aprovação deletada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao deletar regra de aprovação.",
        variant: "destructive",
      });
    },
  });

  const formatAmount = (amount: string | null) => {
    if (!amount) return "Sem limite";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(amount));
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      user: { variant: "secondary" as const, label: "Usuário" },
      approver: { variant: "default" as const, label: "Aprovador" },
      admin: { variant: "destructive" as const, label: "Administrador" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta regra de aprovação?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Regra de Aprovação</DialogTitle>
            </DialogHeader>
            <ApprovalRuleForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regras de Aprovação Configuradas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">{t('loading')}</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma regra de aprovação configurada. Crie regras para automatizar fluxos de aprovação.
            </div>
          ) : (
            <div className="grid gap-4">
              {rules.map((rule) => (
                <Card key={rule.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-lg">{rule.name}</h3>
                          {getRoleBadge(rule.approverRole || 'user')}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Valor Mínimo:</strong> {formatAmount(rule.minAmount)}</p>
                          <p><strong>Valor Máximo:</strong> {formatAmount(rule.maxAmount)}</p>
                          <p><strong>Categoria:</strong> {rule.category || "Todas"}</p>
                          <p><strong>Aprovador:</strong> {"Baseado na função: " + (rule.approverRole || "approver")}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={editingRule?.id === rule.id} onOpenChange={(open) => !open && setEditingRule(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingRule(rule)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Editar Regra de Aprovação</DialogTitle>
                            </DialogHeader>
                            <ApprovalRuleForm 
                              rule={editingRule || undefined}
                              onSuccess={() => setEditingRule(null)}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(rule.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
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