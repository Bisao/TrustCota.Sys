import { createReport } from 'docx-templates';
import { storage } from '../storage';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface DocxTemplateData {
  [key: string]: any;
}

class DocxGeneratorService {
  private templatesPath: string;

  constructor() {
    this.templatesPath = path.join(__dirname, '../templates/docx');
    this.ensureTemplatesDirectory();
  }

  private ensureTemplatesDirectory() {
    if (!fs.existsSync(this.templatesPath)) {
      fs.mkdirSync(this.templatesPath, { recursive: true });
    }
  }

  async generateRFPDocument(requisitionId: string, suppliersIds: string[]) {
    try {
      const requisition = await storage.getRequisitionById(requisitionId);
      if (!requisition) {
        throw new Error('Requisition not found');
      }

      const suppliers = await Promise.all(
        suppliersIds.map(id => storage.getSupplierById(id))
      );

      const templateData: DocxTemplateData = {
        requisition: {
          number: requisition.requisitionNumber,
          description: requisition.description,
          category: requisition.category,
          quantity: requisition.quantity,
          estimatedAmount: requisition.estimatedAmount,
          urgency: requisition.urgency,
          justification: requisition.justification,
          createdDate: new Date(requisition.createdAt!).toLocaleDateString('pt-BR')
        },
        company: {
          name: 'TrustCota Corporation',
          address: '123 Business Street, Corporate City',
          phone: '+55 11 1234-5678',
          email: 'procurement@trustcota.com'
        },
        suppliers: suppliers.filter(Boolean).map(supplier => ({
          name: supplier!.name,
          email: supplier!.contactEmail,
          phone: supplier!.contactPhone
        })),
        submissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        generatedDate: new Date().toLocaleDateString('pt-BR')
      };

      // Create RFP template content
      const template = this.createRFPTemplate();
      
      const report = await createReport({
        template,
        data: templateData,
      });

      return {
        buffer: report,
        filename: `RFP_${requisition.requisitionNumber}_${Date.now()}.docx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };

    } catch (error) {
      console.error('Generate RFP document error:', error);
      throw error;
    }
  }

  async generateContractDocument(supplierId: string, contractData: any) {
    try {
      const supplier = await storage.getSupplierById(supplierId);
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      const templateData: DocxTemplateData = {
        contract: {
          title: contractData.title || 'Contrato de Fornecimento',
          description: contractData.description,
          startDate: new Date(contractData.startDate).toLocaleDateString('pt-BR'),
          endDate: new Date(contractData.endDate).toLocaleDateString('pt-BR'),
          value: parseFloat(contractData.value).toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: contractData.currency || 'BRL' 
          }),
          terms: contractData.terms || 'Termos padrão do contrato'
        },
        supplier: {
          name: supplier.name,
          email: supplier.contactEmail,
          phone: supplier.contactPhone,
          address: supplier.address,
          taxId: supplier.taxId
        },
        company: {
          name: 'TrustCota Corporation',
          address: '123 Business Street, Corporate City',
          phone: '+55 11 1234-5678',
          email: 'legal@trustcota.com',
          taxId: '12.345.678/0001-90'
        },
        generatedDate: new Date().toLocaleDateString('pt-BR')
      };

      const template = this.createContractTemplate();
      
      const report = await createReport({
        template,
        data: templateData,
      });

      return {
        buffer: report,
        filename: `Contract_${supplier.name.replace(/\s+/g, '_')}_${Date.now()}.docx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };

    } catch (error) {
      console.error('Generate contract document error:', error);
      throw error;
    }
  }

  async generatePurchaseOrderDocument(poId: string) {
    try {
      const po = await storage.getPurchaseOrderById(poId);
      if (!po) {
        throw new Error('Purchase Order not found');
      }

      const supplier = await storage.getSupplierById(po.supplierId);
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      const templateData: DocxTemplateData = {
        po: {
          number: po.poNumber,
          totalAmount: parseFloat(po.totalAmount).toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: po.currency || 'BRL' 
          }),
          currency: po.currency,
          status: po.status,
          expectedDelivery: po.expectedDelivery ? 
            new Date(po.expectedDelivery).toLocaleDateString('pt-BR') : '',
          terms: po.terms,
          notes: po.notes,
          items: po.items ? JSON.parse(po.items) : []
        },
        supplier: {
          name: supplier.name,
          email: supplier.contactEmail,
          phone: supplier.contactPhone,
          address: supplier.address,
          taxId: supplier.taxId
        },
        company: {
          name: 'TrustCota Corporation',
          address: '123 Business Street, Corporate City',
          phone: '+55 11 1234-5678',
          email: 'procurement@trustcota.com',
          taxId: '12.345.678/0001-90'
        },
        generatedDate: new Date().toLocaleDateString('pt-BR')
      };

