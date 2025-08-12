import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  ExternalLink,
  Settings,
  CheckCircle2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";

export default function Integrations() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [spreadsheetTitle, setSpreadsheetTitle] = useState("");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);

  // Google Sheets Export Mutations
  const exportRequisitionsMutation = useMutation({
    mutationFn: (data: { spreadsheetId: string; sheetName?: string }) =>
      fetch("/api/integrations/google-sheets/export-requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: (data) => {
      toast({ 
        title: "Requisições exportadas com sucesso!", 
        description: `${data.rowsExported} requisições exportadas para o Google Sheets.`
      });
    },
    onError: () => {
      toast({ 
        title: "Erro na exportação", 
        description: "Falha ao exportar requisições. Verifique suas credenciais do Google.",
        variant: "destructive"
      });
    },
  });

  const exportSuppliersMutation = useMutation({
    mutationFn: (data: { spreadsheetId: string; sheetName?: string }) =>
      fetch("/api/integrations/google-sheets/export-suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: (data) => {
      toast({ 
        title: "Fornecedores exportados com sucesso!", 
        description: `${data.rowsExported} fornecedores exportados para o Google Sheets.`
      });
    },
    onError: () => {
      toast({ 
        title: "Erro na exportação", 
        description: "Falha ao exportar fornecedores.",
        variant: "destructive"
      });
    },
  });

  const exportQuotesMutation = useMutation({
    mutationFn: (data: { spreadsheetId: string; sheetName?: string }) =>
      fetch("/api/integrations/google-sheets/export-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: (data) => {
      toast({ 
        title: "Cotações exportadas com sucesso!", 
        description: `${data.rowsExported} cotações exportadas para o Google Sheets.`
      });
    },
    onError: () => {
      toast({ 
        title: "Erro na exportação", 
        description: "Falha ao exportar cotações.",
        variant: "destructive"
      });
    },
  });

  const createSpreadsheetMutation = useMutation({
    mutationFn: (data: { title: string }) =>
      fetch("/api/integrations/google-sheets/create-spreadsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: (data) => {
      setSpreadsheetId(data.spreadsheetId);
      toast({ 
        title: "Planilha criada com sucesso!", 
        description: `Nova planilha criada no Google Sheets.`
      });
      window.open(data.url, '_blank');
    },
    onError: () => {
      toast({ 
        title: "Erro na criação", 
        description: "Falha ao criar planilha no Google Sheets.",
        variant: "destructive"
      });
    },
  });

  const { data: requisitions = [] } = useQuery({
    queryKey: ["/api/requisitions"],
  });

  const handleExportData = (dataType: 'requisitions' | 'suppliers' | 'quotes') => {
    if (!spreadsheetId.trim()) {
      toast({
        title: "ID da planilha necessário",
        description: "Por favor, informe o ID da planilha do Google Sheets.",
        variant: "destructive"
      });
      return;
    }

    const exportData = { spreadsheetId: spreadsheetId.trim() };

    switch (dataType) {
      case 'requisitions':
        exportRequisitionsMutation.mutate(exportData);
        break;
      case 'suppliers':
        exportSuppliersMutation.mutate(exportData);
        break;
      case 'quotes':
        exportQuotesMutation.mutate(exportData);
        break;
    }
  };

  const handleCreateSpreadsheet = () => {
    if (!spreadsheetTitle.trim()) {
      toast({
        title: "Título necessário",
        description: "Por favor, informe um título para a planilha.",
        variant: "destructive"
      });
      return;
    }

    createSpreadsheetMutation.mutate({ title: spreadsheetTitle.trim() });
  };

  const handleGenerateDocument = async (docType: string, entityId?: string) => {
    try {
      let endpoint = "";
      let payload = {};

      switch (docType) {
        case 'rfp':
          endpoint = "/api/documents/generate-rfp";
          payload = { 
            requisitionId: entityId || requisitions[0]?.id,
            supplierIds: ['demo-supplier-1', 'demo-supplier-2']
          };
          break;
        case 'contract':
          endpoint = "/api/documents/generate-contract";
          payload = { 
            supplierId: 'demo-supplier-1',
            contractData: {
              title: 'Contrato de Fornecimento',
              description: 'Contrato para fornecimento de materiais e serviços',
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              value: 50000,
              currency: 'BRL',
              terms: 'Termos padrão do contrato de fornecimento.'
            }
          };
          break;
        case 'po':
          endpoint = "/api/documents/generate-purchase-order";
          payload = { purchaseOrderId: 'demo-po-1' };
          break;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition 
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `document_${Date.now()}.docx`;
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({ 
          title: "Documento gerado com sucesso!", 
          description: `Download iniciado: ${filename}`
        });
      } else {
        throw new Error('Failed to generate document');
      }
    } catch (error) {
      toast({ 
        title: "Erro na geração", 
        description: "Falha ao gerar documento.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Google Sheets Integration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Google Sheets</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Exporte dados para análise avançada em planilhas
                </p>
              </div>
            </div>
            <Badge variant="secondary">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Disponível
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spreadsheet-id">ID da Planilha Google Sheets</Label>
                <Input
                  id="spreadsheet-id"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Encontre o ID na URL da planilha
                </p>
              </div>
              <div>
                <Label htmlFor="spreadsheet-title">Título para Nova Planilha</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="spreadsheet-title"
                    value={spreadsheetTitle}
                    onChange={(e) => setSpreadsheetTitle(e.target.value)}
                    placeholder="TrustCota - Dados de Compras"
                  />
                  <Button
                    onClick={handleCreateSpreadsheet}
                    disabled={createSpreadsheetMutation.isPending}
                    size="sm"
                  >
                    Criar
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleExportData('requisitions')}
                disabled={exportRequisitionsMutation.isPending}
                className="h-auto p-4 flex flex-col items-center gap-2"
                variant="outline"
                data-testid="button-export-requisitions"
              >
                <Upload className="w-6 h-6" />
                <div>
                  <div className="font-medium">Requisições</div>
                  <div className="text-xs text-muted-foreground">
                    Exportar todas as requisições
                  </div>
                </div>
              </Button>
              
              <Button
                onClick={() => handleExportData('suppliers')}
                disabled={exportSuppliersMutation.isPending}
                className="h-auto p-4 flex flex-col items-center gap-2"
                variant="outline"
                data-testid="button-export-suppliers"
              >
                <Upload className="w-6 h-6" />
                <div>
                  <div className="font-medium">Fornecedores</div>
                  <div className="text-xs text-muted-foreground">
                    Exportar dados dos fornecedores
                  </div>
                </div>
              </Button>
              
              <Button
                onClick={() => handleExportData('quotes')}
                disabled={exportQuotesMutation.isPending}
                className="h-auto p-4 flex flex-col items-center gap-2"
                variant="outline"
                data-testid="button-export-quotes"
              >
                <Upload className="w-6 h-6" />
                <div>
                  <div className="font-medium">Cotações</div>
                  <div className="text-xs text-muted-foreground">
                    Exportar dados de cotações
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Document Generation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Geração de Documentos DOCX</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gere documentos profissionais automaticamente
                </p>
              </div>
            </div>
            <Badge variant="secondary">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Disponível
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleGenerateDocument('rfp')}
                className="h-auto p-4 flex flex-col items-center gap-2"
                variant="outline"
                data-testid="button-generate-rfp"
              >
                <Download className="w-6 h-6" />
                <div>
                  <div className="font-medium">RFP / RFQ</div>
                  <div className="text-xs text-muted-foreground">
                    Solicitação de Proposta
                  </div>
                </div>
              </Button>
              
              <Button
                onClick={() => handleGenerateDocument('contract')}
                className="h-auto p-4 flex flex-col items-center gap-2"
                variant="outline"
                data-testid="button-generate-contract"
              >
                <Download className="w-6 h-6" />
                <div>
                  <div className="font-medium">Contrato</div>
                  <div className="text-xs text-muted-foreground">
                    Contrato de Fornecimento
                  </div>
                </div>
              </Button>
              
              <Button
                onClick={() => handleGenerateDocument('po')}
                className="h-auto p-4 flex flex-col items-center gap-2"
                variant="outline"
                data-testid="button-generate-po"
              >
                <Download className="w-6 h-6" />
                <div>
                  <div className="font-medium">Purchase Order</div>
                  <div className="text-xs text-muted-foreground">
                    Ordem de Compra
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Future Integrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Integrações Futuras</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Próximas funcionalidades a serem implementadas
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg opacity-75">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold">AI</span>
                  </div>
                  <div className="font-medium">Grok AI Integration</div>
                  <Badge variant="outline" className="ml-auto">Em Breve</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Análise inteligente de propostas, classificação automática e assistente virtual
                </p>
              </div>
              
              <div className="p-4 border rounded-lg opacity-75">
                <div className="flex items-center space-x-2 mb-2">
                  <ExternalLink className="w-5 h-5 text-gray-500" />
                  <div className="font-medium">ERP Integration</div>
                  <Badge variant="outline" className="ml-auto">Planejado</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Integração com sistemas ERP para sincronização de dados financeiros
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}