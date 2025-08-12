import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Brain, Zap, AlertCircle, CheckCircle2, Settings } from 'lucide-react';

interface AIConfig {
  current_provider: 'grok';
  available_providers: ('grok')[];
  config: {
    provider: 'grok';
    grok?: {
      apiKey: string;
      baseURL: string;
      model: string;
    };
  };
}

const providerInfo = {
  grok: {
    name: 'Grok (xAI)',
    description: 'Modelo avançado da xAI com capacidades especializadas em análise de negócios',
    icon: <Zap className="h-5 w-5" />,
    color: 'blue',
    features: ['Análise de sentimentos', 'Previsões de mercado', 'Classificação inteligente', 'Contrapropostas']
  }
};

export function AIProviderSelector() {
  const [selectedProvider, setSelectedProvider] = useState<'grok'>('grok');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery<AIConfig>({
    queryKey: ['/api/ai/config'],
    staleTime: 30000
  });

  const updateProviderMutation = useMutation({
    mutationFn: async (provider: 'grok') => {
      const response = await fetch('/api/ai/config/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      if (!response.ok) throw new Error('Falha ao atualizar provedor');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/config'] });
      toast({
        title: "Provedor atualizado",
        description: data.message,
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar provedor",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (config) {
      setSelectedProvider(config.current_provider);
    }
  }, [config]);

  const handleProviderChange = (provider: 'grok') => {
    setSelectedProvider(provider);
  };

  const handleSave = () => {
    if (selectedProvider !== config?.current_provider) {
      updateProviderMutation.mutate(selectedProvider);
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="ai-provider-loading">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Carregando configuração...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="ai-provider-selector">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração do Provedor de IA
        </CardTitle>
        <CardDescription>
          Escolha entre os provedores de IA disponíveis para as funcionalidades avançadas do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-3 block">Provedor Atual</label>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="default">
              Grok (xAI)
            </Badge>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Selecionar Provedor</label>
          <Select value={selectedProvider} onValueChange={handleProviderChange} data-testid="provider-select">
            <SelectTrigger>
              <SelectValue placeholder="Escolha um provedor" />
            </SelectTrigger>
            <SelectContent>
              {config?.available_providers.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  <div className="flex items-center gap-2">
                    {providerInfo[provider].icon}
                    {providerInfo[provider].name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-1 gap-4">
          {(['grok'] as const).map((provider) => (
            <Card 
              key={provider}
              className={`transition-all border-2 ${
                selectedProvider === provider 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                  : 'border-gray-200 dark:border-gray-700'
              } ${
                !config?.available_providers.includes(provider) 
                  ? 'opacity-50' 
                  : 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => config?.available_providers.includes(provider) && handleProviderChange(provider)}
              data-testid={`provider-card-${provider}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    {providerInfo[provider].icon}
                    {providerInfo[provider].name}
                  </div>
                  {config?.available_providers.includes(provider) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  {providerInfo[provider].description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Funcionalidades:</p>
                  <ul className="text-xs space-y-1">
                    {providerInfo[provider].features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {!config?.available_providers.includes(provider) && (
                    <Badge variant="destructive" className="mt-2 text-xs">
                      API Key necessária
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {config?.available_providers.length === 0 && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Nenhum provedor disponível</p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                Configure pelo menos uma API key (XAI_API_KEY ou OPENAI_API_KEY) para usar as funcionalidades de IA.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{config?.available_providers.length || 0}</span> provedores disponíveis
          </div>
          <Button 
            onClick={handleSave}
            disabled={selectedProvider === config?.current_provider || updateProviderMutation.isPending}
            data-testid="save-provider-button"
          >
            {updateProviderMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              'Aplicar Alterações'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}