      const template = this.createPurchaseOrderTemplate();
      
      const report = await createReport({
        template,
        data: templateData,
      });

      return {
        buffer: report,
        filename: `PO_${po.poNumber}_${Date.now()}.docx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };

    } catch (error) {
      console.error('Generate PO document error:', error);
      throw error;
    }
  }

  // Template creation methods
  private createRFPTemplate(): Buffer {
    // This would typically load from a .docx template file
    // For now, creating a basic structure
    const templateContent = `
REQUEST FOR PROPOSAL (RFP)

Company: {{company.name}}
Address: {{company.address}}
Phone: {{company.phone}}
Email: {{company.email}}

Date: {{generatedDate}}

REQUISITION DETAILS:
Requisition Number: {{requisition.number}}
Description: {{requisition.description}}
Category: {{requisition.category}}
Quantity: {{requisition.quantity}}
Estimated Amount: {{requisition.estimatedAmount}}
Urgency: {{requisition.urgency}}

JUSTIFICATION:
{{requisition.justification}}

SUPPLIERS INVITED:
{{#suppliers}}
- {{name}} ({{email}})
{{/suppliers}}

SUBMISSION DEADLINE: {{submissionDeadline}}

TERMS AND CONDITIONS:
1. All proposals must be submitted by the deadline specified above.
2. Proposals should include detailed pricing, delivery terms, and technical specifications.
3. The company reserves the right to reject any or all proposals.
4. Selected supplier will be notified within 5 business days of the deadline.

Please provide your complete proposal including:
- Detailed pricing breakdown
- Delivery schedule
- Terms and conditions
- Technical specifications
- References (if applicable)

For questions, please contact our procurement team at procurement@trustcota.com.

Best regards,
TrustCota Procurement Team
    `;
    
    return Buffer.from(templateContent, 'utf8');
  }

  private createContractTemplate(): Buffer {
    const templateContent = `
CONTRATO DE FORNECIMENTO

CONTRATANTE: {{company.name}}
CNPJ: {{company.taxId}}
Endereço: {{company.address}}
Telefone: {{company.phone}}
E-mail: {{company.email}}

CONTRATADO: {{supplier.name}}
CNPJ: {{supplier.taxId}}
E-mail: {{supplier.email}}
Telefone: {{supplier.phone}}
Endereço: {{supplier.address}}

OBJETO: {{contract.title}}

DESCRIÇÃO: {{contract.description}}

VALOR TOTAL: {{contract.value}}

PERÍODO DE VIGÊNCIA:
Início: {{contract.startDate}}
Término: {{contract.endDate}}

TERMOS E CONDIÇÕES:
{{contract.terms}}

CLÁUSULAS GERAIS:
1. Este contrato obriga as partes e seus sucessores a qualquer título.
2. Fica eleito o foro da comarca onde tem sede a CONTRATANTE para dirimir quaisquer questões oriundas do presente contrato.

Data: {{generatedDate}}

_________________________                 _________________________
CONTRATANTE                               CONTRATADO
    `;
    
    return Buffer.from(templateContent, 'utf8');
  }

  private createPurchaseOrderTemplate(): Buffer {
    const templateContent = `
ORDEM DE COMPRA

NÚMERO: {{po.number}}
DATA: {{generatedDate}}

EMPRESA:
{{company.name}}
{{company.address}}
{{company.phone}}
{{company.email}}

FORNECEDOR:
{{supplier.name}}
{{supplier.address}}
{{supplier.phone}}
{{supplier.email}}

VALOR TOTAL: {{po.totalAmount}}
MOEDA: {{po.currency}}

DATA PREVISTA DE ENTREGA: {{po.expectedDelivery}}

ITENS:
{{#po.items}}
- {{description}} | Qtd: {{quantity}} | Valor: {{unitPrice}}
{{/po.items}}

TERMOS:
{{po.terms}}

OBSERVAÇÕES:
{{po.notes}}

Status: {{po.status}}

_________________________
Autorizado por: TrustCota Procurement
    `;
    
    return Buffer.from(templateContent, 'utf8');
  }
}

export const docxGeneratorService = new DocxGeneratorService();