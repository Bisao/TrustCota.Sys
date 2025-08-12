import OpenAI from "openai";

// AI Provider Configuration
export type AIProvider = 'grok';

export interface AIConfig {
  provider: AIProvider;
  grok?: {
    apiKey: string;
    baseURL: string;
    model: string;
  };
}

// Default configuration
const defaultConfig: AIConfig = {
  provider: 'grok',
  grok: {
    apiKey: process.env.XAI_API_KEY || '',
    baseURL: "https://api.x.ai/v1",
    model: "grok-2-1212"
  }
};

let currentConfig: AIConfig = { ...defaultConfig };

// Initialize AI clients
const grokClient = new OpenAI({ 
  baseURL: currentConfig.grok?.baseURL, 
  apiKey: currentConfig.grok?.apiKey 
});

// Get current AI client based on configuration
export function getAIClient(): { client: OpenAI; model: string; provider: AIProvider } {
  return {
    client: grokClient,
    model: currentConfig.grok?.model || "grok-2-1212",
    provider: 'grok'
  };
}

// Update AI configuration
export function setAIProvider(provider: AIProvider) {
  if (provider === 'grok') {
    currentConfig.provider = provider;
  }
}

export function getAIProvider(): AIProvider {
  return currentConfig.provider;
}

export function updateAIConfig(config: Partial<AIConfig>) {
  currentConfig = { ...currentConfig, ...config };
}

export function getAIConfig(): AIConfig {
  return { ...currentConfig };
}

// Check if provider is available
export function isProviderAvailable(provider: AIProvider): boolean {
  switch (provider) {
    case 'grok':
      return !!currentConfig.grok?.apiKey;
    case 'openai':
      return !!currentConfig.openai?.apiKey;
    default:
      return false;
  }
}

// Get available providers
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (isProviderAvailable('grok')) providers.push('grok');
  if (isProviderAvailable('openai')) providers.push('openai');
  return providers;
}

// Smart fallback - switches to available provider if current one fails
export async function makeAIRequest(
  messages: any[],
  options: { temperature?: number; response_format?: any } = {}
): Promise<{ content: string; provider: AIProvider }> {
  const { client, model, provider } = getAIClient();
  
  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature || 0.3,
      ...(options.response_format && { response_format: options.response_format })
    });
    
    return {
      content: response.choices[0].message.content || '',
      provider
    };
  } catch (error) {
    console.error(`Erro com ${provider}:`, error);
    
    // Try to fallback to another provider
    if (provider === 'grok' && isProviderAvailable('openai')) {
      console.log('Tentando fallback para OpenAI...');
      setAIProvider('openai');
      return makeAIRequest(messages, options);
    } else if (provider === 'openai' && isProviderAvailable('grok')) {
      console.log('Tentando fallback para Grok...');
      setAIProvider('grok');
      return makeAIRequest(messages, options);
    }
    
    throw error;
  }
}