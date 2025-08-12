import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SpendAnalysis() {
  const spendData = [
    { category: "IT Equipment", amount: 125000, percentage: 42, color: "bg-primary" },
    { category: "Office Supplies", amount: 75000, percentage: 25, color: "bg-green-500" },
    { category: "Marketing", amount: 60000, percentage: 20, color: "bg-yellow-500" },
    { category: "Other", amount: 40000, percentage: 13, color: "bg-red-500" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>Spend Analysis</CardTitle>
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {spendData.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                  <span className="text-sm text-muted-foreground">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">
                    {formatCurrency(item.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`${item.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
