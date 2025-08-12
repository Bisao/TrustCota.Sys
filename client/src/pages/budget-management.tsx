import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Plus, Eye, Calendar } from "lucide-react";

export default function BudgetManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState("2025");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const { data: budgetAnalysis = {}, isLoading } = useQuery({
    queryKey: ["/api/analytics/budget-analysis", selectedPeriod, selectedDepartment],
  });

  const { data: costCenters = [] } = useQuery({
    queryKey: ["/api/cost-centers"],
  });

  const mockBudgets = [
    {
      id: "1",
      department: "IT",
      allocated: 500000,
      spent: 325000,
      remaining: 175000,
      utilization: 65,
      status: "on-track"
    },
    {
      id: "2", 
      department: "Marketing",
      allocated: 200000,
      spent: 185000,
      remaining: 15000,
      utilization: 92.5,
      status: "high-utilization"
    },
    {
      id: "3",
      department: "Operations",
      allocated: 750000,
      spent: 450000,
      remaining: 300000,
      utilization: 60,
      status: "on-track"
    },
    {
      id: "4",
      department: "HR",
      allocated: 150000,
      spent: 155000,
      remaining: -5000,
      utilization: 103.3,
      status: "over-budget"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'high-utilization':
        return 'bg-yellow-100 text-yellow-800';
      case 'over-budget':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-muted-foreground">Monitor and manage departmental budgets</p>
        </div>
        <Button data-testid="button-create-budget">
          <Plus className="w-4 h-4 mr-2" />
          New Budget
        </Button>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.6M</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.115M</div>
            <p className="text-xs text-muted-foreground">69.7% utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$485K</div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1</div>
            <p className="text-xs text-muted-foreground">Department requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger data-testid="select-period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="q4-2024">Q4 2024</SelectItem>
                  <SelectItem value="q3-2024">Q3 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger data-testid="select-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setSelectedPeriod("2025"); setSelectedDepartment("all"); }}>
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Department Budgets</h2>
        {mockBudgets.map((budget) => (
          <Card key={budget.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold">{budget.department}</h3>
                  <Badge className={getStatusColor(budget.status)}>
                    {budget.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Allocated</p>
                  <p className="text-xl font-bold">{formatCurrency(budget.allocated)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="text-xl font-bold">{formatCurrency(budget.spent)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`text-xl font-bold ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(budget.remaining)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilization</p>
                  <p className="text-xl font-bold">{budget.utilization.toFixed(1)}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget Utilization</span>
                  <span>{budget.utilization.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={Math.min(budget.utilization, 100)} 
                  className={`h-2 ${budget.utilization > 100 ? 'bg-red-100' : ''}`}
                />
                {budget.utilization > 90 && (
                  <p className="text-sm text-orange-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {budget.utilization > 100 ? 'Over budget' : 'High utilization'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {mockBudgets.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Budgets Found</h3>
            <p className="text-muted-foreground">
              No budgets match your current filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}