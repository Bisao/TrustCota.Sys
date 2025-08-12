import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Mail, MessageCircle, TrendingUp, Clock, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const negotiationFormSchema = z.object({
  quoteId: z.string().min(1, "Quote is required"),
  round: z.number().min(1, "Round number is required"),
  proposedChanges: z.string().min(1, "Proposed changes are required"),
  currentTerms: z.string().min(1, "Current terms are required"),
  notes: z.string().optional()
});

type NegotiationFormValues = z.infer<typeof negotiationFormSchema>;

export default function Negotiations() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [negotiationHistory, setNegotiationHistory] = useState<any[]>([]);
  
  const queryClient = useQueryClient();

  const { data: negotiations = [], isLoading: loadingNegotiations } = useQuery({
    queryKey: ["/api/negotiations"],
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ["/api/quotes"],
  });

  const createNegotiationMutation = useMutation({
    mutationFn: async (data: NegotiationFormValues) => {
      const response = await fetch("/api/negotiations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          proposedChanges: JSON.stringify({ description: data.proposedChanges }),
          currentTerms: JSON.stringify({ terms: data.currentTerms })
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Negotiation started successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/negotiations"] });
      setCreateOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to start negotiation", variant: "destructive" });
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (negotiationId: string) => {
      const response = await fetch(`/api/negotiations/${negotiationId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Negotiation email sent successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/negotiations"] });
    },
    onError: () => {
      toast({ title: "Failed to send negotiation email", variant: "destructive" });
    }
  });

  const form = useForm<NegotiationFormValues>({
    resolver: zodResolver(negotiationFormSchema),
    defaultValues: {
      round: 1,
      proposedChanges: "",
      currentTerms: "",
      notes: ""
    }
  });

  const onSubmit = (data: NegotiationFormValues) => {
    createNegotiationMutation.mutate(data);
  };

  const handleSendEmail = (negotiationId: string) => {
    sendEmailMutation.mutate(negotiationId);
  };

  const handleViewHistory = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/negotiations/quote/${quoteId}`, {
        credentials: 'include'
      });
      const history = await response.json();
      setNegotiationHistory(history);
      setHistoryDialogOpen(true);
    } catch (error) {
      toast({ title: "Failed to load negotiation history", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      accepted: "default",
      rejected: "destructive",
      countered: "outline"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>;
  };

  const getQuoteByNegotiation = (negotiation: any) => {
    return quotes.find((q: any) => q.id === negotiation.quoteId);
  };

  const getSupplierName = (quote: any) => {
    return `Supplier ${quote?.supplierId?.slice(-4)}`;
  };

  if (loadingNegotiations) {
    return <div className="flex items-center justify-center h-64">Loading negotiations...</div>;
  }

  // Group negotiations by quote
  const negotiationsByQuote = negotiations.reduce((acc: any, neg: any) => {
    if (!acc[neg.quoteId]) {
      acc[neg.quoteId] = [];
    }
    acc[neg.quoteId].push(neg);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Negotiations</h1>
          <p className="text-muted-foreground">
            Manage supplier negotiations and track progress
          </p>
        </div>
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Start Negotiation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start New Negotiation</DialogTitle>
              <DialogDescription>
                Initiate a negotiation with a supplier for better terms
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="quoteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quote</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quote to negotiate" />
                          </SelectTrigger>
                          <SelectContent>
                            {quotes.map((quote: any) => (
                              <SelectItem key={quote.id} value={quote.id}>
                                {quote.quoteNumber} - ${parseFloat(quote.totalAmount).toLocaleString()}
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
                  name="round"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negotiation Round</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proposedChanges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposed Changes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what changes you're requesting (price reduction, better terms, etc.)"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Terms</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Outline the current terms of the quote"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any internal notes about this negotiation"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createNegotiationMutation.isPending}>
                    {createNegotiationMutation.isPending ? "Starting..." : "Start Negotiation"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Negotiations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Negotiations</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(negotiationsByQuote).map(([quoteId, quoteNegotiations]: [string, any]) => {
            const quote = quotes.find((q: any) => q.id === quoteId);
            const latestNegotiation = quoteNegotiations[quoteNegotiations.length - 1];
            const totalRounds = quoteNegotiations.length;
            
            return (
              <Card key={quoteId} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{quote?.quoteNumber}</CardTitle>
                      <CardDescription>
                        {getSupplierName(quote)} • Round {latestNegotiation.round}
                      </CardDescription>
                    </div>
                    {getStatusBadge(latestNegotiation.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${parseFloat(quote?.totalAmount || "0").toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{totalRounds} rounds</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(latestNegotiation.createdAt), "MMM dd")}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className={latestNegotiation.emailSent ? "text-green-600" : "text-orange-600"}>
                        {latestNegotiation.emailSent ? "Sent" : "Pending"}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex space-x-2">
                    {!latestNegotiation.emailSent && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendEmail(latestNegotiation.id)}
                        disabled={sendEmailMutation.isPending}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Send Email
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleViewHistory(quoteId)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      View History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Negotiation History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Negotiation History</DialogTitle>
            <DialogDescription>
              Complete timeline of negotiation rounds and responses
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              {negotiationHistory.map((negotiation, index) => (
                <Card key={negotiation.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Round {negotiation.round}</CardTitle>
                        <CardDescription>
                          {format(new Date(negotiation.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        {getStatusBadge(negotiation.status)}
                        {negotiation.emailSent && (
                          <Badge variant="outline">
                            <Mail className="h-3 w-3 mr-1" />
                            Email Sent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Proposed Changes:</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {JSON.parse(negotiation.proposedChanges || "{}").description}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Current Terms:</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {JSON.parse(negotiation.currentTerms || "{}").terms}
                      </p>
                    </div>
                    
                    {negotiation.supplierResponse && (
                      <div>
                        <Label className="text-sm font-medium">Supplier Response:</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {negotiation.supplierResponse}
                        </p>
                        {negotiation.responseDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Responded on {format(new Date(negotiation.responseDate), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {negotiation.notes && (
                      <div>
                        <Label className="text-sm font-medium">Internal Notes:</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {negotiation.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}