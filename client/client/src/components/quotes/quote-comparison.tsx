import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Quote {
  id: string;
  quoteNumber: string;
  supplierId: string;
  supplierName?: string;
  totalAmount: string;
  deliveryTime: number;
  validUntil: string | null;
  status: string;
  terms: string | null;
  rating?: string;
}

interface QuoteComparisonProps {
  requisitionId?: string;
}

export default function QuoteComparison({ requisitionId }: QuoteComparisonProps) {
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  
  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: requisitionId ? ["/api/quotes/requisition", requisitionId] : ["/api/quotes"],
  });

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleQuoteSelection = (quoteId: string) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId].slice(-3) // Max 3 quotes for comparison
    );
  };

  const selectedQuoteData = quotes.filter(q => selectedQuotes.includes(q.id));
  const bestPrice = Math.min(...selectedQuoteData.map(q => parseFloat(q.totalAmount)));
  const fastestDelivery = Math.min(...selectedQuoteData.map(q => q.deliveryTime));

  if (isLoading) {
    return (
      <div className="text-center py-8">
        Loading quotes for comparison...
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No quotes available for comparison.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quote Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Select Quotes to Compare (Max 3)</h3>
          <Badge variant="outline">{selectedQuotes.length}/3 selected</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotes.map((quote) => (
            <Card 
              key={quote.id} 
              className={`cursor-pointer transition-all ${
                selectedQuotes.includes(quote.id) 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => toggleQuoteSelection(quote.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{quote.quoteNumber}</CardTitle>
                  {selectedQuotes.includes(quote.id) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {quote.supplierName || 'Unknown Supplier'}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-semibold">{formatAmount(quote.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Delivery:</span>
                    <span className="text-sm">{quote.deliveryTime} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Valid Until:</span>
                    <span className="text-sm">{formatDate(quote.validUntil)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedQuotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quote Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Criteria</th>
                    {selectedQuoteData.map((quote) => (
                      <th key={quote.id} className="text-center py-3 px-4 min-w-[150px]">
                        {quote.quoteNumber}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Supplier</td>
                    {selectedQuoteData.map((quote) => (
                      <td key={quote.id} className="text-center py-3 px-4">
                        {quote.supplierName || 'Unknown'}
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Price</td>
                    {selectedQuoteData.map((quote) => (
                      <td key={quote.id} className="text-center py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <span className={parseFloat(quote.totalAmount) === bestPrice ? 'text-green-600 font-semibold' : ''}>
                            {formatAmount(quote.totalAmount)}
                          </span>
                          {parseFloat(quote.totalAmount) === bestPrice && (
                            <Badge variant="default" className="bg-green-100 text-green-800">Best</Badge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Delivery Time</td>
                    {selectedQuoteData.map((quote) => (
                      <td key={quote.id} className="text-center py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <span className={quote.deliveryTime === fastestDelivery ? 'text-green-600 font-semibold' : ''}>
                            {quote.deliveryTime} days
                          </span>
                          {quote.deliveryTime === fastestDelivery && (
                            <Badge variant="default" className="bg-green-100 text-green-800">Fastest</Badge>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Valid Until</td>
                    {selectedQuoteData.map((quote) => (
                      <td key={quote.id} className="text-center py-3 px-4">
                        {formatDate(quote.validUntil)}
                      </td>
                    ))}
                  </tr>
                  
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Terms</td>
                    {selectedQuoteData.map((quote) => (
                      <td key={quote.id} className="text-center py-3 px-4 text-sm">
                        {quote.terms || 'N/A'}
                      </td>
                    ))}
                  </tr>
                  
                  <tr>
                    <td className="py-3 px-4 font-medium">Actions</td>
                    {selectedQuoteData.map((quote) => (
                      <td key={quote.id} className="text-center py-3 px-4">
                        <div className="space-y-2">
                          <Button size="sm" className="w-full">
                            Accept Quote
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            Create PO
                          </Button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedQuotes.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            Select quotes above to compare them side by side.
          </CardContent>
        </Card>
      )}
    </div>
  );
}