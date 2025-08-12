import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp, Shield, FileText, Eye, Search, Filter } from "lucide-react";

export default function RiskManagement() {
  const [riskFilter, setRiskFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: riskAssessment = {}, isLoading } = useQuery({
    queryKey: ["/api/analytics/risk-assessment"],
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  const riskLevels = [
    { value: "all", label: "All Risk Levels" },
    { value: "low", label: "Low Risk" },
    { value: "medium", label: "Medium Risk" },
    { value: "high", label: "High Risk" },
    { value: "critical", label: "Critical Risk" }
  ];

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const mockRisks = [
    {
      id: "1",
      type: "Supplier Risk",
      description: "Single source dependency for critical components",
      level: "high",
      impact: "Supply disruption",
      mitigation: "Identify alternative suppliers",
      status: "active"
    },
    {
      id: "2",
      type: "Financial Risk",
      description: "Currency fluctuation exposure",
      level: "medium",
      impact: "Cost variations",
      mitigation: "Hedge currency exposure",
      status: "monitoring"
    },
    {
      id: "3",
      type: "Compliance Risk",
      description: "Regulatory changes in key markets",
      level: "critical",
      impact: "Legal compliance issues",
      mitigation: "Regular compliance audits",
      status: "active"
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Risk Management</h1>
          <p className="text-muted-foreground">Monitor and manage procurement risks</p>
        </div>
        <Button data-testid="button-create-assessment">
          <Shield className="w-4 h-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">5</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mitigated</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">18</div>
            <p className="text-xs text-muted-foreground">Successfully addressed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.2</div>
            <p className="text-xs text-muted-foreground">-0.5 from last quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Risk Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search risks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-risks"
              />
            </div>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger data-testid="select-risk-level">
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                {riskLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => { setSearchTerm(""); setRiskFilter("all"); }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Identified Risks</h2>
        {mockRisks.map((risk) => (
          <Card key={risk.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <Badge className={getRiskColor(risk.level)}>
                      {risk.level.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{risk.type}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{risk.description}</h3>
                    <p className="text-muted-foreground mt-1">
                      <strong>Impact:</strong> {risk.impact}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Mitigation:</strong> {risk.mitigation}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{risk.status}</Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {mockRisks.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Risks Found</h3>
            <p className="text-muted-foreground">
              No risks match your current filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}