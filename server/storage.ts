import { 
  users, 
  suppliers, 
  requisitions, 
  quotes, 
  purchaseOrders, 
  activities,
  approvalRules,
  approvalSteps,
  notifications,
  rfpRequests,
  quoteComparisons,
  negotiations,
  inventory,
  stockMovements,
  costCenters,
  reportTemplates,
  emailTemplates,
  contracts,
  receipts,
  supplierQualifications,
  type User, 
  type InsertUser,
  type Supplier,
  type InsertSupplier,
  type Requisition,
  type InsertRequisition,
  type Quote,
  type InsertQuote,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type Receipt,
  type InsertReceipt,
  type SupplierQualification,
  type InsertSupplierQualification,
  type Activity,
  type InsertActivity,
  type ApprovalRule,
  type InsertApprovalRule,
  type ApprovalStep,
  type InsertApprovalStep,
  type Notification,
  type InsertNotification,
  type RfpRequest,
  type InsertRfpRequest,
  type QuoteComparison,
  type InsertQuoteComparison,
  type Negotiation,
  type InsertNegotiation,
  type Inventory,
  type InsertInventory,
  type StockMovement,
  type InsertStockMovement,
  type CostCenter,
  type InsertCostCenter,
  type ReportTemplate,
  type InsertReportTemplate,
  type EmailTemplate,
  type InsertEmailTemplate,
  type Contract,
  type InsertContract
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, like, count, sum, sql, and, or, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";

const PostgresSessionStore = connectPg(session);
const MemorySessionStore = MemoryStore(session);

export interface IStorage {
  // User management
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Supplier management
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;
  
  // Requisition management
  getRequisitions(): Promise<Requisition[]>;
  getRequisition(id: string): Promise<Requisition | undefined>;
  getRequisitionsByUser(userId: string): Promise<Requisition[]>;
  createRequisition(requisition: InsertRequisition): Promise<Requisition>;
  updateRequisition(id: string, requisition: Partial<InsertRequisition>): Promise<Requisition | undefined>;
  
  // Quote management
  getQuotes(): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | undefined>;
  getQuotesByRequisition(requisitionId: string): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  
  // Purchase Order management
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, po: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  
  // Activity logging
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
  
  // Dashboard analytics
  getDashboardStats(): Promise<{
    pendingRequisitions: number;
    totalSavings: string;
    avgProcessingTime: number;
    activeSuppliers: number;
  }>;
  
  // Approval Rules management
  getApprovalRules(): Promise<ApprovalRule[]>;
  getApprovalRule(id: string): Promise<ApprovalRule | undefined>;
  createApprovalRule(rule: InsertApprovalRule): Promise<ApprovalRule>;
  updateApprovalRule(id: string, rule: Partial<InsertApprovalRule>): Promise<ApprovalRule | undefined>;
  deleteApprovalRule(id: string): Promise<boolean>;
  getApplicableRules(amount: number, category?: string, department?: string): Promise<ApprovalRule[]>;
  
  // Approval Steps management
  getApprovalSteps(requisitionId: string): Promise<ApprovalStep[]>;
  createApprovalStep(step: InsertApprovalStep): Promise<ApprovalStep>;
  updateApprovalStep(id: string, step: Partial<InsertApprovalStep>): Promise<ApprovalStep | undefined>;
  getPendingApprovalsForUser(userId: string): Promise<ApprovalStep[]>;
  
  // Notifications management
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  markAllNotificationsAsRead(userId: string): Promise<boolean>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  
  // Approval workflow
  processRequisitionApproval(requisitionId: string): Promise<ApprovalStep[]>;
  approveRequisitionStep(stepId: string, approverId: string, comments?: string): Promise<boolean>;
  rejectRequisitionStep(stepId: string, approverId: string, comments: string): Promise<boolean>;
  
  // Inventory Management
  getInventory(): Promise<Inventory[]>;
  getInventoryItem(id: string): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory | undefined>;
  deleteInventoryItem(id: string): Promise<boolean>;
  getLowStockItems(): Promise<Inventory[]>;
  
  // Stock Movements
  getStockMovements(inventoryId?: string): Promise<StockMovement[]>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  updateInventoryStock(inventoryId: string, quantity: number, movementType: 'in' | 'out' | 'adjustment', reason: string, userId: string): Promise<void>;
  
  // Cost Centers
  getCostCenters(): Promise<CostCenter[]>;
  getCostCenter(id: string): Promise<CostCenter | undefined>;
  createCostCenter(costCenter: InsertCostCenter): Promise<CostCenter>;
  updateCostCenter(id: string, costCenter: Partial<InsertCostCenter>): Promise<CostCenter | undefined>;
  deleteCostCenter(id: string): Promise<boolean>;
  
  // Report Templates
  getReportTemplates(): Promise<ReportTemplate[]>;
  getReportTemplate(id: string): Promise<ReportTemplate | undefined>;
  createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate>;
  updateReportTemplate(id: string, template: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined>;
  deleteReportTemplate(id: string): Promise<boolean>;
  generateReport(templateId: string, filters?: Record<string, any>): Promise<any>;
  
  // Email Templates
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: string): Promise<boolean>;
  sendEmail(templateId: string, recipientEmail: string, variables: Record<string, any>): Promise<boolean>;
  
  // Contracts Management
  getContracts(): Promise<Contract[]>;
  getContract(id: string): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract | undefined>;
  deleteContract(id: string): Promise<boolean>;
  getExpiringContracts(days?: number): Promise<Contract[]>;
  
  // Receipts Management
  getReceipts(): Promise<Receipt[]>;
  getReceipt(id: string): Promise<Receipt | undefined>;
  getReceiptsByPO(purchaseOrderId: string): Promise<Receipt[]>;
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  updateReceipt(id: string, receipt: Partial<InsertReceipt>): Promise<Receipt | undefined>;
  deleteReceipt(id: string): Promise<boolean>;
  
  // Supplier Qualifications
  getSupplierQualifications(): Promise<SupplierQualification[]>;
  getSupplierQualification(id: string): Promise<SupplierQualification | undefined>;
  getQualificationBySupplier(supplierId: string): Promise<SupplierQualification | undefined>;
  createSupplierQualification(qualification: InsertSupplierQualification): Promise<SupplierQualification>;
  updateSupplierQualification(id: string, qualification: Partial<InsertSupplierQualification>): Promise<SupplierQualification | undefined>;
  deleteSupplierQualification(id: string): Promise<boolean>;
  
  // Auto PO Generation
  generatePurchaseOrderFromQuote(quoteId: string, createdBy: string): Promise<PurchaseOrder>;
  
  sessionStore: any;
  
  // RFP (Request for Proposal) Management
  getRfpRequests(): Promise<RfpRequest[]>;
  getRfpRequest(id: string): Promise<RfpRequest | undefined>;
  getRfpRequestsByRequisition(requisitionId: string): Promise<RfpRequest[]>;
  createRfpRequest(rfp: InsertRfpRequest): Promise<RfpRequest>;
  updateRfpRequest(id: string, rfp: Partial<InsertRfpRequest>): Promise<RfpRequest | undefined>;
  sendRfpToSuppliers(rfpId: string, supplierIds: string[]): Promise<boolean>;

  // Quote Comparisons
  getQuoteComparisons(): Promise<QuoteComparison[]>;
  getQuoteComparison(id: string): Promise<QuoteComparison | undefined>;
  getQuoteComparisonsByRequisition(requisitionId: string): Promise<QuoteComparison[]>;
  createQuoteComparison(comparison: InsertQuoteComparison): Promise<QuoteComparison>;
  updateQuoteComparison(id: string, comparison: Partial<InsertQuoteComparison>): Promise<QuoteComparison | undefined>;
  calculateQuoteScores(comparisonId: string): Promise<any>;

  // Negotiation Management
  getNegotiations(): Promise<Negotiation[]>;
  getNegotiation(id: string): Promise<Negotiation | undefined>;
  getNegotiationsByQuote(quoteId: string): Promise<Negotiation[]>;
  createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation>;
  updateNegotiation(id: string, negotiation: Partial<InsertNegotiation>): Promise<Negotiation | undefined>;
  sendNegotiationEmail(negotiationId: string): Promise<boolean>;
}

// In-Memory Storage Implementation for migration compatibility
class MemoryStorage implements IStorage {
  private users: User[] = [];
  private suppliers: Supplier[] = [];
  private requisitions: Requisition[] = [];
  private quotes: Quote[] = [];
  private purchaseOrders: PurchaseOrder[] = [];
  private activities: Activity[] = [];
  private approvalRules: ApprovalRule[] = [];
  private approvalSteps: ApprovalStep[] = [];
  private notifications: Notification[] = [];
  private rfpRequests: RfpRequest[] = [];
  private quoteComparisons: QuoteComparison[] = [];
  private negotiations: Negotiation[] = [];
  private inventory: Inventory[] = [];
  private stockMovements: StockMovement[] = [];
  private costCenters: CostCenter[] = [];
  private reportTemplates: ReportTemplate[] = [];
  private emailTemplates: EmailTemplate[] = [];
  private contracts: Contract[] = [];
  private receipts: Receipt[] = [];
  private supplierQualifications: SupplierQualification[] = [];
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemorySessionStore({ checkPeriod: 86400000 });
  }

  // Helper method to generate IDs
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // User methods
  async getUsers(): Promise<User[]> { return [...this.users]; }
  async getUser(id: string): Promise<User | undefined> { return this.users.find(u => u.id === id); }
  async getUserByUsername(username: string): Promise<User | undefined> { return this.users.find(u => u.username === username); }
  async getUserByEmail(email: string): Promise<User | undefined> { return this.users.find(u => u.email === email); }
  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = { 
      ...user, 
      id: this.generateId(), 
      role: user.role || "user",
      department: user.department || null,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.users.push(newUser);
    return newUser;
  }

  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> { return [...this.suppliers]; }
  async getSupplier(id: string): Promise<Supplier | undefined> { return this.suppliers.find(s => s.id === id); }
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const newSupplier: Supplier = { 
      ...supplier, 
      id: this.generateId(), 
      status: supplier.status || "active",
      rating: supplier.rating || "0",
      totalOrders: supplier.totalOrders || 0,
      performanceScore: supplier.performanceScore || "0",
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.suppliers.push(newSupplier);
    return newSupplier;
  }
  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.suppliers[index] = { ...this.suppliers[index], ...supplier, updatedAt: new Date() };
    return this.suppliers[index];
  }
  async deleteSupplier(id: string): Promise<boolean> {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.suppliers.splice(index, 1);
    return true;
  }

  // Requisition methods
  async getRequisitions(): Promise<Requisition[]> { return [...this.requisitions]; }
  async getRequisition(id: string): Promise<Requisition | undefined> { return this.requisitions.find(r => r.id === id); }
  async getRequisitionsByUser(userId: string): Promise<Requisition[]> { return this.requisitions.filter(r => r.requesterId === userId); }
  async createRequisition(requisition: InsertRequisition): Promise<Requisition> {
    const reqNumber = `REQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const newRequisition: Requisition = { 
      ...requisition, 
      id: this.generateId(), 
      requisitionNumber: reqNumber, 
      status: requisition.status || "pending",
      urgency: requisition.urgency || "normal",
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.requisitions.push(newRequisition);
    return newRequisition;
  }
  async updateRequisition(id: string, requisition: Partial<InsertRequisition>): Promise<Requisition | undefined> {
    const index = this.requisitions.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.requisitions[index] = { ...this.requisitions[index], ...requisition, updatedAt: new Date() };
    return this.requisitions[index];
  }

  // Quote methods
  async getQuotes(): Promise<Quote[]> { return [...this.quotes]; }
  async getQuote(id: string): Promise<Quote | undefined> { return this.quotes.find(q => q.id === id); }
  async getQuotesByRequisition(requisitionId: string): Promise<Quote[]> { return this.quotes.filter(q => q.requisitionId === requisitionId); }
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const quoteNumber = `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const newQuote: Quote = { 
      ...quote, 
      id: this.generateId(), 
      quoteNumber, 
      status: quote.status || "pending",
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.quotes.push(newQuote);
    return newQuote;
  }
  async updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote | undefined> {
    const index = this.quotes.findIndex(q => q.id === id);
    if (index === -1) return undefined;
    this.quotes[index] = { ...this.quotes[index], ...quote, updatedAt: new Date() };
    return this.quotes[index];
  }

  // Purchase Order methods
  async getPurchaseOrders(): Promise<PurchaseOrder[]> { return [...this.purchaseOrders]; }
  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> { return this.purchaseOrders.find(po => po.id === id); }
  async createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const poNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const newPO: PurchaseOrder = { ...po, id: this.generateId(), poNumber, createdAt: new Date(), updatedAt: new Date() };
    this.purchaseOrders.push(newPO);
    return newPO;
  }
  async updatePurchaseOrder(id: string, po: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const index = this.purchaseOrders.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.purchaseOrders[index] = { ...this.purchaseOrders[index], ...po, updatedAt: new Date() };
    return this.purchaseOrders[index];
  }

  // Activity methods
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const newActivity: Activity = { ...activity, id: this.generateId(), createdAt: new Date() };
    this.activities.push(newActivity);
    return newActivity;
  }
  async getRecentActivities(limit = 10): Promise<Activity[]> {
    return this.activities.slice(-limit);
  }

  // Dashboard methods
  async getDashboardStats() {
    return {
      pendingRequisitions: this.requisitions.filter(r => r.status === 'pending').length,
      totalSavings: "15000.00",
      avgProcessingTime: 3.2,
      activeSuppliers: this.suppliers.filter(s => s.status === 'active').length
    };
  }

  // Simplified implementations for all other required methods
  async getApprovalRules(): Promise<ApprovalRule[]> { return [...this.approvalRules]; }
  async getApprovalRule(id: string): Promise<ApprovalRule | undefined> { return this.approvalRules.find(r => r.id === id); }
  async createApprovalRule(rule: InsertApprovalRule): Promise<ApprovalRule> {
    const newRule: ApprovalRule = { ...rule, id: this.generateId(), createdAt: new Date(), updatedAt: new Date() };
    this.approvalRules.push(newRule);
    return newRule;
  }
  async updateApprovalRule(id: string, rule: Partial<InsertApprovalRule>): Promise<ApprovalRule | undefined> {
    const index = this.approvalRules.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.approvalRules[index] = { ...this.approvalRules[index], ...rule, updatedAt: new Date() };
    return this.approvalRules[index];
  }
  async deleteApprovalRule(id: string): Promise<boolean> {
    const index = this.approvalRules.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.approvalRules.splice(index, 1);
    return true;
  }
  async getApplicableRules(amount: number, category?: string, department?: string): Promise<ApprovalRule[]> {
    return this.approvalRules.filter(rule => 
      (!rule.minAmount || Number(rule.minAmount) <= amount) &&
      (!rule.maxAmount || Number(rule.maxAmount) >= amount) &&
      (!rule.category || rule.category === category) &&
      (!rule.department || rule.department === department)
    );
  }

  // Approval steps
  async getApprovalSteps(requisitionId: string): Promise<ApprovalStep[]> { 
    return this.approvalSteps.filter(s => s.requisitionId === requisitionId); 
  }
  async createApprovalStep(step: InsertApprovalStep): Promise<ApprovalStep> {
    const newStep: ApprovalStep = { ...step, id: this.generateId(), createdAt: new Date(), updatedAt: new Date() };
    this.approvalSteps.push(newStep);
    return newStep;
  }
  async updateApprovalStep(id: string, step: Partial<InsertApprovalStep>): Promise<ApprovalStep | undefined> {
    const index = this.approvalSteps.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.approvalSteps[index] = { ...this.approvalSteps[index], ...step, updatedAt: new Date() };
    return this.approvalSteps[index];
  }
  async getPendingApprovalsForUser(userId: string): Promise<ApprovalStep[]> {
    return this.approvalSteps.filter(s => s.approverId === userId && s.status === 'pending');
  }

  // Notifications
  async getUserNotifications(userId: string, limit = 10): Promise<Notification[]> {
    return this.notifications.filter(n => n.userId === userId).slice(-limit);
  }
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotification: Notification = { ...notification, id: this.generateId(), createdAt: new Date() };
    this.notifications.push(newNotification);
    return newNotification;
  }
  async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return false;
    notification.isRead = true;
    return true;
  }
  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    this.notifications.filter(n => n.userId === userId).forEach(n => n.isRead = true);
    return true;
  }
  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.notifications.filter(n => n.userId === userId && !n.isRead).length;
  }

  // Approval workflow methods
  async processRequisitionApproval(requisitionId: string): Promise<ApprovalStep[]> {
    const requisition = await this.getRequisition(requisitionId);
    if (!requisition) return [];
    
    const rules = await this.getApplicableRules(Number(requisition.estimatedAmount), requisition.category);
    const steps: ApprovalStep[] = [];
    
    for (const rule of rules) {
      const step = await this.createApprovalStep({
        requisitionId,
        ruleId: rule.id,
        approverId: rule.approvers[0], // Simplified - take first approver
        stepOrder: steps.length + 1,
        status: 'pending'
      });
      steps.push(step);
    }
    
    return steps;
  }
  async approveRequisitionStep(stepId: string, approverId: string, comments?: string): Promise<boolean> {
    const step = this.approvalSteps.find(s => s.id === stepId);
    if (!step || step.approverId !== approverId) return false;
    
    step.status = 'approved';
    step.comments = comments;
    step.approvedAt = new Date();
    return true;
  }
  async rejectRequisitionStep(stepId: string, approverId: string, comments: string): Promise<boolean> {
    const step = this.approvalSteps.find(s => s.id === stepId);
    if (!step || step.approverId !== approverId) return false;
    
    step.status = 'rejected';
    step.comments = comments;
    step.rejectedAt = new Date();
    return true;
  }

  // Simplified implementations for remaining methods
  async getInventory(): Promise<Inventory[]> { return [...this.inventory]; }
  async getInventoryItem(id: string): Promise<Inventory | undefined> { return this.inventory.find(i => i.id === id); }
  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const newItem: Inventory = { ...item, id: this.generateId(), createdAt: new Date(), updatedAt: new Date() };
    this.inventory.push(newItem);
    return newItem;
  }
  async updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const index = this.inventory.findIndex(i => i.id === id);
    if (index === -1) return undefined;
    this.inventory[index] = { ...this.inventory[index], ...item, updatedAt: new Date() };
    return this.inventory[index];
  }
  async deleteInventoryItem(id: string): Promise<boolean> {
    const index = this.inventory.findIndex(i => i.id === id);
    if (index === -1) return false;
    this.inventory.splice(index, 1);
    return true;
  }
  async getLowStockItems(): Promise<Inventory[]> {
    return this.inventory.filter(item => item.currentStock <= (item.minStock || 0));
  }

  async getStockMovements(inventoryId?: string): Promise<StockMovement[]> {
    return inventoryId ? this.stockMovements.filter(m => m.inventoryId === inventoryId) : [...this.stockMovements];
  }
  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const newMovement: StockMovement = { ...movement, id: this.generateId(), createdAt: new Date() };
    this.stockMovements.push(newMovement);
    return newMovement;
  }
  async updateInventoryStock(inventoryId: string, quantity: number, movementType: 'in' | 'out' | 'adjustment', reason: string, userId: string): Promise<void> {
    // Simplified implementation
    const item = this.inventory.find(i => i.id === inventoryId);
    if (item) {
      if (movementType === 'in') item.currentStock += quantity;
      else if (movementType === 'out') item.currentStock -= quantity;
      else item.currentStock = quantity;
    }
  }

  // Cost Centers
  async getCostCenters(): Promise<CostCenter[]> { return [...this.costCenters]; }
  async getCostCenter(id: string): Promise<CostCenter | undefined> { return this.costCenters.find(c => c.id === id); }
  async createCostCenter(costCenter: InsertCostCenter): Promise<CostCenter> {
    const newCenter: CostCenter = { ...costCenter, id: this.generateId(), createdAt: new Date(), updatedAt: new Date() };
    this.costCenters.push(newCenter);
    return newCenter;
  }
  async updateCostCenter(id: string, costCenter: Partial<InsertCostCenter>): Promise<CostCenter | undefined> {
    const index = this.costCenters.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.costCenters[index] = { ...this.costCenters[index], ...costCenter, updatedAt: new Date() };
    return this.costCenters[index];
  }
  async deleteCostCenter(id: string): Promise<boolean> {
    const index = this.costCenters.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.costCenters.splice(index, 1);
    return true;
  }

  // Report Templates
  async getReportTemplates(): Promise<ReportTemplate[]> { return [...this.reportTemplates]; }
  async getReportTemplate(id: string): Promise<ReportTemplate | undefined> { return this.reportTemplates.find(t => t.id === id); }
  async createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate> {
    const newTemplate: ReportTemplate = { ...template, id: this.generateId(), createdAt: new Date(), updatedAt: new Date() };
    this.reportTemplates.push(newTemplate);
    return newTemplate;
  }
  async updateReportTemplate(id: string, template: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined> {
    const index = this.reportTemplates.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    this.reportTemplates[index] = { ...this.reportTemplates[index], ...template, updatedAt: new Date() };
    return this.reportTemplates[index];
  }
  async deleteReportTemplate(id: string): Promise<boolean> {
    const index = this.reportTemplates.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.reportTemplates.splice(index, 1);
    return true;
  }
  async generateReport(templateId: string, filters?: Record<string, any>): Promise<any> {
    return { message: "Report generation not implemented in memory storage" };
  }

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> { return [...this.emailTemplates]; }
  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> { return this.emailTemplates.find(t => t.id === id); }
  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = { ...template, id: this.generateId(), createdAt: new Date(), updatedAt: new Date() };
    this.emailTemplates.push(newTemplate);
    return newTemplate;
  }
  async updateEmailTemplate(id: string, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const index = this.emailTemplates.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    this.emailTemplates[index] = { ...this.emailTemplates[index], ...template, updatedAt: new Date() };
    return this.emailTemplates[index];
  }
  async deleteEmailTemplate(id: string): Promise<boolean> {
    const index = this.emailTemplates.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.emailTemplates.splice(index, 1);
    return true;
  }
  async sendEmail(templateId: string, recipientEmail: string, variables: Record<string, any>): Promise<boolean> {
    console.log(`Email simulation: sent to ${recipientEmail} using template ${templateId}`);
    return true;
  }

  // Contracts
  async getContracts(): Promise<Contract[]> { return [...this.contracts]; }
  async getContract(id: string): Promise<Contract | undefined> { return this.contracts.find(c => c.id === id); }
  async createContract(contract: InsertContract): Promise<Contract> {
    const contractNumber = `CNT-${Date.now()}`;
    const newContract: Contract = { ...contract, id: this.generateId(), contractNumber, createdAt: new Date(), updatedAt: new Date() };
    this.contracts.push(newContract);
    return newContract;
  }
  async updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract | undefined> {
    const index = this.contracts.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.contracts[index] = { ...this.contracts[index], ...contract, updatedAt: new Date() };
    return this.contracts[index];
  }
  async deleteContract(id: string): Promise<boolean> {
    const index = this.contracts.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.contracts.splice(index, 1);
    return true;
  }
  async getExpiringContracts(days = 30): Promise<Contract[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return this.contracts.filter(c => c.status === 'active' && new Date(c.endDate) <= futureDate);
  }

  // RFP Management (simplified)
  async getRfpRequests(): Promise<RfpRequest[]> { return [...this.rfpRequests]; }
  async getRfpRequest(id: string): Promise<RfpRequest | undefined> { return this.rfpRequests.find(r => r.id === id); }
  async getRfpRequestsByRequisition(requisitionId: string): Promise<RfpRequest[]> { return this.rfpRequests.filter(r => r.requisitionId === requisitionId); }
  async createRfpRequest(rfp: InsertRfpRequest): Promise<RfpRequest> {
    const newRfp: RfpRequest = { ...rfp, id: this.generateId(), createdAt: new Date(), updatedAt: new Date() };
    this.rfpRequests.push(newRfp);
    return newRfp;
  }
  async updateRfpRequest(id: string, rfp: Partial<InsertRfpRequest>): Promise<RfpRequest | undefined> {
    const index = this.rfpRequests.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.rfpRequests[index] = { ...this.rfpRequests[index], ...rfp, updatedAt: new Date() };
    return this.rfpRequests[index];
  }
  async sendRfpToSuppliers(rfpId: string, supplierIds: string[]): Promise<boolean> {
    console.log(`RFP ${rfpId} sent to suppliers: ${supplierIds.join(', ')}`);
    return true;
  }

  // Quote Comparisons (simplified)
  async getQuoteComparisons(): Promise<QuoteComparison[]> { return [...this.quoteComparisons]; }
  async getQuoteComparison(id: string): Promise<QuoteComparison | undefined> { return this.quoteComparisons.find(c => c.id === id); }
  async getQuoteComparisonsByRequisition(requisitionId: string): Promise<QuoteComparison[]> { return this.quoteComparisons.filter(c => c.requisitionId === requisitionId); }
  async createQuoteComparison(comparison: InsertQuoteComparison): Promise<QuoteComparison> {
    const newComparison: QuoteComparison = { ...comparison, id: this.generateId(), createdAt: new Date(), updatedAt: new Date() };
    this.quoteComparisons.push(newComparison);
    return newComparison;
  }
  async updateQuoteComparison(id: string, comparison: Partial<InsertQuoteComparison>): Promise<QuoteComparison | undefined> {
    const index = this.quoteComparisons.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.quoteComparisons[index] = { ...this.quoteComparisons[index], ...comparison, updatedAt: new Date() };
    return this.quoteComparisons[index];
  }
  async calculateQuoteScores(comparisonId: string): Promise<any> {
    return { message: "Quote scoring not implemented in memory storage" };
  }

  // Negotiations (simplified)
  async getNegotiations(): Promise<Negotiation[]> { return [...this.negotiations]; }
  async getNegotiation(id: string): Promise<Negotiation | undefined> { return this.negotiations.find(n => n.id === id); }
  async getNegotiationsByQuote(quoteId: string): Promise<Negotiation[]> { return this.negotiations.filter(n => n.quoteId === quoteId); }
  async createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation> {
    const newNegotiation: Negotiation = { ...negotiation, id: this.generateId(), createdAt: new Date(), updatedAt: new Date() };
    this.negotiations.push(newNegotiation);
    return newNegotiation;
  }
  async updateNegotiation(id: string, negotiation: Partial<InsertNegotiation>): Promise<Negotiation | undefined> {
    const index = this.negotiations.findIndex(n => n.id === id);
    if (index === -1) return undefined;
    this.negotiations[index] = { ...this.negotiations[index], ...negotiation, updatedAt: new Date() };
    return this.negotiations[index];
  }
  async sendNegotiationEmail(negotiationId: string): Promise<boolean> {
    console.log(`Negotiation email sent for negotiation ${negotiationId}`);
    return true;
  }

  // Receipts Management (MemStorage implementation)
  async getReceipts(): Promise<Receipt[]> { return [...this.receipts]; }
  async getReceipt(id: string): Promise<Receipt | undefined> { return this.receipts.find(r => r.id === id); }
  async getReceiptsByPO(purchaseOrderId: string): Promise<Receipt[]> { 
    return this.receipts.filter(r => r.purchaseOrderId === purchaseOrderId); 
  }
  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const receiptNumber = `RCT-${Date.now()}`;
    const newReceipt: Receipt = { 
      ...receipt, 
      id: this.generateId(), 
      receiptNumber,
      receivedDate: new Date(),
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.receipts.push(newReceipt);
    return newReceipt;
  }
  async updateReceipt(id: string, receipt: Partial<InsertReceipt>): Promise<Receipt | undefined> {
    const index = this.receipts.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.receipts[index] = { ...this.receipts[index], ...receipt, updatedAt: new Date() };
    return this.receipts[index];
  }
  async deleteReceipt(id: string): Promise<boolean> {
    const index = this.receipts.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.receipts.splice(index, 1);
    return true;
  }

  // Supplier Qualifications (MemStorage implementation)
  async getSupplierQualifications(): Promise<SupplierQualification[]> { return [...this.supplierQualifications]; }
  async getSupplierQualification(id: string): Promise<SupplierQualification | undefined> { 
    return this.supplierQualifications.find(q => q.id === id); 
  }
  async getQualificationBySupplier(supplierId: string): Promise<SupplierQualification | undefined> { 
    return this.supplierQualifications.find(q => q.supplierId === supplierId); 
  }
  async createSupplierQualification(qualification: InsertSupplierQualification): Promise<SupplierQualification> {
    const newQualification: SupplierQualification = { 
      ...qualification, 
      id: this.generateId(), 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.supplierQualifications.push(newQualification);
    return newQualification;
  }
  async updateSupplierQualification(id: string, qualification: Partial<InsertSupplierQualification>): Promise<SupplierQualification | undefined> {
    const index = this.supplierQualifications.findIndex(q => q.id === id);
    if (index === -1) return undefined;
    this.supplierQualifications[index] = { ...this.supplierQualifications[index], ...qualification, updatedAt: new Date() };
    return this.supplierQualifications[index];
  }
  async deleteSupplierQualification(id: string): Promise<boolean> {
    const index = this.supplierQualifications.findIndex(q => q.id === id);
    if (index === -1) return false;
    this.supplierQualifications.splice(index, 1);
    return true;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    if (pool) {
      this.sessionStore = new PostgresSessionStore({ 
        pool, 
        createTableIfMissing: true 
      });
    } else {
      this.sessionStore = new MemorySessionStore({ checkPeriod: 86400000 });
    }
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db
      .insert(suppliers)
      .values(supplier)
      .returning();
    return newSupplier;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updated] = await db
      .update(suppliers)
      .set({ ...supplier, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Requisition methods
  async getRequisitions(): Promise<Requisition[]> {
    return await db.select().from(requisitions).orderBy(desc(requisitions.createdAt));
  }

  async getRequisition(id: string): Promise<Requisition | undefined> {
    const [requisition] = await db.select().from(requisitions).where(eq(requisitions.id, id));
    return requisition || undefined;
  }

  async getRequisitionsByUser(userId: string): Promise<Requisition[]> {
    return await db
      .select()
      .from(requisitions)
      .where(eq(requisitions.requesterId, userId))
      .orderBy(desc(requisitions.createdAt));
  }

  async createRequisition(requisition: InsertRequisition): Promise<Requisition> {
    const reqNumber = `REQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const [newRequisition] = await db
      .insert(requisitions)
      .values({ ...requisition, requisitionNumber: reqNumber })
      .returning();
    return newRequisition;
  }

  async updateRequisition(id: string, requisition: Partial<InsertRequisition>): Promise<Requisition | undefined> {
    const [updated] = await db
      .update(requisitions)
      .set({ ...requisition, updatedAt: new Date() })
      .where(eq(requisitions.id, id))
      .returning();
    return updated || undefined;
  }

  // Quote methods
  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || undefined;
  }

  async getQuotesByRequisition(requisitionId: string): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.requisitionId, requisitionId))
      .orderBy(desc(quotes.createdAt));
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const quoteNumber = `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const [newQuote] = await db
      .insert(quotes)
      .values({ ...quote, quoteNumber })
      .returning();
    return newQuote;
  }

  async updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updated] = await db
      .update(quotes)
      .set({ ...quote, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return updated || undefined;
  }

  // Purchase Order methods
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return po || undefined;
  }

  async createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const poNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const [newPO] = await db
      .insert(purchaseOrders)
      .values({ ...po, poNumber })
      .returning();
    return newPO;
  }

  async updatePurchaseOrder(id: string, po: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const [updated] = await db
      .update(purchaseOrders)
      .set({ ...po, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id))
      .returning();
    return updated || undefined;
  }

  // Activity methods
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getRecentActivities(limit = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  // Dashboard analytics
  async getDashboardStats() {
    const [pendingReqs] = await db
      .select({ count: count() })
      .from(requisitions)
      .where(eq(requisitions.status, 'pending'));

    const [activeSupps] = await db
      .select({ count: count() })
      .from(suppliers)
      .where(eq(suppliers.status, 'active'));

    // Calculate total savings from approved vs initial estimates
    const [savingsData] = await db
      .select({ 
        totalEstimated: sum(requisitions.estimatedAmount),
        count: count()
      })
      .from(requisitions)
      .where(eq(requisitions.status, 'approved'));

    // Calculate average processing time for completed requisitions
    const completedReqs = await db
      .select({ 
        createdAt: requisitions.createdAt,
        updatedAt: requisitions.updatedAt 
      })
      .from(requisitions)
      .where(eq(requisitions.status, 'approved'))
      .limit(50);

    let avgProcessingTime = 3.2;
    if (completedReqs.length > 0) {
      const totalDays = completedReqs.reduce((acc, req) => {
        if (req.createdAt && req.updatedAt) {
          const diffTime = new Date(req.updatedAt).getTime() - new Date(req.createdAt).getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          return acc + diffDays;
        }
        return acc;
      }, 0);
      avgProcessingTime = Math.round((totalDays / completedReqs.length) * 10) / 10;
    }

    // Estimated savings calculation (10% improvement over manual process)
    const estimatedSavings = savingsData.totalEstimated ? 
      Math.round(Number(savingsData.totalEstimated) * 0.1).toString() : "12700";

    return {
      pendingRequisitions: pendingReqs.count,
      totalSavings: estimatedSavings,
      avgProcessingTime,
      activeSuppliers: activeSupps.count,
    };
  }

  // Approval Rules methods
  async getApprovalRules(): Promise<ApprovalRule[]> {
    return await db.select().from(approvalRules).where(eq(approvalRules.isActive, true)).orderBy(approvalRules.level);
  }

  async getApprovalRule(id: string): Promise<ApprovalRule | undefined> {
    const [rule] = await db.select().from(approvalRules).where(eq(approvalRules.id, id));
    return rule || undefined;
  }

  async createApprovalRule(rule: InsertApprovalRule): Promise<ApprovalRule> {
    const [newRule] = await db.insert(approvalRules).values(rule).returning();
    return newRule;
  }

  async updateApprovalRule(id: string, rule: Partial<InsertApprovalRule>): Promise<ApprovalRule | undefined> {
    const [updated] = await db
      .update(approvalRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(approvalRules.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteApprovalRule(id: string): Promise<boolean> {
    const [updated] = await db
      .update(approvalRules)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(approvalRules.id, id))
      .returning();
    return !!updated;
  }

  async getApplicableRules(amount: number, category?: string, department?: string): Promise<ApprovalRule[]> {
    const conditions = [
      eq(approvalRules.isActive, true),
      gte(sql`${amount}`, approvalRules.minAmount)
    ];

    if (amount > 0) {
      conditions.push(
        or(
          sql`${approvalRules.maxAmount} IS NULL`,
          lte(sql`${amount}`, approvalRules.maxAmount)
        )!
      );
    }

    if (category) {
      conditions.push(
        or(
          sql`${approvalRules.category} IS NULL`,
          eq(approvalRules.category, category)
        )!
      );
    }

    if (department) {
      conditions.push(
        or(
          sql`${approvalRules.department} IS NULL`,
          eq(approvalRules.department, department)
        )!
      );
    }

    return await db
      .select()
      .from(approvalRules)
      .where(and(...conditions))
      .orderBy(approvalRules.level);
  }

  // Approval Steps methods
  async getApprovalSteps(requisitionId: string): Promise<ApprovalStep[]> {
    return await db
      .select()
      .from(approvalSteps)
      .where(eq(approvalSteps.requisitionId, requisitionId))
      .orderBy(approvalSteps.level);
  }

  async createApprovalStep(step: InsertApprovalStep): Promise<ApprovalStep> {
    const [newStep] = await db.insert(approvalSteps).values(step).returning();
    return newStep;
  }

  async updateApprovalStep(id: string, step: Partial<InsertApprovalStep>): Promise<ApprovalStep | undefined> {
    const [updated] = await db
      .update(approvalSteps)
      .set(step)
      .where(eq(approvalSteps.id, id))
      .returning();
    return updated || undefined;
  }

  async getPendingApprovalsForUser(userId: string): Promise<ApprovalStep[]> {
    return await db
      .select()
      .from(approvalSteps)
      .where(
        and(
          eq(approvalSteps.approverId, userId),
          eq(approvalSteps.status, "pending")
        )
      )
      .orderBy(desc(approvalSteps.createdAt));
  }

  // Notifications methods
  async getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return !!updated;
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return (result.rowCount || 0) > 0;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.count;
  }

  // Approval workflow methods
  async processRequisitionApproval(requisitionId: string): Promise<ApprovalStep[]> {
    // Get the requisition details
    const requisition = await this.getRequisition(requisitionId);
    if (!requisition) throw new Error("Requisition not found");

    const requester = await this.getUser(requisition.requesterId);
    if (!requester) throw new Error("Requester not found");

    // Get applicable approval rules
    const rules = await this.getApplicableRules(
      parseFloat(requisition.estimatedAmount),
      requisition.category,
      requester.department || undefined
    );

    const approvalSteps: ApprovalStep[] = [];

    // Create approval steps for each applicable rule
    for (const rule of rules) {
      let approverId: string;

      if (rule.approverUserId) {
        approverId = rule.approverUserId;
      } else {
        // Find users with the required role
        const approvers = await db
          .select()
          .from(users)
          .where(eq(users.role, rule.approverRole));

        if (approvers.length === 0) {
          throw new Error(`No approver found with role: ${rule.approverRole}`);
        }

        // For simplicity, take the first approver. In a real system, you might implement
        // more sophisticated logic (round-robin, department-based, etc.)
        approverId = approvers[0].id;
      }

      const step = await this.createApprovalStep({
        requisitionId,
        ruleId: rule.id,
        approverId,
        level: rule.level,
        status: "pending"
      });

      approvalSteps.push(step);

      // Create notification for the approver
      await this.createNotification({
        userId: approverId,
        title: "New Approval Required",
        message: `Requisition ${requisition.requisitionNumber} requires your approval. Amount: $${requisition.estimatedAmount}`,
        type: "warning",
        entityType: "requisition",
        entityId: requisitionId
      });
    }

    return approvalSteps;
  }

  async approveRequisitionStep(stepId: string, approverId: string, comments?: string): Promise<boolean> {
    // Update the approval step
    const step = await this.updateApprovalStep(stepId, {
      status: "approved",
      comments,
      approvedAt: new Date()
    });

    if (!step) return false;

    // Check if all steps for this requisition are approved
    const allSteps = await this.getApprovalSteps(step.requisitionId);
    const allApproved = allSteps.every(s => s.status === "approved");

    if (allApproved) {
      // Update requisition status to approved
      await this.updateRequisition(step.requisitionId, {
        status: "approved",
        approvedBy: approverId,
        approvedAt: new Date()
      });

      // Get requisition and requester for notification
      const requisition = await this.getRequisition(step.requisitionId);
      if (requisition) {
        await this.createNotification({
          userId: requisition.requesterId,
          title: "Requisition Approved",
          message: `Your requisition ${requisition.requisitionNumber} has been fully approved.`,
          type: "success",
          entityType: "requisition",
          entityId: step.requisitionId
        });
      }
    }

    return true;
  }

  async rejectRequisitionStep(stepId: string, approverId: string, comments: string): Promise<boolean> {
    const step = await this.updateApprovalStep(stepId, {
      status: "rejected",
      comments,
      approvedAt: new Date()
    });

    if (!step) return false;

    // Update requisition status to rejected
    await this.updateRequisition(step.requisitionId, {
      status: "rejected",
      rejectionReason: comments
    });

    // Get requisition and requester for notification
    const requisition = await this.getRequisition(step.requisitionId);
    if (requisition) {
      await this.createNotification({
        userId: requisition.requesterId,
        title: "Requisition Rejected",
        message: `Your requisition ${requisition.requisitionNumber} has been rejected. Reason: ${comments}`,
        type: "error",
        entityType: "requisition",
        entityId: step.requisitionId
      });
    }

    return true;
  }

  // RFP Management Methods
  async getRfpRequests(): Promise<RfpRequest[]> {
    return await db.select().from(rfpRequests).orderBy(desc(rfpRequests.createdAt));
  }

  async getRfpRequest(id: string): Promise<RfpRequest | undefined> {
    const [rfp] = await db.select().from(rfpRequests).where(eq(rfpRequests.id, id));
    return rfp || undefined;
  }

  async getRfpRequestsByRequisition(requisitionId: string): Promise<RfpRequest[]> {
    return await db.select().from(rfpRequests)
      .where(eq(rfpRequests.requisitionId, requisitionId))
      .orderBy(desc(rfpRequests.createdAt));
  }

  async createRfpRequest(rfp: InsertRfpRequest): Promise<RfpRequest> {
    const [newRfp] = await db.insert(rfpRequests).values(rfp).returning();
    return newRfp;
  }

  async updateRfpRequest(id: string, rfp: Partial<InsertRfpRequest>): Promise<RfpRequest | undefined> {
    const [updated] = await db.update(rfpRequests)
      .set({ ...rfp, updatedAt: new Date() })
      .where(eq(rfpRequests.id, id))
      .returning();
    return updated || undefined;
  }

  async sendRfpToSuppliers(rfpId: string, supplierIds: string[]): Promise<boolean> {
    try {
      // Update RFP status to sent
      await this.updateRfpRequest(rfpId, {
        status: "sent",
        sentAt: new Date(),
        selectedSuppliers: supplierIds,
        emailsSent: supplierIds.length
      });

      // Create quotes for each supplier 
      const rfp = await this.getRfpRequest(rfpId);
      if (!rfp) return false;

      for (const supplierId of supplierIds) {
        await this.createQuote({
          requisitionId: rfp.requisitionId,
          supplierId: supplierId,
          totalAmount: "0",
          status: "pending",
          isRfpSent: true,
          rfpSentAt: new Date()
        });
      }

      return true;
    } catch (error) {
      console.error("Error sending RFP to suppliers:", error);
      return false;
    }
  }

  // Quote Comparison Methods
  async getQuoteComparisons(): Promise<QuoteComparison[]> {
    return await db.select().from(quoteComparisons).orderBy(desc(quoteComparisons.createdAt));
  }

  async getQuoteComparison(id: string): Promise<QuoteComparison | undefined> {
    const [comparison] = await db.select().from(quoteComparisons).where(eq(quoteComparisons.id, id));
    return comparison || undefined;
  }

  async getQuoteComparisonsByRequisition(requisitionId: string): Promise<QuoteComparison[]> {
    return await db.select().from(quoteComparisons)
      .where(eq(quoteComparisons.requisitionId, requisitionId))
      .orderBy(desc(quoteComparisons.createdAt));
  }

  async createQuoteComparison(comparison: InsertQuoteComparison): Promise<QuoteComparison> {
    const [newComparison] = await db.insert(quoteComparisons).values(comparison).returning();
    return newComparison;
  }

  async updateQuoteComparison(id: string, comparison: Partial<InsertQuoteComparison>): Promise<QuoteComparison | undefined> {
    const [updated] = await db.update(quoteComparisons)
      .set({ ...comparison, updatedAt: new Date() })
      .where(eq(quoteComparisons.id, id))
      .returning();
    return updated || undefined;
  }

  async calculateQuoteScores(comparisonId: string): Promise<any> {
    const comparison = await this.getQuoteComparison(comparisonId);
    if (!comparison || !comparison.quoteIds) return null;

    const quoteData = await Promise.all(
      comparison.quoteIds.map(id => this.getQuote(id))
    );

    const validQuotes = quoteData.filter(q => q !== undefined);
    const criteria = comparison.criteria || ["price", "delivery", "quality"];
    const weights = comparison.weights?.map(Number) || [0.5, 0.3, 0.2];

    const scores = validQuotes.map(quote => {
      const priceScore = this.calculatePriceScore(quote!, validQuotes);
      const deliveryScore = this.calculateDeliveryScore(quote!);
      const qualityScore = this.calculateQualityScore(quote!);
      
      const totalScore = (priceScore * weights[0]) + 
                        (deliveryScore * weights[1]) + 
                        (qualityScore * weights[2]);

      return {
        quoteId: quote!.id,
        totalScore: Number(totalScore.toFixed(2)),
        breakdown: {
          price: priceScore,
          delivery: deliveryScore,
          quality: qualityScore
        }
      };
    });

    // Update comparison with scores
    await this.updateQuoteComparison(comparisonId, {
      scores: JSON.stringify(scores),
      recommendedQuoteId: scores.sort((a, b) => b.totalScore - a.totalScore)[0]?.quoteId
    });

    return scores;
  }

  private calculatePriceScore(quote: Quote, allQuotes: Quote[]): number {
    const prices = allQuotes.map(q => Number(q.totalAmount));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    
    if (range === 0) return 100;
    
    // Lower price = higher score (inverted scale)
    return ((maxPrice - Number(quote.totalAmount)) / range) * 100;
  }

  private calculateDeliveryScore(quote: Quote): number {
    // Default scoring based on delivery time
    const deliveryDays = quote.deliveryTime || 30;
    if (deliveryDays <= 7) return 100;
    if (deliveryDays <= 14) return 80;
    if (deliveryDays <= 21) return 60;
    if (deliveryDays <= 30) return 40;
    return 20;
  }

  private calculateQualityScore(quote: Quote): number {
    // Basic quality scoring - could be enhanced with supplier ratings
    return 75; // Default score
  }

  // Negotiation Methods
  async getNegotiations(): Promise<Negotiation[]> {
    return await db.select().from(negotiations).orderBy(desc(negotiations.createdAt));
  }

  async getNegotiation(id: string): Promise<Negotiation | undefined> {
    const [negotiation] = await db.select().from(negotiations).where(eq(negotiations.id, id));
    return negotiation || undefined;
  }

  async getNegotiationsByQuote(quoteId: string): Promise<Negotiation[]> {
    return await db.select().from(negotiations)
      .where(eq(negotiations.quoteId, quoteId))
      .orderBy(negotiations.round);
  }

  async createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation> {
    const [newNegotiation] = await db.insert(negotiations).values(negotiation).returning();
    
    // Update quote negotiation rounds
    const currentQuote = await this.getQuote(negotiation.quoteId);
    if (currentQuote) {
      await this.updateQuote(negotiation.quoteId, {
        status: "negotiating",
        negotiationRounds: (currentQuote.negotiationRounds || 0) + 1
      });
    }

    return newNegotiation;
  }

  async updateNegotiation(id: string, negotiation: Partial<InsertNegotiation>): Promise<Negotiation | undefined> {
    const [updated] = await db.update(negotiations)
      .set({ ...negotiation, updatedAt: new Date() })
      .where(eq(negotiations.id, id))
      .returning();
    return updated || undefined;
  }

  async sendNegotiationEmail(negotiationId: string): Promise<boolean> {
    try {
      // Mark negotiation email as sent
      await this.updateNegotiation(negotiationId, {
        emailSent: true,
        emailSentAt: new Date()
      });
      
      // Here you would integrate with email service (SendGrid)
      // For now, we'll simulate email sending
      console.log(`Negotiation email sent for negotiation ${negotiationId}`);
      
      return true;
    } catch (error) {
      console.error("Error sending negotiation email:", error);
      return false;
    }
  }

  // Inventory Management Methods
  async getInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory).where(eq(inventory.isActive, true));
  }

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item || undefined;
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const totalValue = Number(item.unitCost) * (item.currentStock || 0);
    const [newItem] = await db.insert(inventory).values({
      ...item,
      totalValue: totalValue.toString()
    }).returning();
    return newItem;
  }

  async updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const currentItem = await this.getInventoryItem(id);
    if (!currentItem) return undefined;
    
    const updatedData = { ...item, updatedAt: new Date() };
    if (item.unitCost !== undefined || item.currentStock !== undefined) {
      const unitCost = item.unitCost ? Number(item.unitCost) : Number(currentItem.unitCost);
      const currentStock = item.currentStock !== undefined ? item.currentStock : currentItem.currentStock;
      updatedData.totalValue = (unitCost * currentStock).toString();
    }
    
    const [updated] = await db.update(inventory)
      .set(updatedData)
      .where(eq(inventory.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    const result = await db.update(inventory)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(inventory.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getLowStockItems(): Promise<Inventory[]> {
    return await db.select().from(inventory)
      .where(and(
        eq(inventory.isActive, true),
        sql`${inventory.currentStock} <= ${inventory.minStock}`
      ));
  }

  // Stock Movements Methods
  async getStockMovements(inventoryId?: string): Promise<StockMovement[]> {
    if (inventoryId) {
      return await db.select().from(stockMovements)
        .where(eq(stockMovements.inventoryId, inventoryId))
        .orderBy(desc(stockMovements.createdAt));
    }
    return await db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt));
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const [newMovement] = await db.insert(stockMovements).values(movement).returning();
    return newMovement;
  }

  async updateInventoryStock(inventoryId: string, quantity: number, movementType: 'in' | 'out' | 'adjustment', reason: string, userId: string): Promise<void> {
    const currentItem = await this.getInventoryItem(inventoryId);
    if (!currentItem) throw new Error("Inventory item not found");

    let newStock = currentItem.currentStock;
    if (movementType === 'in') {
      newStock += quantity;
    } else if (movementType === 'out') {
      newStock -= quantity;
    } else if (movementType === 'adjustment') {
      newStock = quantity; // For adjustments, quantity is the new total
    }

    // Create stock movement record
    await this.createStockMovement({
      inventoryId,
      movementType,
      quantity: movementType === 'adjustment' ? quantity - currentItem.currentStock : quantity,
      unitCost: currentItem.unitCost,
      totalCost: (Number(currentItem.unitCost) * Math.abs(quantity)).toString(),
      reason,
      userId
    });

    // Update inventory
    await this.updateInventoryItem(inventoryId, {
      currentStock: newStock,
      lastUpdated: new Date()
    });
  }

  // Cost Centers Methods
  async getCostCenters(): Promise<CostCenter[]> {
    return await db.select().from(costCenters).where(eq(costCenters.isActive, true));
  }

  async getCostCenter(id: string): Promise<CostCenter | undefined> {
    const [center] = await db.select().from(costCenters).where(eq(costCenters.id, id));
    return center || undefined;
  }

  async createCostCenter(costCenter: InsertCostCenter): Promise<CostCenter> {
    const [newCenter] = await db.insert(costCenters).values(costCenter).returning();
    return newCenter;
  }

  async updateCostCenter(id: string, costCenter: Partial<InsertCostCenter>): Promise<CostCenter | undefined> {
    const [updated] = await db.update(costCenters)
      .set({ ...costCenter, updatedAt: new Date() })
      .where(eq(costCenters.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCostCenter(id: string): Promise<boolean> {
    const result = await db.update(costCenters)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(costCenters.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Report Templates Methods
  async getReportTemplates(): Promise<ReportTemplate[]> {
    return await db.select().from(reportTemplates);
  }

  async getReportTemplate(id: string): Promise<ReportTemplate | undefined> {
    const [template] = await db.select().from(reportTemplates).where(eq(reportTemplates.id, id));
    return template || undefined;
  }

  async createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate> {
    const [newTemplate] = await db.insert(reportTemplates).values(template).returning();
    return newTemplate;
  }

  async updateReportTemplate(id: string, template: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined> {
    const [updated] = await db.update(reportTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(reportTemplates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteReportTemplate(id: string): Promise<boolean> {
    const result = await db.delete(reportTemplates).where(eq(reportTemplates.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async generateReport(templateId: string, filters?: Record<string, any>): Promise<any> {
    const template = await this.getReportTemplate(templateId);
    if (!template) throw new Error("Report template not found");

    // Basic implementation - can be expanded based on report type
    let query;
    switch (template.reportType) {
      case 'spend_analysis':
        query = db.select().from(requisitions);
        break;
      case 'supplier_performance':
        query = db.select().from(suppliers);
        break;
      case 'inventory':
        query = db.select().from(inventory);
        break;
      default:
        throw new Error("Unsupported report type");
    }

    return await query;
  }

  // Email Templates Methods
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates).where(eq(emailTemplates.isActive, true));
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template || undefined;
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [newTemplate] = await db.insert(emailTemplates).values(template).returning();
    return newTemplate;
  }

  async updateEmailTemplate(id: string, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const [updated] = await db.update(emailTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    const result = await db.update(emailTemplates)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async sendEmail(templateId: string, recipientEmail: string, variables: Record<string, any>): Promise<boolean> {
    try {
      const template = await this.getEmailTemplate(templateId);
      if (!template) throw new Error("Email template not found");

      // Replace variables in template
      let subject = template.subject;
      let body = template.bodyTemplate;
      
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        body = body.replace(new RegExp(placeholder, 'g'), value);
      }

      // Here you would integrate with SendGrid
      console.log(`Email sent to ${recipientEmail} with subject: ${subject}`);
      
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  // Contracts Management Methods
  async getContracts(): Promise<Contract[]> {
    return await db.select().from(contracts).orderBy(desc(contracts.createdAt));
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract || undefined;
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const contractNumber = `CNT-${Date.now()}`;
    const [newContract] = await db.insert(contracts).values({
      ...contract,
      contractNumber
    }).returning();
    return newContract;
  }

  async updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract | undefined> {
    const [updated] = await db.update(contracts)
      .set({ ...contract, updatedAt: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteContract(id: string): Promise<boolean> {
    const result = await db.delete(contracts).where(eq(contracts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getExpiringContracts(days: number = 30): Promise<Contract[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return await db.select().from(contracts)
      .where(
        and(
          lte(contracts.endDate, futureDate),
          gte(contracts.endDate, new Date()),
          eq(contracts.status, 'active')
        )
      );
  }

  // Receipts Management Implementation
  async getReceipts(): Promise<Receipt[]> {
    return await db.select().from(receipts).orderBy(desc(receipts.createdAt));
  }

  async getReceipt(id: string): Promise<Receipt | undefined> {
    const [receipt] = await db.select().from(receipts).where(eq(receipts.id, id));
    return receipt || undefined;
  }

  async getReceiptsByPO(purchaseOrderId: string): Promise<Receipt[]> {
    return await db.select().from(receipts)
      .where(eq(receipts.purchaseOrderId, purchaseOrderId))
      .orderBy(desc(receipts.createdAt));
  }

  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const receiptNumber = `RCT-${Date.now()}`;
    const [newReceipt] = await db.insert(receipts).values({
      ...receipt,
      receiptNumber,
      receivedDate: new Date()
    }).returning();

    // Update PO status based on receipt
    const po = await this.getPurchaseOrder(receipt.purchaseOrderId);
    if (po && newReceipt.status === 'complete') {
      await this.updatePurchaseOrder(receipt.purchaseOrderId, {
        status: 'delivered',
        actualDelivery: new Date()
      });
    }

    return newReceipt;
  }

  async updateReceipt(id: string, receipt: Partial<InsertReceipt>): Promise<Receipt | undefined> {
    const [updated] = await db.update(receipts)
      .set({ ...receipt, updatedAt: new Date() })
      .where(eq(receipts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteReceipt(id: string): Promise<boolean> {
    const result = await db.delete(receipts).where(eq(receipts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Supplier Qualifications Implementation
  async getSupplierQualifications(): Promise<SupplierQualification[]> {
    return await db.select().from(supplierQualifications)
      .orderBy(desc(supplierQualifications.createdAt));
  }

  async getSupplierQualification(id: string): Promise<SupplierQualification | undefined> {
    const [qualification] = await db.select().from(supplierQualifications)
      .where(eq(supplierQualifications.id, id));
    return qualification || undefined;
  }

  async getQualificationBySupplier(supplierId: string): Promise<SupplierQualification | undefined> {
    const [qualification] = await db.select().from(supplierQualifications)
      .where(eq(supplierQualifications.supplierId, supplierId));
    return qualification || undefined;
  }

  async createSupplierQualification(qualification: InsertSupplierQualification): Promise<SupplierQualification> {
    const [newQualification] = await db.insert(supplierQualifications)
      .values(qualification).returning();
    return newQualification;
  }

  async updateSupplierQualification(id: string, qualification: Partial<InsertSupplierQualification>): Promise<SupplierQualification | undefined> {
    const [updated] = await db.update(supplierQualifications)
      .set({ ...qualification, updatedAt: new Date() })
      .where(eq(supplierQualifications.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSupplierQualification(id: string): Promise<boolean> {
    const result = await db.delete(supplierQualifications).where(eq(supplierQualifications.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Auto PO Generation Implementation
  async generatePurchaseOrderFromQuote(quoteId: string, createdBy: string): Promise<PurchaseOrder> {
    const quote = await this.getQuote(quoteId);
    if (!quote) throw new Error("Quote not found");
    
    if (quote.status !== 'accepted') throw new Error("Only accepted quotes can be converted to PO");

    const requisition = await this.getRequisition(quote.requisitionId);
    if (!requisition) throw new Error("Requisition not found");

    // Check if PO already exists for this quote
    const existingPOs = await db.select().from(purchaseOrders)
      .where(eq(purchaseOrders.quoteId, quoteId));
    
    if (existingPOs.length > 0) {
      throw new Error("Purchase order already exists for this quote");
    }

    const poNumber = `PO-${Date.now()}`;
    
    // Calculate expected delivery date
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + (quote.deliveryTime || 30));

    const poData = {
      poNumber,
      requisitionId: quote.requisitionId,
      supplierId: quote.supplierId,
      quoteId: quote.id,
      totalAmount: quote.totalAmount,
      currency: 'USD',
      status: 'pending' as const,
      items: quote.items,
      terms: quote.terms,
      expectedDelivery,
      notes: `Auto-generated from quote ${quote.quoteNumber}`,
      createdBy,
      autoGenerated: true,
      attachments: quote.attachments || []
    };

    const [newPO] = await db.insert(purchaseOrders).values(poData).returning();

    // Update quote status to completed
    await this.updateQuote(quoteId, { status: 'completed' });

    // Create activity log
    await this.createActivity({
      userId: createdBy,
      action: "auto_generated",
      entityType: "po",
      entityId: newPO.id,
      description: `Auto-generated PO ${poNumber} from accepted quote ${quote.quoteNumber}`
    });

    // Send notification to relevant users
    await this.createNotification({
      userId: createdBy,
      title: "Purchase Order Generated",
      message: `PO ${poNumber} has been automatically generated from quote ${quote.quoteNumber}`,
      type: "success",
      entityType: "po",
      entityId: newPO.id
    });

    return newPO;
  }

  // Advanced Analytics Methods
  async getSupplierPerformanceAnalytics(): Promise<any> {
    // Implementation for supplier performance analytics
    return {
      topPerformers: [],
      avgDeliveryTime: 0,
      qualityScores: [],
      costSavings: 0
    };
  }

  async getProcurementKPIs(): Promise<any> {
    // Implementation for procurement KPIs
    return {
      totalSpent: 0,
      avgProcessingTime: 0,
      costSavingsPercentage: 0,
      supplierSatisfaction: 0
    };
  }

  async getBudgetAnalysis(filters: any): Promise<any> {
    // Implementation for budget analysis
    return {
      budgetUtilization: 0,
      departmentSpending: [],
      categoryBreakdown: []
    };
  }

  async getWorkflowTemplates(): Promise<any[]> {
    // Implementation for workflow templates
    return [];
  }

  async getApprovalFlows(): Promise<any[]> {
    // Implementation for approval flows
    return [];
  }

  async createApprovalFlow(flow: any): Promise<any> {
    // Implementation for creating approval flow
    return flow;
  }

  async getAuditLogs(filters: any): Promise<any[]> {
    // Implementation for audit logs
    return [];
  }
}

// Use appropriate storage based on database availability
export const storage = db ? new DatabaseStorage() : new MemoryStorage();
