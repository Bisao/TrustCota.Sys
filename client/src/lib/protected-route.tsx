import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import MainLayout from "@/components/layout/main-layout";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Get page title based on path
  const getPageInfo = (path: string) => {
    const pageMap: Record<string, { title: string; subtitle?: string }> = {
      "/": { title: "Dashboard", subtitle: "Bem-vindo ao TrustCota - Sistema de Compras Corporativas" },
      "/requisitions": { title: "Requisições", subtitle: "Gerencie solicitações de compras e aprovações" },
      "/suppliers": { title: "Fornecedores", subtitle: "Cadastro e gestão de fornecedores" },
      "/quotes": { title: "Cotações", subtitle: "Solicitações de cotação e propostas" },
      "/rfp-management": { title: "Gestão de RFP", subtitle: "Gerenciamento de solicitações de propostas" },
      "/quote-comparison": { title: "Comparação de Cotações", subtitle: "Compare propostas e tome decisões" },
      "/negotiations": { title: "Negociações", subtitle: "Gerencie negociações com fornecedores" },
      "/purchase-orders": { title: "Ordens de Compra", subtitle: "Acompanhe pedidos e entregas" },
      "/inventory": { title: "Estoque", subtitle: "Controle de inventário e movimentações" },
      "/contracts": { title: "Contratos", subtitle: "Gestão de contratos e renovações" },
      "/spend-analysis": { title: "Análise de Gastos", subtitle: "Insights e analytics de compras" },
      "/approval-rules": { title: "Regras de Aprovação", subtitle: "Configure fluxos de aprovação" },
      "/analytics": { title: "Analytics", subtitle: "Relatórios e métricas avançadas" },
      "/settings": { title: "Configurações", subtitle: "Preferências do sistema" }
    };
    return pageMap[path] || { title: "TrustCota" };
  };

  const pageInfo = getPageInfo(path);

  return (
    <Route path={path}>
      <MainLayout title={pageInfo.title} subtitle={pageInfo.subtitle}>
        <Component />
      </MainLayout>
    </Route>
  );
}
