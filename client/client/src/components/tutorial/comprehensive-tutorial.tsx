import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, BookOpen, Target, Lightbulb } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";

interface TutorialStep {
  id: string;
  title: string;
  titlePt: string;
  content: string;
  contentPt: string;
  category: string;
  categoryPt: string;
  level: "beginner" | "intermediate" | "advanced";
  icon: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "dashboard-overview",
    title: "Dashboard Overview",
    titlePt: "Visão Geral do Painel",
    content: "The dashboard is your central control center. Here you can see key performance indicators (KPIs), pending approvals, recent activities, and important metrics. The cards at the top show critical numbers like pending requisitions, total suppliers, savings, and processing times.",
    contentPt: "O painel é seu centro de controle central. Aqui você pode ver indicadores-chave de desempenho (KPIs), aprovações pendentes, atividades recentes e métricas importantes. Os cartões no topo mostram números críticos como requisições pendentes, total de fornecedores, economias e tempos de processamento.",
    category: "basics",
    categoryPt: "básicos",
    level: "beginner",
    icon: <Target className="w-5 h-5" />
  },
  {
    id: "creating-requisitions",
    title: "Creating Purchase Requisitions", 
    titlePt: "Criando Requisições de Compra",
    content: "To create a new purchase requisition, go to the Requisitions page and click 'New Requisition'. Fill in the description, estimated cost, department, priority, and required items. The system will automatically route your requisition through the appropriate approval workflow based on the amount and category.",
    contentPt: "Para criar uma nova requisição de compra, vá até a página de Requisições e clique em 'Nova Requisição'. Preencha a descrição, custo estimado, departamento, prioridade e itens necessários. O sistema irá automaticamente encaminhar sua requisição através do fluxo de aprovação apropriado baseado no valor e categoria.",
    category: "procurement",
    categoryPt: "aquisições", 
    level: "beginner",
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: "managing-suppliers",
    title: "Managing Suppliers",
    titlePt: "Gerenciando Fornecedores",
    content: "The Suppliers page allows you to manage your vendor relationships. You can add new suppliers, view their ratings, track order history, and monitor performance metrics. Each supplier card shows contact information, current status, rating stars, and total number of orders.",
    contentPt: "A página de Fornecedores permite gerenciar seus relacionamentos com fornecedores. Você pode adicionar novos fornecedores, ver suas avaliações, acompanhar histórico de pedidos e monitorar métricas de desempenho. Cada cartão de fornecedor mostra informações de contato, status atual, estrelas de avaliação e número total de pedidos.",
    category: "suppliers",
    categoryPt: "fornecedores",
    level: "beginner", 
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: "quote-comparison",
    title: "Comparing Quotes",
    titlePt: "Comparando Cotações",
    content: "Use the 'Compare Quotes' feature to analyze different supplier proposals side-by-side. This helps you make informed decisions based on price, delivery time, quality, and supplier reputation. The comparison tool highlights the best options for each criteria.",
    contentPt: "Use o recurso 'Comparar Cotações' para analisar diferentes propostas de fornecedores lado a lado. Isso ajuda você a tomar decisões informadas baseadas em preço, prazo de entrega, qualidade e reputação do fornecedor. A ferramenta de comparação destaca as melhores opções para cada critério.",
    category: "quotes",
    categoryPt: "cotações",
    level: "intermediate",
    icon: <Lightbulb className="w-5 h-5" />
  },
  {
    id: "approval-workflows",
    title: "Setting Up Approval Rules",
    titlePt: "Configurando Regras de Aprovação",
    content: "Approval rules automate the routing of requisitions based on amount thresholds and categories. Go to Approval Rules to set up different approval levels. For example, purchases under $1,000 might require only manager approval, while purchases over $10,000 need executive approval.",
    contentPt: "As regras de aprovação automatizam o encaminhamento de requisições baseado em limites de valor e categorias. Vá para Regras de Aprovação para configurar diferentes níveis de aprovação. Por exemplo, compras abaixo de R$ 5.000 podem precisar apenas da aprovação do gerente, enquanto compras acima de R$ 50.000 precisam da aprovação executiva.",
    category: "approvals",
    categoryPt: "aprovações",
    level: "advanced",
    icon: <Target className="w-5 h-5" />
  },
  {
    id: "purchase-orders",
    title: "Managing Purchase Orders",
    titlePt: "Gerenciando Ordens de Compra",
    content: "Once a quote is approved, it becomes a Purchase Order (PO). Track PO status from 'Pending' to 'Sent', 'Confirmed', 'Delivered', and 'Completed'. Each PO shows supplier information, total amount, expected delivery date, and current status with color-coded badges.",
    contentPt: "Uma vez que uma cotação é aprovada, ela se torna uma Ordem de Compra (OC). Acompanhe o status da OC desde 'Pendente' até 'Enviado', 'Confirmado', 'Entregue' e 'Concluído'. Cada OC mostra informações do fornecedor, valor total, data prevista de entrega e status atual com badges coloridos.",
    category: "orders",
    categoryPt: "pedidos",
    level: "intermediate",
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: "analytics-insights",
    title: "Using Analytics for Insights",
    titlePt: "Usando Análises para Insights",
    content: "The Analytics page provides powerful insights into your procurement performance. View spending trends by month, category breakdowns, supplier performance metrics, and processing time trends. Use these insights to identify cost-saving opportunities and optimize your procurement process.",
    contentPt: "A página de Análises fornece insights poderosos sobre o desempenho das suas aquisições. Veja tendências de gastos por mês, divisões por categoria, métricas de desempenho de fornecedores e tendências de tempo de processamento. Use esses insights para identificar oportunidades de economia de custos e otimizar seu processo de aquisição.",
    category: "analytics",
    categoryPt: "análises",
    level: "intermediate",
    icon: <Lightbulb className="w-5 h-5" />
  },
  {
    id: "language-switching",
    title: "Language Support",
    titlePt: "Suporte a Idiomas",
    content: "TrustCota supports both English and Portuguese. Click the language selector in the header (EN/PT) to switch between languages. All interface elements, forms, and content will be translated accordingly. This ensures accessibility for international teams.",
    contentPt: "O TrustCota suporta inglês e português. Clique no seletor de idioma no cabeçalho (EN/PT) para alternar entre idiomas. Todos os elementos da interface, formulários e conteúdo serão traduzidos adequadamente. Isso garante acessibilidade para equipes internacionais.",
    category: "interface",
    categoryPt: "interface",
    level: "beginner",
    icon: <Target className="w-5 h-5" />
  }
];

