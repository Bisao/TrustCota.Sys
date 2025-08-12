import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Star } from "lucide-react";
import { Supplier } from "@shared/schema";

export default function SupplierPerformance() {
  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const topSuppliers = suppliers
    .sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"))
    .slice(0, 3);

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;
    
    return (
      <div className="flex text-yellow-500">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < fullStars ? 'fill-current' : 
              i === fullStars && hasHalfStar ? 'fill-current opacity-50' : 
              'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>Top Suppliers</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : topSuppliers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No suppliers found.
          </div>
        ) : (
          <div className="space-y-4">
            {topSuppliers.map((supplier) => (
              <div key={supplier.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{supplier.name}</p>
                    <p className="text-xs text-muted-foreground">{supplier.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-semibold text-foreground">
                      {parseFloat(supplier.rating || "0").toFixed(1)}
                    </div>
                    {renderStars(supplier.rating || "0")}
                  </div>
                  <p className="text-xs text-muted-foreground">{supplier.totalOrders} orders</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
