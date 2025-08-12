import { useQuery } from "@tanstack/react-query";
import KPICards from "@/components/dashboard/kpi-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import PendingApprovals from "@/components/approval/pending-approvals";
import SpendAnalysis from "@/components/dashboard/spend-analysis";
import SupplierPerformance from "@/components/dashboard/supplier-performance";
import RecentRequisitions from "@/components/dashboard/recent-requisitions";
import { useLanguage } from "@/hooks/use-language";

export default function Dashboard() {
  const { t } = useLanguage();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  interface DashboardStats {
    pendingRequisitions: number;
    totalSavings: string;
    avgProcessingTime: number;
    activeSuppliers: number;
    totalSuppliers: number;
  }

  return (
    <div className="space-y-6">
      <KPICards stats={stats as DashboardStats} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity />
          <RecentRequisitions />
        </div>
        <div className="space-y-6">
          <PendingApprovals />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendAnalysis />
        <SupplierPerformance />
      </div>
    </div>
  );
}