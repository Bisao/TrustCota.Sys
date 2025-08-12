// Test script para demonstrar o sistema de aprovação funcionando
// Cria uma requisição que deveria acionar o workflow de aprovação

const testRequisition = {
  description: "High-end laptops for development team",
  category: "IT Equipment",
  estimatedAmount: "1500.00", // Valor que deve acionar aprovação de Director (Level 2)
  urgency: "medium",
  justification: "Current laptops are outdated and affecting productivity",
  deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
  items: [
    {
      name: "MacBook Pro 16-inch",
      quantity: 3,
      unitPrice: 500.00,
      specification: "M3 chip, 16GB RAM, 512GB SSD"
    }
  ]
};

console.log("Teste de Workflow de Aprovação");
console.log("===============================");
console.log("Requisição de teste:", JSON.stringify(testRequisition, null, 2));
console.log("");
console.log("Esta requisição deveria:");
console.log("1. Criar a requisição com status 'pending'");
console.log("2. Acionar regra 'Director Approval' (valor entre $1000-$5000)");
console.log("3. Criar etapa de aprovação Level 2 para role 'admin'");
console.log("4. Enviar notificação para aprovadores admin");
console.log("5. Aparecer no dashboard de aprovações pendentes");