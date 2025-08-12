import { makeAIRequest, getAIProvider } from "./providers";

// Análise inteligente de requisições
export async function analyzeRequisition(description: string, category: string, amount: number): Promise<{
  priority: "low" | "medium" | "high" | "critical";
  risk_assessment: string;
  recommendations: string[];
  estimated_savings: number;
}> {
  try {
    const prompt = `Analise esta requisição de compra corporativa:
    
Descrição: ${description}
Categoria: ${category}
Valor: R$ ${amount.toLocaleString('pt-BR')}

Por favor, forneça uma análise completa incluindo:
1. Prioridade (low, medium, high, critical)
2. Avaliação de riscos
3. Recomendações específicas
4. Economia estimada em percentual

Responda em JSON no formato:
{
  "priority": "medium",
  "risk_assessment": "Descrição dos riscos identificados",
  "recommendations": ["recomendação 1", "recomendação 2"],
  "estimated_savings": 15
}`;

    const { content } = await makeAIRequest([
      {
        role: "system",
        content: "Você é um especialista em procurement corporativo com 15 anos de experiência em análise de riscos e otimização de compras."
      },
      {
        role: "user",
        content: prompt
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(content);
    
    return {
      priority: result.priority || "medium",
      risk_assessment: result.risk_assessment || "Análise não disponível",
      recommendations: result.recommendations || [],
      estimated_savings: result.estimated_savings || 0
    };

  } catch (error) {
    console.error("Erro na análise de requisição:", error);
    return {
      priority: "medium",
      risk_assessment: "Erro ao processar análise",
      recommendations: ["Revisar requisição manualmente"],
      estimated_savings: 0
    };
  }
}

// Análise de sentimentos em negociações
export async function analyzeSentiment(text: string): Promise<{
  rating: number;
  confidence: number;
  insights: string;
}> {
  try {
    const { content } = await makeAIRequest([
      {
        role: "system",
        content: "Você é um especialista em análise de sentimentos para negociações comerciais. Analise o sentimento e forneça insights sobre o tom da comunicação."
      },
      {
        role: "user",
        content: `Analise o sentimento desta comunicação de negociação: "${text}"
        
        Forneça:
        1. Rating de 1-5 (1=muito negativo, 5=muito positivo)
        2. Confiança da análise (0-1)
        3. Insights sobre o tom e estratégia recomendada
        
        Responda em JSON: {"rating": number, "confidence": number, "insights": "string"}`
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    const result = JSON.parse(content);

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
      insights: result.insights || "Análise não disponível"
    };
  } catch (error) {
    console.error("Erro na análise de sentimento:", error);
    return {
      rating: 3,
      confidence: 0,
      insights: "Erro ao processar análise de sentimento"
    };
  }
}

// Sugestões automáticas para fornecedores
export async function suggestSuppliers(category: string, requirements: string[], budget: number): Promise<{
  supplier_criteria: string[];
  negotiation_tips: string[];
  market_insights: string;
}> {
  try {
    const prompt = `Como especialista em procurement, sugira critérios para seleção de fornecedores:

Categoria: ${category}
Requisitos: ${requirements.join(", ")}
Orçamento: R$ ${budget.toLocaleString('pt-BR')}

Forneça:
1. Critérios específicos para seleção de fornecedores
2. Dicas de negociação
3. Insights do mercado atual

Formato JSON:
{
  "supplier_criteria": ["critério 1", "critério 2"],
  "negotiation_tips": ["dica 1", "dica 2"],
  "market_insights": "análise do mercado"
}`;

    const { content } = await makeAIRequest([
      {
        role: "system",
        content: "Você é um especialista em sourcing e gestão de fornecedores com conhecimento profundo do mercado brasileiro."
      },
      {
        role: "user",
        content: prompt
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.4
    });

    const result = JSON.parse(content);

    return {
      supplier_criteria: result.supplier_criteria || [],
      negotiation_tips: result.negotiation_tips || [],
      market_insights: result.market_insights || "Análise não disponível"
    };
  } catch (error) {
    console.error("Erro nas sugestões de fornecedores:", error);
    return {
      supplier_criteria: ["Qualidade do produto/serviço", "Prazo de entrega", "Suporte técnico"],
      negotiation_tips: ["Solicitar múltiplas propostas", "Negociar prazos de pagamento"],
      market_insights: "Erro ao processar análise de mercado"
    };
  }
}

// Análise avançada de propostas de fornecedores
export async function analyzeSupplierProposal(proposalText: string, requirements: string[]): Promise<{
  extracted_info: {
    price: string;
    delivery_time: string;
    payment_terms: string;
    specifications: string[];
  };
  compliance_analysis: string;
  risk_factors: string[];
  recommendations: string[];
  negotiation_points: string[];
}> {
  try {
    const prompt = `Analise esta proposta de fornecedor:

PROPOSTA:
${proposalText}

REQUISITOS ORIGINAIS:
${requirements.join(", ")}

Extraia e analise as seguintes informações:
1. Informações-chave (preço, prazo de entrega, condições de pagamento, especificações)
2. Conformidade com os requisitos
3. Fatores de risco identificados
4. Recomendações estratégicas
5. Pontos para negociação

Responda em JSON:
{
  "extracted_info": {
    "price": "valor encontrado",
    "delivery_time": "prazo informado",
    "payment_terms": "condições de pagamento",
    "specifications": ["spec1", "spec2"]
  },
  "compliance_analysis": "análise de conformidade",
  "risk_factors": ["risco1", "risco2"],
  "recommendations": ["recomendação1", "recomendação2"],
  "negotiation_points": ["ponto1", "ponto2"]
}`;

    const { content } = await makeAIRequest([
      {
        role: "system",
        content: "Você é um especialista em análise de contratos e propostas comerciais com experiência em identificação de riscos e oportunidades de negociação."
      },
      {
        role: "user",
        content: prompt
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Erro na análise de proposta:", error);
    
    // Check if it's a credits/API key issue
    if (error.status === 403 || error.message?.includes('credits')) {
      return {
        extracted_info: {
          price: "⚠️ Análise automática indisponível - API requer créditos",
          delivery_time: "Revisar manualmente na proposta", 
          payment_terms: "Verificar termos no documento",
          specifications: ["Análise detalhada requer configuração da API"]
        },
        compliance_analysis: "⚠️ Para análise completa de conformidade, configure créditos na API do Grok. Recomenda-se revisão manual detalhada da proposta pelos especialistas.",
        risk_factors: [
          "Análise de riscos automática temporariamente indisponível",
          "Recomenda-se avaliação manual por especialista em contratos"
        ],
        recommendations: [
          "Revisar proposta manualmente com foco em preços, prazos e condições",
          "Verificar histórico do fornecedor",
          "Validar especificações técnicas"
        ],
        negotiation_points: [
          "Solicitar esclarecimentos sobre termos ambíguos",
          "Negociar prazos de entrega",
          "Discutir condições de pagamento"
        ]
      };
    }
    
    return {
      extracted_info: {
        price: "Erro na análise",
        delivery_time: "Não identificado", 
        payment_terms: "Não identificado",
        specifications: []
      },
      compliance_analysis: "Erro ao processar análise",
      risk_factors: ["Análise não disponível"],
      recommendations: ["Revisar proposta manualmente"],
      negotiation_points: ["Definir pontos de negociação"]
    };
  }
}

// Classificação automática de requisições
export async function classifyRequisition(description: string, title: string): Promise<{
  category: string;
  subcategory: string;
  urgency_level: "low" | "medium" | "high" | "critical";
  suggested_suppliers: string[];
  missing_information: string[];
}> {
  try {
    const prompt = `Classifique esta requisição de compra:

TÍTULO: ${title}
DESCRIÇÃO: ${description}

Forneça:
1. Categoria principal (ex: TI, Material de Escritório, Serviços, Equipamentos, etc.)
2. Subcategoria específica
3. Nível de urgência baseado na descrição
4. Tipos de fornecedores recomendados
5. Informações que estão faltando na requisição

Formato JSON:
{
  "category": "categoria principal",
  "subcategory": "subcategoria específica",
  "urgency_level": "low/medium/high/critical",
  "suggested_suppliers": ["tipo1", "tipo2"],
  "missing_information": ["info1", "info2"]
}`;

    const { content } = await makeAIRequest([
      {
        role: "system",
        content: "Você é um especialista em categorização de compras corporativas com conhecimento profundo de diferentes tipos de produtos e serviços."
      },
      {
        role: "user",
        content: prompt
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Erro na classificação de requisição:", error);
    
    // Check if it's a credits/API key issue
    if (error.status === 403 || error.message?.includes('credits')) {
      // Smart fallback classification based on common patterns
      const categoryGuess = category.toLowerCase().includes('hardware') ? 'Hardware' :
                          category.toLowerCase().includes('software') ? 'Software' :
                          category.toLowerCase().includes('serviço') ? 'Serviços' :
                          category.toLowerCase().includes('material') ? 'Material de Escritório' :
                          'Geral';
      
      return {
        category: categoryGuess,
        subcategory: "⚠️ Classificação automática indisponível - API requer créditos",
        urgency_level: "medium",
        suggested_suppliers: [
          "Fornecedores especialistas em " + categoryGuess,
          "Fornecedores com histórico positivo",
          "Parceiros estratégicos"
        ],
        missing_information: [
          "⚠️ Para análise detalhada, configure créditos na API do Grok",
          "Recomenda-se classificação manual por especialista"
        ]
      };
    }
    
    return {
      category: "Não classificado",
      subcategory: "Não classificado", 
      urgency_level: "medium",
      suggested_suppliers: ["Fornecedores gerais"],
      missing_information: ["Erro na análise"]
    };
  }
}

// Análise preditiva de preços
export async function predictPriceTrends(category: string, historicalData: any[]): Promise<{
  trend_analysis: string;
  price_forecast: string;
  market_factors: string[];
  buying_recommendation: "buy_now" | "wait" | "monitor";
  confidence_level: number;
}> {
  try {
    const prompt = `Analise as tendências de preço para a categoria: ${category}

DADOS HISTÓRICOS:
${JSON.stringify(historicalData, null, 2)}

Forneça:
1. Análise de tendência atual
2. Previsão de preços para os próximos 3 meses
3. Fatores de mercado influentes
4. Recomendação de compra (comprar agora, aguardar, monitorar)
5. Nível de confiança da análise (0-100%)

Formato JSON:
{
  "trend_analysis": "análise detalhada",
  "price_forecast": "previsão de preços",
  "market_factors": ["fator1", "fator2"],
  "buying_recommendation": "buy_now/wait/monitor",
  "confidence_level": 85
}`;

    const { content } = await makeAIRequest([
      {
        role: "system",
        content: "Você é um analista de mercado especializado em tendências de preços e análise preditiva para procurement corporativo."
      },
      {
        role: "user",
        content: prompt
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.4
    });

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Erro na análise preditiva:", error);
    
    // Check if it's a credits/API key issue
    if (error.status === 403 || error.message?.includes('credits')) {
      return {
        trend_analysis: "⚠️ API do Grok requer créditos. A análise preditiva avançada está temporariamente indisponível. Para funcionalidades completas de IA, configure créditos na conta xAI.",
        price_forecast: "Baseado em dados históricos gerais, a categoria Hardware tem apresentado volatilidade moderada nos últimos meses.",
        market_factors: [
          "Flutuações na cadeia de suprimentos global",
          "Demanda crescente por componentes eletrônicos", 
          "Políticas comerciais internacionais",
          "Inovações tecnológicas"
        ],
        buying_recommendation: "monitor",
        confidence_level: 65
      };
    }
    
    return {
      trend_analysis: "Análise não disponível devido a erro técnico",
      price_forecast: "Previsão não disponível",
      market_factors: ["Dados insuficientes"],
      buying_recommendation: "monitor",
      confidence_level: 0
    };
  }
}

// Geração de contrapropostas inteligentes
export async function generateCounterProposal(originalProposal: string, negotiationGoals: string[]): Promise<{
  counter_proposal_text: string;
  key_changes: string[];
  negotiation_strategy: string;
  risk_assessment: string;
}> {
  try {
    const prompt = `Gere uma contraproposta baseada na proposta original e objetivos de negociação:

PROPOSTA ORIGINAL:
${originalProposal}

OBJETIVOS DE NEGOCIAÇÃO:
${negotiationGoals.join(", ")}

Crie uma contraproposta profissional que:
1. Mantenha um tom respeitoso
2. Apresente argumentos sólidos
3. Proponha mudanças específicas
4. Inclua estratégia de negociação
5. Avalie riscos da abordagem

Formato JSON:
{
  "counter_proposal_text": "texto completo da contraproposta",
  "key_changes": ["mudança1", "mudança2"],
  "negotiation_strategy": "estratégia recomendada",
  "risk_assessment": "avaliação de riscos"
}`;

    const { content } = await makeAIRequest([
      {
        role: "system",
        content: "Você é um especialista em negociações comerciais com experiência em redação de contrapropostas eficazes e estratégias de negociação."
      },
      {
        role: "user",
        content: prompt
      }
    ], { 
      response_format: { type: "json_object" },
      temperature: 0.6
    });

    const result = JSON.parse(content);
    return result;
  } catch (error) {
    console.error("Erro na geração de contraproposta:", error);
    
    // Check if it's a credits/API key issue
    if (error.status === 403 || error.message?.includes('credits')) {
      return {
        counter_proposal_text: "⚠️ Geração automática de contraproposta indisponível - API do Grok requer créditos.\n\nPara uma contraproposta eficaz, recomenda-se:\n\n1. Revisar cuidadosamente todos os termos da proposta original\n2. Identificar pontos específicos para negociação\n3. Preparar argumentos baseados em dados de mercado\n4. Manter tom profissional e construtivo\n5. Definir limites claros para a negociação",
        key_changes: [
          "⚠️ Análise automática indisponível",
          "Recomenda-se revisão manual por especialista em negociações",
          "Focar em aspectos críticos: preço, prazo, condições de pagamento"
        ],
        negotiation_strategy: "Para estratégia completa, configure créditos na API do Grok. Temporariamente, consulte especialista em negociações para definir abordagem adequada.",
        risk_assessment: "⚠️ Avaliação automática de riscos indisponível. Recomenda-se análise manual focada em cláusulas contratuais, histórico do fornecedor e viabilidade técnica."
      };
    }
    
    return {
      counter_proposal_text: "Erro ao gerar contraproposta",
      key_changes: ["Revisar manualmente"],
      negotiation_strategy: "Consultar equipe jurídica", 
      risk_assessment: "Análise não disponível"
    };
  }
}

// Geração de resumo executivo para relatórios
export async function generateExecutiveSummary(data: {
  total_spend: number;
  active_suppliers: number;
  pending_requisitions: number;
  monthly_trend: "up" | "down" | "stable";
}): Promise<string> {
  try {
    const prompt = `Gere um resumo executivo para o dashboard de procurement com os seguintes dados:

- Gasto total: R$ ${data.total_spend.toLocaleString('pt-BR')}
- Fornecedores ativos: ${data.active_suppliers}
- Requisições pendentes: ${data.pending_requisitions}
- Tendência mensal: ${data.monthly_trend === 'up' ? 'crescimento' : data.monthly_trend === 'down' ? 'declínio' : 'estável'}

Crie um resumo executivo profissional e conciso (máximo 200 palavras) destacando pontos-chave e recomendações.`;

    const { content } = await makeAIRequest([
      {
        role: "system",
        content: "Você é um analista sênior de procurement que cria resumos executivos claros e acionáveis para liderança corporativa."
      },
      {
        role: "user",
        content: prompt
      }
    ], { 
      temperature: 0.5
    });

    return content || "Resumo não disponível";
  } catch (error) {
    console.error("Erro na geração de resumo:", error);
    return "Erro ao gerar resumo executivo";
  }
}