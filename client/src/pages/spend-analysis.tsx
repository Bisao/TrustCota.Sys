import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, Download, Filter } from "lucide-react";
import { format } from "date-fns";

export default function SpendAnalysisPage() {
  const [dateRange, setDateRange] = useState("last30days");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const { data: requisitions = [] } = useQuery<any[]>({
    queryKey: ["/api/requisitions"],
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["/api/suppliers"],
  });

  // Calculate analytics
  const analytics = {
    totalSpend: requisitions
      .filter((req: any) => req.status === "approved")
      .reduce((sum: number, req: any) => sum + parseFloat(req.totalAmount || "0"), 0),
    
    avgOrderValue: requisitions.length > 0 
      ? requisitions.reduce((sum: number, req: any) => sum + parseFloat(req.totalAmount || "0"), 0) / requisitions.length
      : 0,
    
    topCategories: (() => {
      const categorySpend: Record<string, number> = {};
      requisitions.forEach((req: any) => {
        if (req.status === "approved") {
          categorySpend[req.category] = (categorySpend[req.category] || 0) + parseFloat(req.totalAmount || "0");
        }
      });
      return Object.entries(categorySpend)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    })(),
    
    topSuppliers: (() => {
      const supplierSpend: Record<string, { name: string; spend: number }> = {};
      requisitions.forEach((req: any) => {
        if (req.status === "approved") {
          const supplier = suppliers.find((s: any) => s.id === req.supplierId);
          if (supplier) {
            const key = supplier.id;
            if (!supplierSpend[key]) {
              supplierSpend[key] = { name: supplier.name, spend: 0 };
            }
            supplierSpend[key].spend += parseFloat(req.totalAmount || "0");
          }
        }
      });
      return Object.values(supplierSpend)
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 5);
    })(),
    
    monthlyTrend: (() => {
      const monthlyData: Record<string, number> = {};
      requisitions.forEach((req: any) => {
        if (req.status === "approved") {
          const month = format(new Date(req.createdAt), 'MMM yyyy');
          monthlyData[month] = (monthlyData[month] || 0) + parseFloat(req.totalAmount || "0");
        }
      });
      return Object.entries(monthlyData).slice(-6);
    })(),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Spend Analysis</h1>
          <p className="text-muted-foreground">
            Analyze spending patterns and identify cost optimization opportunities
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" data-testid="button-export-report">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" data-testid="button-filters">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger data-testid="select-date-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                  <SelectItem value="last90days">Last 90 days</SelectItem>
                  <SelectItem value="last12months">Last 12 months</SelectItem>
                  <SelectItem value="ytd">Year to date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger data-testid="select-category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="office-supplies">Office Supplies</SelectItem>
                  <SelectItem value="it-equipment">IT Equipment</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Supplier</label>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger data-testid="select-supplier-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card data-testid="card-total-spend">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.totalSpend)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-order">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.avgOrderValue)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-sm text-red-600">-5% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-orders">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{requisitions.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+8% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-suppliers">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Suppliers</p>
                <p className="text-2xl font-bold">{suppliers.length}</p>
              </div>
              <Badge className="h-8 w-8 rounded-full flex items-center justify-center">
                {suppliers.length}
              </Badge>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">No change</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card data-testid="card-top-categories">
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCategories.map(([category, amount], index) => (
                <div key={category} className="flex items-center justify-between" data-testid={`category-${index}`}>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {((amount / analytics.totalSpend) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Suppliers */}
        <Card data-testid="card-top-suppliers">
          <CardHeader>
            <CardTitle>Top Suppliers by Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topSuppliers.map((supplier, index) => (
                <div key={supplier.name} className="flex items-center justify-between" data-testid={`supplier-${index}`}>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{supplier.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(supplier.spend)}</p>
                    <p className="text-sm text-muted-foreground">
                      {((supplier.spend / analytics.totalSpend) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="lg:col-span-2" data-testid="card-monthly-trend">
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyTrend.map(([month, amount]) => (
                <div key={month} className="flex items-center justify-between" data-testid={`month-${month}`}>
                  <span className="font-medium">{month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${(amount / Math.max(...analytics.monthlyTrend.map(([,amt]) => amt))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="font-bold w-20 text-right">{formatCurrency(amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card data-testid="card-insights">
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Cost Optimization Opportunities</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">Consolidate IT Equipment Purchases</p>
                  <p className="text-sm text-blue-600">Potential savings: $2,500/month</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">Negotiate Better Terms with Top Suppliers</p>
                  <p className="text-sm text-green-600">Potential savings: $1,800/month</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">Review Office Supplies Budget</p>
                  <p className="text-sm text-yellow-600">20% over budget this quarter</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Performance Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Maverick Spend:</span>
                  <Badge variant="destructive">8.2%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Contract Compliance:</span>
                  <Badge variant="default">92%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Supplier Diversity:</span>
                  <Badge variant="secondary">67%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cost Avoidance:</span>
                  <Badge variant="default">$15,600</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}