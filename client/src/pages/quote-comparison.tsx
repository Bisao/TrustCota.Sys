import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calculator, Trophy, TrendingUp, BarChart3, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const comparisonFormSchema = z.object({
  requisitionId: z.string().min(1, "Requisition is required"),
  comparisonName: z.string().min(1, "Comparison name is required"),
  quoteIds: z.array(z.string()).min(2, "At least 2 quotes are required"),
  criteria: z.array(z.string()).min(1, "At least one criterion is required"),
  weights: z.array(z.string()).min(1, "Weights are required")
});

type ComparisonFormValues = z.infer<typeof comparisonFormSchema>;

export default function QuoteComparison() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<any>(null);
  const [scoresDialogOpen, setScoresDialogOpen] = useState(false);
  const [calculatedScores, setCalculatedScores] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { data: comparisons = [], isLoading: loadingComparisons } = useQuery({
    queryKey: ["/api/quote-comparisons"],
  });

  const { data: requisitions = [] } = useQuery({
    queryKey: ["/api/requisitions"],
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ["/api/quotes"],
  });

  const createComparisonMutation = useMutation({
    mutationFn: async (data: ComparisonFormValues) => {
      const response = await fetch("/api/quote-comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Quote comparison created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/quote-comparisons"] });
      setCreateOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create quote comparison", variant: "destructive" });
    }
  });

  const calculateScoresMutation = useMutation({
    mutationFn: async (comparisonId: string) => {
      const response = await fetch(`/api/quote-comparisons/${comparisonId}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      return response.json();
    },
    onSuccess: (scores) => {
      toast({ title: "Quote scores calculated successfully" });
      setCalculatedScores(scores);
      setScoresDialogOpen(true);
      queryClient.invalidateQueries({ queryKey: ["/api/quote-comparisons"] });
    },
    onError: () => {
      toast({ title: "Failed to calculate quote scores", variant: "destructive" });
    }
  });

  const form = useForm<ComparisonFormValues>({
    resolver: zodResolver(comparisonFormSchema),
    defaultValues: {
      comparisonName: "",
      quoteIds: [],
      criteria: ["price", "delivery", "quality"],
      weights: ["0.5", "0.3", "0.2"]
    }
  });

  const onSubmit = (data: ComparisonFormValues) => {
    createComparisonMutation.mutate(data);
  };

  const handleCalculateScores = (comparisonId: string) => {
    calculateScoresMutation.mutate(comparisonId);
  };

  const getQuoteById = (quoteId: string) => {
    return quotes.find((q: any) => q.id === quoteId);
  };

  const getSupplierName = (quote: any) => {
    // This would need to be enhanced to fetch supplier details
    return `Supplier ${quote?.supplierId?.slice(-4)}`;
  };

  if (loadingComparisons) {
    return <div className="flex items-center justify-center h-64">Loading quote comparisons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quote Comparison</h1>
          <p className="text-muted-foreground">
            Compare and analyze supplier quotes side by side
          </p>
        </div>
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Comparison
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Quote Comparison</DialogTitle>
              <DialogDescription>
                Set up a new comparison to analyze multiple quotes
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="requisitionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requisition</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select requisition" />
                          </SelectTrigger>
                          <SelectContent>
                            {requisitions.map((req: any) => (
                              <SelectItem key={req.id} value={req.id}>
                                {req.requisitionNumber} - {req.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comparisonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comparison Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter comparison name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quoteIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Quotes to Compare</FormLabel>
                      <FormControl>
                        <div className="max-h-48 overflow-y-auto space-y-2 border rounded p-2">
                          {quotes.map((quote: any) => (
                            <div key={quote.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={quote.id}
                                checked={field.value.includes(quote.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, quote.id]);
                                  } else {
                                    field.onChange(field.value.filter((id: string) => id !== quote.id));
                                  }
                                }}
                              />
                              <Label htmlFor={quote.id} className="flex-1">
                                <div>
                                  <div className="font-medium">{quote.quoteNumber}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ${parseFloat(quote.totalAmount).toLocaleString()} • {getSupplierName(quote)}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Price Weight</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="1"
                      value={form.watch("weights.0")}
                      onChange={(e) => {
                        const weights = form.getValues("weights");
                        weights[0] = e.target.value;
                        form.setValue("weights", weights);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Delivery Weight</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="1"
                      value={form.watch("weights.1")}
                      onChange={(e) => {
                        const weights = form.getValues("weights");
                        weights[1] = e.target.value;
                        form.setValue("weights", weights);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Quality Weight</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="1"
                      value={form.watch("weights.2")}
                      onChange={(e) => {
                        const weights = form.getValues("weights");
                        weights[2] = e.target.value;
                        form.setValue("weights", weights);
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createComparisonMutation.isPending}>
                    {createComparisonMutation.isPending ? "Creating..." : "Create Comparison"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Comparisons Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {comparisons.map((comparison: any) => (
          <Card key={comparison.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{comparison.comparisonName}</CardTitle>
                  <CardDescription>
                    {comparison.quoteIds?.length || 0} quotes compared
                  </CardDescription>
                </div>
                {comparison.recommendedQuoteId && (
                  <Badge variant="default">
                    <Trophy className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quotes Analyzed:</span>
                  <span className="font-medium">{comparison.quoteIds?.length || 0}</span>
                </div>
                
                {comparison.scores && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Best Score</div>
                    <div className="text-lg font-bold text-green-600">
                      {Math.max(...JSON.parse(comparison.scores).map((s: any) => s.totalScore)).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCalculateScores(comparison.id)}
                  disabled={calculateScoresMutation.isPending}
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  {calculateScoresMutation.isPending ? "Calculating..." : "Calculate"}
                </Button>
                
                <Button size="sm" variant="ghost">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scores Dialog */}
      <Dialog open={scoresDialogOpen} onOpenChange={setScoresDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Quote Comparison Results</DialogTitle>
            <DialogDescription>
              Detailed scoring analysis for all compared quotes
            </DialogDescription>
          </DialogHeader>
          
          {calculatedScores && (
            <div className="space-y-6">
              {calculatedScores.map((score: any, index: number) => {
                const quote = getQuoteById(score.quoteId);
                const isRecommended = index === 0; // Assuming sorted by score
                
                return (
                  <Card key={score.quoteId} className={isRecommended ? "border-green-500 bg-green-50" : ""}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{quote?.quoteNumber}</span>
                            {isRecommended && (
                              <Badge variant="default">
                                <Trophy className="h-3 w-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {getSupplierName(quote)} • ${parseFloat(quote?.totalAmount || "0").toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {score.totalScore}%
                          </div>
                          <div className="text-sm text-muted-foreground">Overall Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Price Score</span>
                            <span className="font-medium">{score.breakdown.price.toFixed(1)}%</span>
                          </div>
                          <Progress value={score.breakdown.price} />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Delivery Score</span>
                            <span className="font-medium">{score.breakdown.delivery.toFixed(1)}%</span>
                          </div>
                          <Progress value={score.breakdown.delivery} />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Quality Score</span>
                            <span className="font-medium">{score.breakdown.quality.toFixed(1)}%</span>
                          </div>
                          <Progress value={score.breakdown.quality} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}