import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Requisitions from "@/pages/requisitions";
import Suppliers from "@/pages/suppliers";
import Quotes from "@/pages/quotes";
import PurchaseOrders from "@/pages/purchase-orders";
import ApprovalRules from "@/pages/approval-rules";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import FlowManagement from "@/pages/flow-management";
import AuditLogs from "@/pages/audit-logs";
import RfpManagement from "@/pages/rfp-management";
import QuoteComparison from "@/pages/quote-comparison";
import Negotiations from "@/pages/negotiations";
import Inventory from "@/pages/inventory";
import Contracts from "@/pages/contracts";
import SpendAnalysis from "@/pages/spend-analysis";
import Receipts from "@/pages/receipts";
import SupplierQualifications from "@/pages/supplier-qualifications";
import Integrations from "@/pages/integrations";
import AIInsights from "@/pages/ai-insights";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/requisitions" component={Requisitions} />
      <ProtectedRoute path="/suppliers" component={Suppliers} />
      <ProtectedRoute path="/quotes" component={Quotes} />
      <ProtectedRoute path="/rfp-management" component={RfpManagement} />
      <ProtectedRoute path="/quote-comparison" component={QuoteComparison} />
      <ProtectedRoute path="/negotiations" component={Negotiations} />
      <ProtectedRoute path="/purchase-orders" component={PurchaseOrders} />
      <ProtectedRoute path="/inventory" component={Inventory} />
      <ProtectedRoute path="/contracts" component={Contracts} />
      <ProtectedRoute path="/spend-analysis" component={SpendAnalysis} />
      <ProtectedRoute path="/receipts" component={Receipts} />
      <ProtectedRoute path="/supplier-qualifications" component={SupplierQualifications} />
      <ProtectedRoute path="/approval-rules" component={ApprovalRules} />
      <ProtectedRoute path="/flow-management" component={FlowManagement} />
      <ProtectedRoute path="/audit-logs" component={AuditLogs} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/ai-insights" component={AIInsights} />
      <ProtectedRoute path="/integrations" component={Integrations} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
