import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, DollarSign, Clock, Building } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface DashboardStats {
  pendingRequisitions: number;
  totalSavings: string;
  avgProcessingTime: number;
  activeSuppliers: number;
  totalSuppliers: number;
}

interface KPICardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export default function KPICards({ stats, isLoading }: KPICardsProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(parseFloat(amount));
  };

  const kpiData = [
    {
      title: t('pendingRequisitions'),
      value: stats?.pendingRequisitions ?? 0,
      icon: FileText,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      change: "+12%",
      changeColor: "text-green-600"
    },
    {
      title: `${t('costSavings')} (${t('ytd')})`,
      value: formatCurrency(stats?.totalSavings || "0"),
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      change: "+8%",
      changeColor: "text-green-600"
    },
    {
      title: t('avgProcessingDays'),
      value: stats?.avgProcessingTime || 0,
      icon: Clock,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      change: "-5%",
      changeColor: "text-red-600"
    },
    {
      title: t('activeSuppliers'),
      value: stats?.activeSuppliers ?? 0,
      icon: Building,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      change: "+3",
      changeColor: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${kpi.iconColor} w-6 h-6`} />
                </div>
                <span className={`${kpi.changeColor} text-sm`}>{kpi.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">{kpi.value}</h3>
              <p className="text-muted-foreground text-sm">{kpi.title}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}