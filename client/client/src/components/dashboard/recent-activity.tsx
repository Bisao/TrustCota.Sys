import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Check, Building } from "lucide-react";
import { Activity } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

export default function RecentActivity() {
  const { t } = useLanguage();
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case 'requisition':
        return FileText;
      case 'supplier':
        return Building;
      default:
        return Check;
    }
  };

  const getActivityBadge = (action: string) => {
    const badgeConfig = {
      created: { variant: "secondary" as const, label: "Criado" },
      approved: { variant: "default" as const, label: "Aprovado" },
      rejected: { variant: "destructive" as const, label: "Rejeitado" },
      updated: { variant: "secondary" as const, label: "Atualizado" },
    };

    const config = badgeConfig[action as keyof typeof badgeConfig] || badgeConfig.created;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Agora mesmo";
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dias atrás`;
  };

  return (
    <div className="lg:col-span-2 bg-card rounded-lg border border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>Atividade Recente</CardTitle>
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm">
            Ver Todos
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma atividade recente
          </div>
        ) : (
          <div className="space-y-6">
            {activities.slice(0, 5).map((activity) => {
              const Icon = getActivityIcon(activity.entityType);
              return (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(activity.createdAt?.toString() || new Date().toISOString())}
                    </p>
                  </div>
                  {getActivityBadge(activity.action)}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </div>
  );
}