import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"), // user, approver, admin
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  address: text("address"),
  taxId: text("tax_id"),
  category: text("category").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, pending
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalOrders: integer("total_orders").default(0),
  performanceScore: decimal("performance_score", { precision: 3, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const requisitions = pgTable("requisitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requisitionNumber: text("requisition_number").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull(),
  estimatedAmount: decimal("estimated_amount", { precision: 10, scale: 2 }).notNull(),
  urgency: text("urgency").notNull().default("normal"), // low, normal, high, urgent
  justification: text("justification"),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, in_progress, completed
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteNumber: text("quote_number").notNull().unique(),
  requisitionId: varchar("requisition_id").references(() => requisitions.id).notNull(),
  supplierId: varchar("supplier_id").references(() => suppliers.id).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryTime: integer("delivery_time"), // days
  validUntil: timestamp("valid_until"),
  terms: text("terms"),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending, submitted, accepted, rejected, expired, negotiating
  isRfpSent: boolean("is_rfp_sent").default(false),
  rfpSentAt: timestamp("rfp_sent_at"),
  responseReceived: boolean("response_received").default(false),
  responseReceivedAt: timestamp("response_received_at"),
  comparisonScore: decimal("comparison_score", { precision: 5, scale: 2 }),
  negotiationRounds: integer("negotiation_rounds").default(0),
  items: text("items"), // JSON string with quote items
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RFP (Request for Proposal) Management
export const rfpRequests = pgTable("rfp_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requisitionId: varchar("requisition_id").references(() => requisitions.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  specifications: text("specifications").notNull(),
  deliveryRequirements: text("delivery_requirements"),
  evaluationCriteria: text("evaluation_criteria").array(),
  submissionDeadline: timestamp("submission_deadline").notNull(),
  estimatedBudget: decimal("estimated_budget", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  status: text("status").notNull().default("draft"), // draft, sent, receiving, closed
  selectedSuppliers: text("selected_suppliers").array(),
  sentAt: timestamp("sent_at"),
  emailsSent: integer("emails_sent").default(0),
  responsesReceived: integer("responses_received").default(0),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quote Comparisons
export const quoteComparisons = pgTable("quote_comparisons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requisitionId: varchar("requisition_id").references(() => requisitions.id).notNull(),
  comparisonName: text("comparison_name").notNull(),
  quoteIds: text("quote_ids").array().notNull(),
  criteria: text("criteria").array(), // price, quality, delivery, terms, etc.
  weights: text("weights").array(), // corresponding weights for criteria
  scores: text("scores"), // JSON string with detailed scoring
  recommendedQuoteId: varchar("recommended_quote_id").references(() => quotes.id),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Negotiation History
export const negotiations = pgTable("negotiations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: varchar("quote_id").references(() => quotes.id).notNull(),
  round: integer("round").notNull(),
  initiatedBy: varchar("initiated_by").references(() => users.id).notNull(),
  proposedChanges: text("proposed_changes").notNull(), // JSON string
  currentTerms: text("current_terms").notNull(), // JSON string
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, countered
  supplierResponse: text("supplier_response"),
  responseDate: timestamp("response_date"),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poNumber: text("po_number").notNull().unique(),
  requisitionId: varchar("requisition_id").references(() => requisitions.id).notNull(),
  supplierId: varchar("supplier_id").references(() => suppliers.id).notNull(),
  quoteId: varchar("quote_id").references(() => quotes.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"), // pending, sent, confirmed, in_transit, delivered, completed, cancelled
  items: text("items"), // JSON string with PO items
  terms: text("terms"),
  expectedDelivery: timestamp("expected_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  sentAt: timestamp("sent_at"),
  confirmedAt: timestamp("confirmed_at"),
  trackingNumber: text("tracking_number"),
  attachments: text("attachments").array(),
  autoGenerated: boolean("auto_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New table for tracking receipts/deliveries
export const receipts = pgTable("receipts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  receiptNumber: text("receipt_number").notNull().unique(),
  purchaseOrderId: varchar("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  receivedBy: varchar("received_by").references(() => users.id).notNull(),
  receivedDate: timestamp("received_date").notNull(),
  items: text("items"), // JSON with received items and quantities
  deliveryNote: text("delivery_note"),
  qualityCheck: text("quality_check").default("pending"), // pending, passed, failed
  qualityNotes: text("quality_notes"),
  attachments: text("attachments").array(),
  status: text("status").notNull().default("partial"), // partial, complete, damaged, rejected
  discrepancies: text("discrepancies"), // JSON with any quantity/quality discrepancies
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhance supplier qualifications
export const supplierQualifications = pgTable("supplier_qualifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").references(() => suppliers.id).notNull(),
  qualificationStatus: text("qualification_status").notNull().default("pending"), // pending, qualified, rejected, under_review
  documents: text("documents").array(),
  certifications: text("certifications").array(),
  bankingInfo: jsonb("banking_info"),
  legalDocuments: text("legal_documents").array(),
  dueDiligenceNotes: text("due_diligence_notes"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewDate: timestamp("review_date"),
  expiryDate: timestamp("expiry_date"),
  nextReviewDate: timestamp("next_review_date"),
  complianceScore: decimal("compliance_score", { precision: 3, scale: 2 }),
  riskLevel: text("risk_level").default("medium"), // low, medium, high, critical
  approvalWorkflowStatus: text("approval_workflow_status").default("pending"), // pending, legal_review, finance_review, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(), // requisition, supplier, quote, po
  entityId: varchar("entity_id").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Approval Rules Table
export const approvalRules = pgTable("approval_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }).default("0"),
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }),
  category: text("category"), // Optional: specific categories
  department: text("department"), // Optional: specific departments
  approverRole: text("approver_role").notNull(), // user, approver, admin
  approverUserId: varchar("approver_user_id").references(() => users.id), // Optional: specific user
  level: integer("level").notNull().default(1), // Approval level (1, 2, 3...)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Approval Steps Table
export const approvalSteps = pgTable("approval_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requisitionId: varchar("requisition_id").references(() => requisitions.id).notNull(),
  ruleId: varchar("rule_id").references(() => approvalRules.id).notNull(),
  approverId: varchar("approver_id").references(() => users.id).notNull(),
  level: integer("level").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  comments: text("comments"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications Table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, warning, success, error
  entityType: text("entity_type"), // requisition, quote, po
  entityId: varchar("entity_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory Management
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemCode: text("item_code").notNull().unique(),
  itemName: text("item_name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  unit: text("unit").notNull(), // pc, kg, liter, etc.
  currentStock: integer("current_stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  maxStock: integer("max_stock").notNull().default(0),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).notNull().default("0"),
  location: text("location"),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock Movements
export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inventoryId: varchar("inventory_id").references(() => inventory.id).notNull(),
  movementType: text("movement_type").notNull(), // in, out, adjustment
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }),
  reason: text("reason").notNull(),
  referenceType: text("reference_type"), // po, requisition, adjustment
  referenceId: varchar("reference_id"),
  userId: varchar("user_id").references(() => users.id).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cost Centers
export const costCenters = pgTable("cost_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  managerId: varchar("manager_id").references(() => users.id),
  department: text("department"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  spentAmount: decimal("spent_amount", { precision: 15, scale: 2 }).default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Report Templates
export const reportTemplates = pgTable("report_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  reportType: text("report_type").notNull(), // spend_analysis, supplier_performance, inventory, etc.
  filters: text("filters"), // JSON string with filter configuration
  columns: text("columns").array(), // Array of column names to include
  groupBy: text("group_by").array(), // Array of grouping fields
  sortBy: text("sort_by"),
  sortOrder: text("sort_order").default("desc"), // asc, desc
  isPublic: boolean("is_public").notNull().default(false),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  templateType: text("template_type").notNull(), // approval_request, rfp_invitation, quote_response, etc.
  subject: text("subject").notNull(),
  bodyTemplate: text("body_template").notNull(), // HTML template with placeholders
  variables: text("variables").array(), // Array of available variables
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contracts Management
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractNumber: text("contract_number").notNull().unique(),
  supplierId: varchar("supplier_id").references(() => suppliers.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  contractType: text("contract_type").notNull(), // service, goods, maintenance, etc.
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  status: text("status").notNull().default("draft"), // draft, active, expired, terminated
  autoRenewal: boolean("auto_renewal").default(false),
  renewalPeriod: integer("renewal_period"), // months
  documentPath: text("document_path"),
  terms: text("terms"),
  managerId: varchar("manager_id").references(() => users.id),
  alertDays: integer("alert_days").default(30), // days before expiry to alert
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  requisitions: many(requisitions),
  activities: many(activities),
  approvalRules: many(approvalRules),
  approvalSteps: many(approvalSteps),
  notifications: many(notifications),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  quotes: many(quotes),
  purchaseOrders: many(purchaseOrders),
}));

export const requisitionsRelations = relations(requisitions, ({ one, many }) => ({
  requester: one(users, {
    fields: [requisitions.requesterId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [requisitions.approvedBy],
    references: [users.id],
  }),
  quotes: many(quotes),
  purchaseOrders: many(purchaseOrders),
  approvalSteps: many(approvalSteps),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  requisition: one(requisitions, {
    fields: [quotes.requisitionId],
    references: [requisitions.id],
  }),
  supplier: one(suppliers, {
    fields: [quotes.supplierId],
    references: [suppliers.id],
  }),
  negotiations: many(negotiations),
}));

export const rfpRequestsRelations = relations(rfpRequests, ({ one }) => ({
  requisition: one(requisitions, {
    fields: [rfpRequests.requisitionId],
    references: [requisitions.id],
  }),
  createdByUser: one(users, {
    fields: [rfpRequests.createdBy],
    references: [users.id],
  }),
}));

export const quoteComparisonsRelations = relations(quoteComparisons, ({ one }) => ({
  requisition: one(requisitions, {
    fields: [quoteComparisons.requisitionId],
    references: [requisitions.id],
  }),
  recommendedQuote: one(quotes, {
    fields: [quoteComparisons.recommendedQuoteId],
    references: [quotes.id],
  }),
  createdByUser: one(users, {
    fields: [quoteComparisons.createdBy],
    references: [users.id],
  }),
}));

export const negotiationsRelations = relations(negotiations, ({ one }) => ({
  quote: one(quotes, {
    fields: [negotiations.quoteId],
    references: [quotes.id],
  }),
  initiatedByUser: one(users, {
    fields: [negotiations.initiatedBy],
    references: [users.id],
  }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one }) => ({
  requisition: one(requisitions, {
    fields: [purchaseOrders.requisitionId],
    references: [requisitions.id],
  }),
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  quote: one(quotes, {
    fields: [purchaseOrders.quoteId],
    references: [quotes.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const approvalRulesRelations = relations(approvalRules, ({ one, many }) => ({
  approverUser: one(users, {
    fields: [approvalRules.approverUserId],
    references: [users.id],
  }),
  approvalSteps: many(approvalSteps),
}));

export const approvalStepsRelations = relations(approvalSteps, ({ one }) => ({
  requisition: one(requisitions, {
    fields: [approvalSteps.requisitionId],
    references: [requisitions.id],
  }),
  rule: one(approvalRules, {
    fields: [approvalSteps.ruleId],
    references: [approvalRules.id],
  }),
  approver: one(users, {
    fields: [approvalSteps.approverId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [inventory.supplierId],
    references: [suppliers.id],
  }),
  stockMovements: many(stockMovements),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  inventory: one(inventory, {
    fields: [stockMovements.inventoryId],
    references: [inventory.id],
  }),
  user: one(users, {
    fields: [stockMovements.userId],
    references: [users.id],
  }),
}));

export const costCentersRelations = relations(costCenters, ({ one }) => ({
  manager: one(users, {
    fields: [costCenters.managerId],
    references: [users.id],
  }),
}));

export const reportTemplatesRelations = relations(reportTemplates, ({ one }) => ({
  createdByUser: one(users, {
    fields: [reportTemplates.createdBy],
    references: [users.id],
  }),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  createdByUser: one(users, {
    fields: [emailTemplates.createdBy],
    references: [users.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [contracts.supplierId],
    references: [suppliers.id],
  }),
  manager: one(users, {
    fields: [contracts.managerId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRequisitionSchema = createInsertSchema(requisitions).omit({
  id: true,
  requisitionNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  quoteNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  poNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertApprovalRuleSchema = createInsertSchema(approvalRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApprovalStepSchema = createInsertSchema(approvalSteps).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Requisition = typeof requisitions.$inferSelect;
export type InsertRequisition = z.infer<typeof insertRequisitionSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type ApprovalRule = typeof approvalRules.$inferSelect;
export type InsertApprovalRule = z.infer<typeof insertApprovalRuleSchema>;

export type ApprovalStep = typeof approvalSteps.$inferSelect;
export type InsertApprovalStep = z.infer<typeof insertApprovalStepSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export const insertRfpRequestSchema = createInsertSchema(rfpRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteComparisonSchema = createInsertSchema(quoteComparisons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNegotiationSchema = createInsertSchema(negotiations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RfpRequest = typeof rfpRequests.$inferSelect;
export type InsertRfpRequest = z.infer<typeof insertRfpRequestSchema>;

export type QuoteComparison = typeof quoteComparisons.$inferSelect;
export type InsertQuoteComparison = z.infer<typeof insertQuoteComparisonSchema>;

export type Negotiation = typeof negotiations.$inferSelect;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;

// New schemas for inventory and other modules
export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
});

export const insertCostCenterSchema = createInsertSchema(costCenters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for new modules
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;

export type CostCenter = typeof costCenters.$inferSelect;
export type InsertCostCenter = z.infer<typeof insertCostCenterSchema>;

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

// Insert schemas for new tables
export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierQualificationSchema = createInsertSchema(supplierQualifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Enhanced Purchase Order schema
export const insertPurchaseOrderEnhancedSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New types
export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;

export type SupplierQualification = typeof supplierQualifications.$inferSelect;
export type InsertSupplierQualification = z.infer<typeof insertSupplierQualificationSchema>;

// Enhanced PO insert type 
export type InsertPurchaseOrderEnhanced = z.infer<typeof insertPurchaseOrderEnhancedSchema>;