interface ComprehensiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComprehensiveTutorial({ isOpen, onClose }: ComprehensiveTutorialProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredSteps = selectedCategory 
    ? tutorialSteps.filter(step => step.category === selectedCategory)
    : tutorialSteps;

  const categories = Array.from(new Set(tutorialSteps.map(step => step.category)));

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelText = (level: string) => {
    if (language === 'pt') {
      switch (level) {
        case "beginner": return "Iniciante";
        case "intermediate": return "Intermediário";
        case "advanced": return "Avançado";
        default: return "Iniciante";
      }
    }
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const currentStepData = filteredSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">
            {language === 'pt' ? 'Tutorial Completo do TrustCota' : 'Complete TrustCota Tutorial'}
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="flex gap-6 h-[600px]">
          {/* Sidebar with categories and steps */}
          <div className="w-80 border-r pr-6 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  {language === 'pt' ? 'Categorias' : 'Categories'}
                </h3>
                <div className="space-y-1">
                  <Button
                    variant={selectedCategory === null ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedCategory(null);
                      setCurrentStep(0);
                    }}
                  >
                    {language === 'pt' ? 'Todos' : 'All'}
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedCategory(category);
                        setCurrentStep(0);
                      }}
                    >
                      {language === 'pt' 
                        ? tutorialSteps.find(s => s.category === category)?.categoryPt || category
                        : category.charAt(0).toUpperCase() + category.slice(1)
                      }
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  {language === 'pt' ? 'Passos' : 'Steps'} ({filteredSteps.length})
                </h3>
                <div className="space-y-1">
                  {filteredSteps.map((step, index) => (
                    <Button
                      key={step.id}
                      variant={currentStep === index ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className="flex items-start gap-2 w-full">
                        {step.icon}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {language === 'pt' ? step.titlePt : step.title}
                          </p>
                          <Badge className={`text-xs ${getLevelColor(step.level)}`}>
                            {getLevelText(step.level)}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            {currentStepData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {currentStepData.icon}
                      <div>
                        <CardTitle className="text-lg">
                          {language === 'pt' ? currentStepData.titlePt : currentStepData.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getLevelColor(currentStepData.level)}>
                            {getLevelText(currentStepData.level)}
                          </Badge>
                          <Badge variant="outline">
                            {language === 'pt' ? currentStepData.categoryPt : currentStepData.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {currentStep + 1} / {filteredSteps.length}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed mb-6">
                    {language === 'pt' ? currentStepData.contentPt : currentStepData.content}
                  </p>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      {language === 'pt' ? 'Anterior' : 'Previous'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.min(filteredSteps.length - 1, currentStep + 1))}
                      disabled={currentStep === filteredSteps.length - 1}
                    >
                      {language === 'pt' ? 'Próximo' : 'Next'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}