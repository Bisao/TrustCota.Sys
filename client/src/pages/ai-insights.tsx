import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, TrendingUp, MessageSquare, Users, BarChart3, Loader2, FileText, Target, AlertTriangle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIProviderSelector } from "@/components/ai-provider-selector";
import { apiRequest } from "@/lib/queryClient";

export default function AIInsights() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [requisitionData, setRequisitionData] = useState({
    description: "",
    category: "",
    amount: ""
  });
  
  const [sentimentText, setSentimentText] = useState("");
  
  const [supplierData, setSupplierData] = useState({
    category: "",
    requirements: "",
    budget: ""
  });

  const [proposalData, setProposalData] = useState({
    proposalText: "",
    requirements: ""
  });

  const [classificationData, setClassificationData] = useState({
    title: "",
    description: ""
  });

  const [priceData, setPriceData] = useState({
    category: ""
  });

  const [counterProposalData, setCounterProposalData] = useState({
    originalProposal: "",
    negotiationGoals: ""
  });

  // Análise avançada de propostas
  const analyzeProposalMutation = useMutation({
    mutationFn: async (data: { proposalText: string; requirements: string[] }) => {
      const response = await apiRequest("/api/ai/analyze-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Análise de proposta concluída" });
    },
    onError: () => {
      toast({ title: "Erro na análise", variant: "destructive" });
    }
  });

  // Classificação automática de requisições
  const classifyRequisitionMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const response = await apiRequest("/api/ai/classify-requisition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Classificação automática concluída" });
    },
    onError: () => {
      toast({ title: "Erro na classificação", variant: "destructive" });
    }
  });

  // Análise preditiva de preços
  const predictPricesMutation = useMutation({
    mutationFn: async (data: { category: string; historicalData?: any[] }) => {
      const response = await apiRequest("/api/ai/predict-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Análise preditiva de preços concluída" });
    },
    onError: () => {
      toast({ title: "Erro na análise preditiva", variant: "destructive" });
    }
  });

  // Geração de contraproposta
  const generateCounterProposalMutation = useMutation({
    mutationFn: async (data: { originalProposal: string; negotiationGoals: string[] }) => {
      const response = await apiRequest("/api/ai/generate-counter-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Contraproposta gerada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao gerar contraproposta", variant: "destructive" });
    }
  });

  // Análise de requisição
  const analyzeRequisitionMutation = useMutation({
    mutationFn: async (data: { description: string; category: string; amount: number }) => {
      const response = await apiRequest("/api/ai/analyze-requisition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Análise de requisição concluída" });
    },
    onError: () => {
      toast({ title: "Erro na análise", variant: "destructive" });
    }
  });

  // Análise de sentimento
  const analyzeSentimentMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("/api/ai/analyze-sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Análise de sentimento concluída" });
    },
    onError: () => {
      toast({ title: "Erro na análise", variant: "destructive" });
    }
  });

  // Sugestões de fornecedores
  const suggestSuppliersMutation = useMutation({
    mutationFn: async (data: { category: string; requirements: string[]; budget: number }) => {
      const response = await apiRequest("/api/ai/suggest-suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sugestões de fornecedores geradas" });
    },
    onError: () => {
      toast({ title: "Erro nas sugestões", variant: "destructive" });
    }
  });

  // Dashboard metrics query
  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const response = await apiRequest("/api/dashboard");
      return response.json();
    }
  });

  // Executive summary
  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      if (!dashboardData) return null;
      
      const response = await apiRequest("/api/ai/executive-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_spend: dashboardData.totalSpend || 0,
          active_suppliers: dashboardData.activeSuppliers || 0,
          pending_requisitions: dashboardData.pendingRequisitions || 0,
          monthly_trend: dashboardData.monthlyTrend || "stable"
        })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Resumo executivo gerado" });
    }
  });

  const handleRequisitionAnalysis = () => {
    analyzeRequisitionMutation.mutate({
      description: requisitionData.description,
      category: requisitionData.category,
      amount: parseFloat(requisitionData.amount)
    });
  };

  const handleSentimentAnalysis = () => {
    analyzeSentimentMutation.mutate(sentimentText);
  };

  const handleSupplierSuggestions = () => {
    const requirements = supplierData.requirements.split(',').map(r => r.trim());
    suggestSuppliersMutation.mutate({
      category: supplierData.category,
      requirements,
      budget: parseFloat(supplierData.budget)
    });
  };

  const handleProposalAnalysis = () => {
    const requirements = proposalData.requirements.split(',').map(r => r.trim());
    analyzeProposalMutation.mutate({
      proposalText: proposalData.proposalText,
      requirements
    });
  };

  const handleClassification = () => {
    classifyRequisitionMutation.mutate({
      title: classificationData.title,
      description: classificationData.description
    });
  };

  const handlePricePrediction = () => {
    predictPricesMutation.mutate({
      category: priceData.category
    });
  };

  const handleCounterProposal = () => {
    const goals = counterProposalData.negotiationGoals.split(',').map(g => g.trim());
    generateCounterProposalMutation.mutate({
      originalProposal: counterProposalData.originalProposal,
      negotiationGoals: goals
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSentimentColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-500';
    if (rating >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="space-y-6">
        {/* AI Provider Configuration */}
        <AIProviderSelector />
        
        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Resumo Executivo com IA
            </CardTitle>
            <CardDescription>
              Gere insights automáticos sobre o desempenho do setor de compras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => generateSummaryMutation.mutate()}
              disabled={generateSummaryMutation.isPending || !dashboardData}
            >
              {generateSummaryMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
              ) : (
                <>Gerar Resumo Executivo</>
              )}
            </Button>

            {generateSummaryMutation.data?.summary && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm leading-relaxed">{generateSummaryMutation.data.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Análise de Requisição */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Análise Inteligente de Requisição
              </CardTitle>
              <CardDescription>
                Obtenha insights sobre prioridade, riscos e recomendações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o item ou serviço necessário..."
                  value={requisitionData.description}
                  onChange={(e) => setRequisitionData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  placeholder="Ex: Hardware, Software, Serviços..."
                  value={requisitionData.category}
                  onChange={(e) => setRequisitionData(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000.00"
                  value={requisitionData.amount}
                  onChange={(e) => setRequisitionData(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))}
                />
              </div>

              <Button
                onClick={handleRequisitionAnalysis}
                disabled={analyzeRequisitionMutation.isPending}
                className="w-full"
              >
                {analyzeRequisitionMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
                ) : (
                  <>Analisar Requisição</>
                )}
              </Button>

              {analyzeRequisitionMutation.data && (
                <div className="space-y-3 pt-2">
                  <Separator />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Prioridade:</span>
                    <Badge className={getPriorityColor(analyzeRequisitionMutation.data.priority)}>
                      {analyzeRequisitionMutation.data.priority.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Avaliação de Risco:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analyzeRequisitionMutation.data.risk_assessment}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Economia Estimada:</span>
                    <p className="text-sm text-green-600 font-medium">
                      {analyzeRequisitionMutation.data.estimated_savings}%
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Recomendações:</span>
                    <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside space-y-1">
                      {analyzeRequisitionMutation.data.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Análise de Sentimento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Análise de Sentimento
              </CardTitle>
              <CardDescription>
                Analise o tom de negociações e comunicações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sentiment-text">Texto da Comunicação</Label>
                <Textarea
                  id="sentiment-text"
                  placeholder="Cole aqui o e-mail ou mensagem para análise..."
                  value={sentimentText}
                  onChange={(e) => setSentimentText(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSentimentAnalysis}
                disabled={analyzeSentimentMutation.isPending}
                className="w-full"
              >
                {analyzeSentimentMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
                ) : (
                  <>Analisar Sentimento</>
                )}
              </Button>

              {analyzeSentimentMutation.data && (
                <div className="space-y-3 pt-2">
                  <Separator />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Score:</span>
                    <Badge className={getSentimentColor(analyzeSentimentMutation.data.rating)}>
                      {analyzeSentimentMutation.data.rating}/5
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      (Confiança: {Math.round(analyzeSentimentMutation.data.confidence * 100)}%)
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Insights:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analyzeSentimentMutation.data.insights}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sugestões de Fornecedores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Sugestões Inteligentes de Fornecedores
            </CardTitle>
            <CardDescription>
              Obtenha critérios e dicas de negociação personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="supplier-category">Categoria</Label>
                <Input
                  id="supplier-category"
                  placeholder="Ex: Hardware, Software..."
                  value={supplierData.category}
                  onChange={(e) => setSupplierData(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requisitos (separados por vírgula)</Label>
                <Input
                  id="requirements"
                  placeholder="Qualidade, Prazo, Suporte..."
                  value={supplierData.requirements}
                  onChange={(e) => setSupplierData(prev => ({
                    ...prev,
                    requirements: e.target.value
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="budget">Orçamento (R$)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="50000.00"
                  value={supplierData.budget}
                  onChange={(e) => setSupplierData(prev => ({
                    ...prev,
                    budget: e.target.value
                  }))}
                />
              </div>
            </div>

            <Button
              onClick={handleSupplierSuggestions}
              disabled={suggestSuppliersMutation.isPending}
            >
              {suggestSuppliersMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando Sugestões...</>
              ) : (
                <>Gerar Sugestões</>
              )}
            </Button>

            {suggestSuppliersMutation.data && (
              <div className="space-y-4 pt-2">
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="font-medium mb-2">Critérios de Seleção</h4>
                    <ul className="text-sm space-y-1">
                      {suggestSuppliersMutation.data.supplier_criteria.map((criteria: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Dicas de Negociação</h4>
                    <ul className="text-sm space-y-1">
                      {suggestSuppliersMutation.data.negotiation_tips.map((tip: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <MessageSquare className="w-3 h-3 text-blue-500" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Insights de Mercado</h4>
                    <p className="text-sm text-muted-foreground">
                      {suggestSuppliersMutation.data.market_insights}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Análise Avançada de Propostas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Análise Avançada de Propostas
            </CardTitle>
            <CardDescription>
              Extraia informações chave e identifique riscos em propostas de fornecedores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="proposal-text">Texto da Proposta</Label>
              <Textarea
                id="proposal-text"
                placeholder="Cole aqui o texto completo da proposta do fornecedor..."
                value={proposalData.proposalText}
                onChange={(e) => setProposalData(prev => ({
                  ...prev,
                  proposalText: e.target.value
                }))}
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="proposal-requirements">Requisitos Originais (separados por vírgula)</Label>
              <Textarea
                id="proposal-requirements"
                placeholder="Qualidade premium, Prazo 30 dias, Garantia 2 anos..."
                value={proposalData.requirements}
                onChange={(e) => setProposalData(prev => ({
                  ...prev,
                  requirements: e.target.value
                }))}
                rows={3}
              />
            </div>

            <Button
              onClick={handleProposalAnalysis}
              disabled={analyzeProposalMutation.isPending}
              className="w-full"
            >
              {analyzeProposalMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando Proposta...</>
              ) : (
                <>Analisar Proposta</>
              )}
            </Button>

            {analyzeProposalMutation.data && (
              <div className="space-y-4 pt-2">
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Informações Extraídas</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Preço:</span> {analyzeProposalMutation.data.extracted_info.price}</p>
                      <p><span className="font-medium">Prazo:</span> {analyzeProposalMutation.data.extracted_info.delivery_time}</p>
                      <p><span className="font-medium">Pagamento:</span> {analyzeProposalMutation.data.extracted_info.payment_terms}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Fatores de Risco</h4>
                    <ul className="text-sm space-y-1">
                      {analyzeProposalMutation.data.risk_factors.map((risk: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Análise de Conformidade</h4>
                  <p className="text-sm text-muted-foreground">
                    {analyzeProposalMutation.data.compliance_analysis}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Pontos para Negociação</h4>
                  <ul className="text-sm space-y-1">
                    {analyzeProposalMutation.data.negotiation_points.map((point: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-blue-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classificação Automática de Requisições */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Classificação Automática de Requisições
            </CardTitle>
            <CardDescription>
              Classifique automaticamente novas requisições por categoria e urgência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="req-title">Título da Requisição</Label>
                <Input
                  id="req-title"
                  placeholder="Ex: Notebooks para equipe de desenvolvimento"
                  value={classificationData.title}
                  onChange={(e) => setClassificationData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="req-description">Descrição</Label>
                <Input
                  id="req-description"
                  placeholder="Detalhes do que é necessário..."
                  value={classificationData.description}
                  onChange={(e) => setClassificationData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </div>
            </div>

            <Button
              onClick={handleClassification}
              disabled={classifyRequisitionMutation.isPending}
            >
              {classifyRequisitionMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Classificando...</>
              ) : (
                <>Classificar Requisição</>
              )}
            </Button>

            {classifyRequisitionMutation.data && (
              <div className="space-y-3 pt-2">
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <span className="text-sm font-medium">Categoria:</span>
                    <p className="text-sm font-medium text-primary">
                      {classifyRequisitionMutation.data.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {classifyRequisitionMutation.data.subcategory}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Urgência:</span>
                    <Badge className={getPriorityColor(classifyRequisitionMutation.data.urgency_level)}>
                      {classifyRequisitionMutation.data.urgency_level.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Fornecedores Sugeridos:</span>
                    <ul className="text-xs space-y-1">
                      {classifyRequisitionMutation.data.suggested_suppliers.map((supplier: string, index: number) => (
                        <li key={index}>• {supplier}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {classifyRequisitionMutation.data.missing_information.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Informações em Falta:</span>
                    <ul className="text-sm text-orange-600 space-y-1">
                      {classifyRequisitionMutation.data.missing_information.map((info: string, index: number) => (
                        <li key={index}>• {info}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Análise Preditiva de Preços */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Análise Preditiva de Preços
              </CardTitle>
              <CardDescription>
                Preveja tendências de preços e obtenha recomendações de compra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="price-category">Categoria para Análise</Label>
                <Input
                  id="price-category"
                  placeholder="Ex: Hardware, Software, Serviços..."
                  value={priceData.category}
                  onChange={(e) => setPriceData(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                />
              </div>

              <Button
                onClick={handlePricePrediction}
                disabled={predictPricesMutation.isPending}
                className="w-full"
              >
                {predictPricesMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
                ) : (
                  <>Analisar Tendências</>
                )}
              </Button>

              {predictPricesMutation.data && (
                <div className="space-y-3 pt-2">
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Recomendação</h4>
                    <Badge className={
                      predictPricesMutation.data.buying_recommendation === 'buy_now' ? 'bg-green-500' :
                      predictPricesMutation.data.buying_recommendation === 'wait' ? 'bg-red-500' : 'bg-yellow-500'
                    }>
                      {predictPricesMutation.data.buying_recommendation === 'buy_now' ? 'COMPRAR AGORA' :
                       predictPricesMutation.data.buying_recommendation === 'wait' ? 'AGUARDAR' : 'MONITORAR'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confiança: {predictPricesMutation.data.confidence_level}%
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Análise de Tendência</h4>
                    <p className="text-sm text-muted-foreground">
                      {predictPricesMutation.data.trend_analysis}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Fatores de Mercado</h4>
                    <ul className="text-sm space-y-1">
                      {predictPricesMutation.data.market_factors.map((factor: string, index: number) => (
                        <li key={index}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Geração de Contrapropostas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Geração de Contrapropostas
              </CardTitle>
              <CardDescription>
                Crie contrapropostas profissionais com base em objetivos de negociação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="original-proposal">Proposta Original</Label>
                <Textarea
                  id="original-proposal"
                  placeholder="Cole aqui a proposta original do fornecedor..."
                  value={counterProposalData.originalProposal}
                  onChange={(e) => setCounterProposalData(prev => ({
                    ...prev,
                    originalProposal: e.target.value
                  }))}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="negotiation-goals">Objetivos de Negociação (separados por vírgula)</Label>
                <Input
                  id="negotiation-goals"
                  placeholder="Redução de 10% no preço, Prazo estendido, Garantia adicional..."
                  value={counterProposalData.negotiationGoals}
                  onChange={(e) => setCounterProposalData(prev => ({
                    ...prev,
                    negotiationGoals: e.target.value
                  }))}
                />
              </div>

              <Button
                onClick={handleCounterProposal}
                disabled={generateCounterProposalMutation.isPending}
                className="w-full"
              >
                {generateCounterProposalMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
                ) : (
                  <>Gerar Contraproposta</>
                )}
              </Button>

              {generateCounterProposalMutation.data && (
                <div className="space-y-3 pt-2">
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Contraproposta Gerada</h4>
                    <div className="bg-muted p-3 rounded text-sm">
                      {generateCounterProposalMutation.data.counter_proposal_text}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Principais Mudanças</h4>
                    <ul className="text-sm space-y-1">
                      {generateCounterProposalMutation.data.key_changes.map((change: string, index: number) => (
                        <li key={index}>• {change}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Estratégia de Negociação</h4>
                    <p className="text-sm text-muted-foreground">
                      {generateCounterProposalMutation.data.negotiation_strategy}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Avaliação de Riscos</h4>
                    <p className="text-sm text-orange-600">
                      {generateCounterProposalMutation.data.risk_assessment}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}