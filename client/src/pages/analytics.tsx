import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Clock,
  Users,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

// Mock data for analytics (in a real app, this would come from the API)
const monthlySpending = [
  { month: "Jan", amount: 45000 },
  { month: "Feb", amount: 52000 },
  { month: "Mar", amount: 48000 },
  { month: "Apr", amount: 61000 },
  { month: "May", amount: 55000 },
  { month: "Jun", amount: 67000 },
];

const categorySpending = [
  { name: "Equipamentos TI", value: 125000, color: "#0088FE" },
  { name: "Material de Escritório", value: 45000, color: "#00C49F" },
  { name: "Marketing", value: 78000, color: "#FFBB28" },
  { name: "Consultoria", value: 32000, color: "#FF8042" },
];

const supplierPerformance = [
  { name: "TechCorp Inc", rating: 4.8, orders: 24, onTime: 95 },
  { name: "Office Solutions", rating: 4.5, orders: 18, onTime: 88 },
  { name: "Marketing Pro", rating: 4.7, orders: 12, onTime: 92 },
  { name: "Consulting Experts", rating: 4.3, orders: 8, onTime: 85 },
];

const processTime = [
  { week: "Semana 1", avgDays: 3.2 },
  { week: "Semana 2", avgDays: 2.8 },
  { week: "Semana 3", avgDays: 3.5 },
  { week: "Semana 4", avgDays: 2.9 },
];

export default function Analytics() {
  const { t } = useLanguage();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gasto Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(348000)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5% vs mês anterior
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Economia Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(52000)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.3% este mês
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pedidos Ativos</p>
                  <p className="text-2xl font-bold">147</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    32 este mês
                  </p>
                </div>
                <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold">3.1 dias</p>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    +0.3 dias vs meta
                  </p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos Mensais</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Valor']} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Spending Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySpending}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Valor']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Process Time Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tempo de Processamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} dias`, 'Tempo Médio']} />
                  <Line type="monotone" dataKey="avgDays" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Suppliers Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Top Fornecedores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {supplierPerformance.map((supplier, index) => (
                <div key={supplier.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{supplier.name}</span>
                    <Badge variant="secondary">{supplier.rating}★</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Pontualidade</span>
                      <span>{supplier.onTime}%</span>
                    </div>
                    <Progress value={supplier.onTime} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground">{supplier.orders} pedidos</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}