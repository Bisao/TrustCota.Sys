import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertRequisitionSchema,
  insertSupplierSchema,
  insertQuoteSchema,
  insertPurchaseOrderSchema,
  insertApprovalRuleSchema,
  insertApprovalStepSchema,
  insertRfpRequestSchema,
  insertQuoteComparisonSchema,
  insertNegotiationSchema,
  insertInventorySchema,
  insertStockMovementSchema,
  insertCostCenterSchema,
  insertReportTemplateSchema,
  insertEmailTemplateSchema,
  insertContractSchema,
  insertReceiptSchema,
  insertSupplierQualificationSchema
} from "@shared/schema";
import { googleSheetsService } from './services/google-sheets';
import { docxGeneratorService } from './services/docx-generator';
import { 
  analyzeRequisition, 
  analyzeSentiment, 
  suggestSuppliers, 
  generateExecutiveSummary,
  analyzeSupplierProposal,
  classifyRequisition,
  predictPriceTrends,
  generateCounterProposal
} from "./ai/grok";

export function registerRoutes(app: Express): Server {
  // Authentication routes
  setupAuth(app);

  // Requisitions API
  app.get("/api/requisitions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const requisitions = await storage.getRequisitions();
      res.json(requisitions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch requisitions" });
    }
  });

  app.post("/api/requisitions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertRequisitionSchema.parse({
        ...req.body,
        requesterId: req.user!.id
      });
      
      const requisition = await storage.createRequisition(validatedData);
      
      // Process approval workflow
      try {
        const approvalSteps = await storage.processRequisitionApproval(requisition.id);
        
        // Log activity
        await storage.createActivity({
          userId: req.user!.id,
          action: "created",
          entityType: "requisition",
          entityId: requisition.id,
          description: `Created requisition for ${requisition.description}. ${approvalSteps.length} approval steps created.`
        });
        
        res.status(201).json({ requisition, approvalSteps });
      } catch (approvalError) {
        // If approval workflow fails, still create the requisition but log the error
        console.error("Approval workflow error:", approvalError);
        
        await storage.createActivity({
          userId: req.user!.id,
          action: "created",
          entityType: "requisition",
          entityId: requisition.id,
          description: `Created requisition for ${requisition.description}. Approval workflow will be processed manually.`
        });
        
        res.status(201).json({ requisition, approvalSteps: [] });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid requisition data" });
    }
  });

  app.put("/api/requisitions/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const requisition = await storage.updateRequisition(id, req.body);
      
      if (!requisition) {
        return res.status(404).json({ message: "Requisition not found" });
      }
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "updated",
        entityType: "requisition",
        entityId: requisition.id,
        description: `Updated requisition ${requisition.requisitionNumber}`
      });
      
      res.json(requisition);
    } catch (error) {
      res.status(400).json({ message: "Failed to update requisition" });
    }
  });

  // Suppliers API
  app.get("/api/suppliers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "supplier",
        entityId: supplier.id,
        description: `Added new supplier ${supplier.name}`
      });
      
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const supplier = await storage.updateSupplier(id, req.body);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Failed to update supplier" });
    }
  });

  // Quotes API
  app.get("/api/quotes", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/requisition/:requisitionId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const { requisitionId } = req.params;
      const quotes = await storage.getQuotesByRequisition(requisitionId);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "quote",
        entityId: quote.id,
        description: `Created quote ${quote.quoteNumber}`
      });
      
      res.status(201).json(quote);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote data" });
    }
  });

  // Purchase Orders API
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const purchaseOrders = await storage.getPurchaseOrders();
      res.json(purchaseOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertPurchaseOrderSchema.parse(req.body);
      const purchaseOrder = await storage.createPurchaseOrder({
        ...validatedData,
        createdBy: req.user!.id
      });
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "po",
        entityId: purchaseOrder.id,
        description: `Created purchase order ${purchaseOrder.poNumber}`
      });
      
      res.status(201).json(purchaseOrder);
    } catch (error) {
      res.status(400).json({ message: "Invalid purchase order data" });
    }
  });

  // Auto-generate PO from accepted quote
  app.post("/api/quotes/:quoteId/generate-po", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { quoteId } = req.params;
      const purchaseOrder = await storage.generatePurchaseOrderFromQuote(quoteId, req.user!.id);
      
      res.status(201).json(purchaseOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Activities API
  app.get("/api/activities", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Dashboard API
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Approval Rules API
  app.get("/api/approval-rules", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const rules = await storage.getApprovalRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch approval rules" });
    }
  });

  app.post("/api/approval-rules", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user!.role !== "admin") {
        return res.sendStatus(403);
      }
      
      const validatedData = insertApprovalRuleSchema.parse(req.body);
      const rule = await storage.createApprovalRule(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "approval-rule",
        entityId: rule.id,
        description: `Created approval rule: ${rule.name}`
      });
      
      res.status(201).json(rule);
    } catch (error) {
      res.status(400).json({ message: "Invalid approval rule data" });
    }
  });

  app.put("/api/approval-rules/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user!.role !== "admin") {
        return res.sendStatus(403);
      }
      
      const { id } = req.params;
      const rule = await storage.updateApprovalRule(id, req.body);
      
      if (!rule) {
        return res.status(404).json({ message: "Approval rule not found" });
      }
      
      res.json(rule);
    } catch (error) {
      res.status(400).json({ message: "Failed to update approval rule" });
    }
  });

  app.delete("/api/approval-rules/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user!.role !== "admin") {
        return res.sendStatus(403);
      }
      
      const { id } = req.params;
      const success = await storage.deleteApprovalRule(id);
      
      if (!success) {
        return res.status(404).json({ message: "Approval rule not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete approval rule" });
    }
  });

  // Approval Steps API
  app.get("/api/approval-steps/:requisitionId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const { requisitionId } = req.params;
      const steps = await storage.getApprovalSteps(requisitionId);
      res.json(steps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch approval steps" });
    }
  });

  app.get("/api/pending-approvals", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const pendingApprovals = await storage.getPendingApprovalsForUser(req.user!.id);
      res.json(pendingApprovals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });

  app.post("/api/approval-steps/:id/approve", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const { comments } = req.body;
      
      const success = await storage.approveRequisitionStep(id, req.user!.id, comments);
      
      if (!success) {
        return res.status(404).json({ message: "Approval step not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to approve step" });
    }
  });

  app.post("/api/approval-steps/:id/reject", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const { comments } = req.body;
      
      if (!comments) {
        return res.status(400).json({ message: "Comments are required for rejection" });
      }
      
      const success = await storage.rejectRequisitionStep(id, req.user!.id, comments);
      
      if (!success) {
        return res.status(404).json({ message: "Approval step not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to reject step" });
    }
  });

  // Notifications API
  app.get("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const count = await storage.getUnreadNotificationCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const { id } = req.params;
      const success = await storage.markNotificationAsRead(id);
      res.json({ success });
    } catch (error) {
      res.status(400).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put("/api/notifications/mark-all-read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const success = await storage.markAllNotificationsAsRead(req.user!.id);
      res.json({ success });
    } catch (error) {
      res.status(400).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // RFP (Request for Proposal) API
  app.get("/api/rfp-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const rfps = await storage.getRfpRequests();
      res.json(rfps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFP requests" });
    }
  });

  app.get("/api/rfp-requests/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const rfp = await storage.getRfpRequest(req.params.id);
      if (!rfp) return res.status(404).json({ message: "RFP request not found" });
      res.json(rfp);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFP request" });
    }
  });

  app.post("/api/rfp-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertRfpRequestSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const rfp = await storage.createRfpRequest(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "rfp",
        entityId: rfp.id,
        description: `Created RFP request: ${rfp.title}`
      });
      
      res.status(201).json(rfp);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid RFP request data" });
    }
  });

  app.post("/api/rfp-requests/:id/send", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { supplierIds } = req.body;
      if (!Array.isArray(supplierIds) || supplierIds.length === 0) {
        return res.status(400).json({ message: "Supplier IDs are required" });
      }
      
      const success = await storage.sendRfpToSuppliers(req.params.id, supplierIds);
      
      if (success) {
        await storage.createActivity({
          userId: req.user!.id,
          action: "sent",
          entityType: "rfp",
          entityId: req.params.id,
          description: `Sent RFP to ${supplierIds.length} suppliers`
        });
        
        res.json({ message: "RFP sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send RFP" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send RFP" });
    }
  });

  // Quote Comparisons API
  app.get("/api/quote-comparisons", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const comparisons = await storage.getQuoteComparisons();
      res.json(comparisons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote comparisons" });
    }
  });

  app.get("/api/quote-comparisons/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const comparison = await storage.getQuoteComparison(req.params.id);
      if (!comparison) return res.status(404).json({ message: "Quote comparison not found" });
      res.json(comparison);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote comparison" });
    }
  });

  app.post("/api/quote-comparisons", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertQuoteComparisonSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const comparison = await storage.createQuoteComparison(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "quote_comparison",
        entityId: comparison.id,
        description: `Created quote comparison: ${comparison.comparisonName}`
      });
      
      res.status(201).json(comparison);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid quote comparison data" });
    }
  });

  app.post("/api/quote-comparisons/:id/calculate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const scores = await storage.calculateQuoteScores(req.params.id);
      
      if (scores) {
        await storage.createActivity({
          userId: req.user!.id,
          action: "calculated",
          entityType: "quote_comparison",
          entityId: req.params.id,
          description: "Calculated quote comparison scores"
        });
        
        res.json(scores);
      } else {
        res.status(404).json({ message: "Quote comparison not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate quote scores" });
    }
  });

  // Negotiations API
  app.get("/api/negotiations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const negotiations = await storage.getNegotiations();
      res.json(negotiations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch negotiations" });
    }
  });

  app.get("/api/negotiations/quote/:quoteId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const negotiations = await storage.getNegotiationsByQuote(req.params.quoteId);
      res.json(negotiations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch negotiations for quote" });
    }
  });

  app.post("/api/negotiations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertNegotiationSchema.parse({
        ...req.body,
        initiatedBy: req.user!.id
      });
      
      const negotiation = await storage.createNegotiation(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "negotiation",
        entityId: negotiation.id,
        description: `Started negotiation round ${negotiation.round}`
      });
      
      res.status(201).json(negotiation);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Invalid negotiation data" });
    }
  });

  app.post("/api/negotiations/:id/send-email", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const success = await storage.sendNegotiationEmail(req.params.id);
      
      if (success) {
        await storage.createActivity({
          userId: req.user!.id,
          action: "sent_email",
          entityType: "negotiation",
          entityId: req.params.id,
          description: "Sent negotiation email to supplier"
        });
        
        res.json({ message: "Negotiation email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send negotiation email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send negotiation email" });
    }
  });

  // Inventory Management API
  app.get("/api/inventory", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/low-stock", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const lowStockItems = await storage.getLowStockItems();
      res.json(lowStockItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const validatedData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "inventory",
        entityId: item.id,
        description: `Created inventory item: ${item.itemName}`
      });
      
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory data" });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const { id } = req.params;
      const updatedItem = await storage.updateInventoryItem(id, req.body);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const { id } = req.params;
      const success = await storage.deleteInventoryItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete inventory item" });
    }
  });

  // Stock Movements API
  app.get("/api/stock-movements", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const { inventoryId } = req.query;
      const movements = await storage.getStockMovements(inventoryId as string);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock movements" });
    }
  });

  app.post("/api/stock-movements", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const { inventoryId, quantity, movementType, reason } = req.body;
      
      await storage.updateInventoryStock(
        inventoryId,
        quantity,
        movementType,
        reason,
        req.user!.id
      );
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "updated",
        entityType: "inventory",
        entityId: inventoryId,
        description: `Stock ${movementType}: ${quantity} units - ${reason}`
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to update stock" });
    }
  });

  // Cost Centers API
  app.get("/api/cost-centers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const costCenters = await storage.getCostCenters();
      res.json(costCenters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cost centers" });
    }
  });

  app.post("/api/cost-centers", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user!.role !== "admin") {
        return res.sendStatus(403);
      }
      
      const validatedData = insertCostCenterSchema.parse(req.body);
      const costCenter = await storage.createCostCenter(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "cost-center",
        entityId: costCenter.id,
        description: `Created cost center: ${costCenter.name}`
      });
      
      res.status(201).json(costCenter);
    } catch (error) {
      res.status(400).json({ message: "Invalid cost center data" });
    }
  });

  app.put("/api/cost-centers/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user!.role !== "admin") {
        return res.sendStatus(403);
      }
      
      const { id } = req.params;
      const updatedCenter = await storage.updateCostCenter(id, req.body);
      
      if (!updatedCenter) {
        return res.status(404).json({ message: "Cost center not found" });
      }
      
      res.json(updatedCenter);
    } catch (error) {
      res.status(400).json({ message: "Failed to update cost center" });
    }
  });

  // Report Templates API
  app.get("/api/report-templates", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const templates = await storage.getReportTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report templates" });
    }
  });

  app.post("/api/report-templates", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertReportTemplateSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const template = await storage.createReportTemplate(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "report-template",
        entityId: template.id,
        description: `Created report template: ${template.name}`
      });
      
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid report template data" });
    }
  });

  app.post("/api/reports/generate/:templateId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { templateId } = req.params;
      const { filters } = req.body;
      
      const reportData = await storage.generateReport(templateId, filters);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "generated",
        entityType: "report",
        entityId: templateId,
        description: "Generated custom report"
      });
      
      res.json(reportData);
    } catch (error) {
      res.status(400).json({ message: "Failed to generate report" });
    }
  });

  // Email Templates API
  app.get("/api/email-templates", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.post("/api/email-templates", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user!.role !== "admin") {
        return res.sendStatus(403);
      }
      
      const validatedData = insertEmailTemplateSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const template = await storage.createEmailTemplate(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "email-template",
        entityId: template.id,
        description: `Created email template: ${template.name}`
      });
      
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid email template data" });
    }
  });

  app.post("/api/send-email", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { templateId, recipientEmail, variables } = req.body;
      
      const success = await storage.sendEmail(templateId, recipientEmail, variables);
      
      if (success) {
        await storage.createActivity({
          userId: req.user!.id,
          action: "sent_email",
          entityType: "email",
          entityId: templateId,
          description: `Sent email to ${recipientEmail}`
        });
        
        res.json({ message: "Email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      res.status(400).json({ message: "Failed to send email" });
    }
  });

  // Contracts Management API
  app.get("/api/contracts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get("/api/contracts/expiring", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const days = parseInt(req.query.days as string) || 30;
      const expiringContracts = await storage.getExpiringContracts(days);
      res.json(expiringContracts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expiring contracts" });
    }
  });

  app.post("/api/contracts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertContractSchema.parse({
        ...req.body,
        managerId: req.user!.id
      });
      
      const contract = await storage.createContract(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "contract",
        entityId: contract.id,
        description: `Created contract: ${contract.title}`
      });
      
      res.status(201).json(contract);
    } catch (error) {
      res.status(400).json({ message: "Invalid contract data" });
    }
  });

  app.put("/api/contracts/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const updatedContract = await storage.updateContract(id, req.body);
      
      if (!updatedContract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "updated",
        entityType: "contract",
        entityId: id,
        description: `Updated contract: ${updatedContract.title}`
      });
      
      res.json(updatedContract);
    } catch (error) {
      res.status(400).json({ message: "Failed to update contract" });
    }
  });

  // Receipts Management API
  app.get("/api/receipts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const receipts = await storage.getReceipts();
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch receipts" });
    }
  });

  app.get("/api/receipts/po/:poId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const receipts = await storage.getReceiptsByPO(req.params.poId);
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch receipts for PO" });
    }
  });

  app.post("/api/receipts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertReceiptSchema.parse({
        ...req.body,
        receivedBy: req.user!.id
      });
      
      const receipt = await storage.createReceipt(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "receipt",
        entityId: receipt.id,
        description: `Created receipt ${receipt.receiptNumber}`
      });
      
      res.status(201).json(receipt);
    } catch (error) {
      res.status(400).json({ message: "Invalid receipt data" });
    }
  });

  app.put("/api/receipts/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const updatedReceipt = await storage.updateReceipt(id, req.body);
      
      if (!updatedReceipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "updated",
        entityType: "receipt",
        entityId: id,
        description: `Updated receipt ${updatedReceipt.receiptNumber}`
      });
      
      res.json(updatedReceipt);
    } catch (error) {
      res.status(400).json({ message: "Failed to update receipt" });
    }
  });

  // Supplier Qualifications API
  app.get("/api/supplier-qualifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const qualifications = await storage.getSupplierQualifications();
      res.json(qualifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier qualifications" });
    }
  });

  app.get("/api/supplier-qualifications/supplier/:supplierId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const qualification = await storage.getQualificationBySupplier(req.params.supplierId);
      res.json(qualification);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier qualification" });
    }
  });

  app.post("/api/supplier-qualifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const validatedData = insertSupplierQualificationSchema.parse({
        ...req.body,
        reviewedBy: req.user!.id,
        reviewDate: new Date()
      });
      
      const qualification = await storage.createSupplierQualification(validatedData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "supplier_qualification",
        entityId: qualification.id,
        description: "Created supplier qualification"
      });
      
      res.status(201).json(qualification);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier qualification data" });
    }
  });

  app.put("/api/supplier-qualifications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const updatedQualification = await storage.updateSupplierQualification(id, {
        ...req.body,
        reviewedBy: req.user!.id,
        reviewDate: new Date()
      });
      
      if (!updatedQualification) {
        return res.status(404).json({ message: "Supplier qualification not found" });
      }
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "updated",
        entityType: "supplier_qualification",
        entityId: id,
        description: "Updated supplier qualification"
      });
      
      res.json(updatedQualification);
    } catch (error) {
      res.status(400).json({ message: "Failed to update supplier qualification" });
    }
  });

  // Approval Flow Management Routes
  app.get("/api/approval-flows", async (req, res) => {
    try {
      const flows = await storage.getApprovalRules();
      res.json(flows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch approval flows" });
    }
  });

  app.post("/api/approval-flows", async (req, res) => {
    try {
      const flow = await storage.createApprovalRule(req.body);
      res.status(201).json(flow);
    } catch (error) {
      res.status(500).json({ message: "Failed to create approval flow" });
    }
  });

  // Audit Logs Routes
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const logs = await storage.getActivities();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Advanced Analytics Routes
  app.get("/api/analytics/supplier-performance", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      const analytics = suppliers.map(supplier => ({
        ...supplier,
        performanceData: {
          onTimeDelivery: Math.random() * 100,
          qualityScore: Math.random() * 100,
          priceCompetitiveness: Math.random() * 100
        }
      }));
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier performance analytics" });
    }
  });

  app.get("/api/analytics/procurement-kpis", async (req, res) => {
    try {
      const requisitions = await storage.getRequisitions();
      const quotes = await storage.getQuotes();
      const purchaseOrders = await storage.getPurchaseOrders();
      
      const kpis = {
        totalSpend: purchaseOrders.reduce((sum, po) => sum + parseFloat(po.totalAmount), 0),
        avgProcessingTime: 5.2,
        supplierCount: (await storage.getSuppliers()).length,
        savings: requisitions.reduce((sum, req) => sum + (parseFloat(req.estimatedAmount) * 0.1), 0)
      };
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch procurement KPIs" });
    }
  });

  // Google Sheets Integration API
  app.post("/api/integrations/google-sheets/export-requisitions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { spreadsheetId, sheetName } = req.body;
      
      if (!spreadsheetId) {
        return res.status(400).json({ message: "Spreadsheet ID is required" });
      }

      // Initialize Google Sheets (would need proper credentials setup)
      const initialized = await googleSheetsService.initializeAuth();
      if (!initialized) {
        return res.status(500).json({ message: "Failed to initialize Google Sheets authentication" });
      }

      const result = await googleSheetsService.exportRequisitionsToSheet(spreadsheetId, sheetName);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "exported",
        entityType: "requisition",
        entityId: spreadsheetId,
        description: `Exported ${result.rowsExported} requisitions to Google Sheets`
      });

      res.json(result);
    } catch (error) {
      console.error('Export requisitions to Sheets error:', error);
      res.status(500).json({ message: "Failed to export requisitions to Google Sheets" });
    }
  });

  app.post("/api/integrations/google-sheets/export-suppliers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { spreadsheetId, sheetName } = req.body;
      
      if (!spreadsheetId) {
        return res.status(400).json({ message: "Spreadsheet ID is required" });
      }

      const initialized = await googleSheetsService.initializeAuth();
      if (!initialized) {
        return res.status(500).json({ message: "Failed to initialize Google Sheets authentication" });
      }

      const result = await googleSheetsService.exportSuppliersToSheet(spreadsheetId, sheetName);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "exported",
        entityType: "supplier",
        entityId: spreadsheetId,
        description: `Exported ${result.rowsExported} suppliers to Google Sheets`
      });

      res.json(result);
    } catch (error) {
      console.error('Export suppliers to Sheets error:', error);
      res.status(500).json({ message: "Failed to export suppliers to Google Sheets" });
    }
  });

  app.post("/api/integrations/google-sheets/export-quotes", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { spreadsheetId, sheetName } = req.body;
      
      if (!spreadsheetId) {
        return res.status(400).json({ message: "Spreadsheet ID is required" });
      }

      const initialized = await googleSheetsService.initializeAuth();
      if (!initialized) {
        return res.status(500).json({ message: "Failed to initialize Google Sheets authentication" });
      }

      const result = await googleSheetsService.exportQuotesToSheet(spreadsheetId, sheetName);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "exported",
        entityType: "quote",
        entityId: spreadsheetId,
        description: `Exported ${result.rowsExported} quotes to Google Sheets`
      });

      res.json(result);
    } catch (error) {
      console.error('Export quotes to Sheets error:', error);
      res.status(500).json({ message: "Failed to export quotes to Google Sheets" });
    }
  });

  app.post("/api/integrations/google-sheets/create-spreadsheet", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Spreadsheet title is required" });
      }

      const initialized = await googleSheetsService.initializeAuth();
      if (!initialized) {
        return res.status(500).json({ message: "Failed to initialize Google Sheets authentication" });
      }

      const result = await googleSheetsService.createSpreadsheet(title);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "created",
        entityType: "spreadsheet",
        entityId: result.spreadsheetId!,
        description: `Created Google Spreadsheet: ${title}`
      });

      res.json(result);
    } catch (error) {
      console.error('Create spreadsheet error:', error);
      res.status(500).json({ message: "Failed to create Google Spreadsheet" });
    }
  });

  // DOCX Document Generation API
  app.post("/api/documents/generate-rfp", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { requisitionId, supplierIds } = req.body;
      
      if (!requisitionId || !supplierIds || !Array.isArray(supplierIds)) {
        return res.status(400).json({ message: "Requisition ID and supplier IDs are required" });
      }

      const document = await docxGeneratorService.generateRFPDocument(requisitionId, supplierIds);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "generated",
        entityType: "document",
        entityId: requisitionId,
        description: `Generated RFP document for requisition ${requisitionId}`
      });

      res.set({
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.filename}"`
      });
      
      res.send(document.buffer);
    } catch (error) {
      console.error('Generate RFP document error:', error);
      res.status(500).json({ message: "Failed to generate RFP document" });
    }
  });

  app.post("/api/documents/generate-contract", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { supplierId, contractData } = req.body;
      
      if (!supplierId || !contractData) {
        return res.status(400).json({ message: "Supplier ID and contract data are required" });
      }

      const document = await docxGeneratorService.generateContractDocument(supplierId, contractData);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "generated",
        entityType: "document",
        entityId: supplierId,
        description: `Generated contract document for supplier ${supplierId}`
      });

      res.set({
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.filename}"`
      });
      
      res.send(document.buffer);
    } catch (error) {
      console.error('Generate contract document error:', error);
      res.status(500).json({ message: "Failed to generate contract document" });
    }
  });

  app.post("/api/documents/generate-purchase-order", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { purchaseOrderId } = req.body;
      
      if (!purchaseOrderId) {
        return res.status(400).json({ message: "Purchase Order ID is required" });
      }

      const document = await docxGeneratorService.generatePurchaseOrderDocument(purchaseOrderId);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "generated",
        entityType: "document",
        entityId: purchaseOrderId,
        description: `Generated PO document for order ${purchaseOrderId}`
      });

      res.set({
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.filename}"`
      });
      
      res.send(document.buffer);
    } catch (error) {
      console.error('Generate PO document error:', error);
      res.status(500).json({ message: "Failed to generate Purchase Order document" });
    }
  });

  // AI-Powered Analysis API
  app.post("/api/ai/analyze-requisition", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { description, category, amount } = req.body;
      
      if (!description || !category || !amount) {
        return res.status(400).json({ message: "Description, category, and amount are required" });
      }

      const analysis = await analyzeRequisition(description, category, amount);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "ai_analysis",
        entityType: "requisition",
        entityId: "analysis",
        description: `AI analysis performed for ${category} requisition`
      });

      res.json(analysis);
    } catch (error) {
      console.error('AI requisition analysis error:', error);
      res.status(500).json({ message: "Failed to analyze requisition" });
    }
  });

  app.post("/api/ai/analyze-sentiment", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required for sentiment analysis" });
      }

      const analysis = await analyzeSentiment(text);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "ai_sentiment",
        entityType: "negotiation",
        entityId: "sentiment",
        description: "AI sentiment analysis performed"
      });

      res.json(analysis);
    } catch (error) {
      console.error('AI sentiment analysis error:', error);
      res.status(500).json({ message: "Failed to analyze sentiment" });
    }
  });

  app.post("/api/ai/suggest-suppliers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { category, requirements, budget } = req.body;
      
      if (!category || !requirements || !budget) {
        return res.status(400).json({ message: "Category, requirements, and budget are required" });
      }

      const suggestions = await suggestSuppliers(category, requirements, budget);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "ai_suggestions",
        entityType: "supplier",
        entityId: "suggestions",
        description: `AI supplier suggestions generated for ${category}`
      });

      res.json(suggestions);
    } catch (error) {
      console.error('AI supplier suggestions error:', error);
      res.status(500).json({ message: "Failed to generate supplier suggestions" });
    }
  });

  app.post("/api/ai/executive-summary", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { total_spend, active_suppliers, pending_requisitions, monthly_trend } = req.body;
      
      if (!total_spend || !active_suppliers || !pending_requisitions || !monthly_trend) {
        return res.status(400).json({ message: "All dashboard metrics are required" });
      }

      const summary = await generateExecutiveSummary({
        total_spend,
        active_suppliers,
        pending_requisitions,
        monthly_trend
      });
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "ai_summary",
        entityType: "report",
        entityId: "executive",
        description: "AI executive summary generated"
      });

      res.json({ summary });
    } catch (error) {
      console.error('AI executive summary error:', error);
      res.status(500).json({ message: "Failed to generate executive summary" });
    }
  });

  // Advanced AI Analysis API - Following new guidelines
  app.post("/api/ai/analyze-proposal", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { proposalText, requirements } = req.body;
      
      if (!proposalText || !requirements) {
        return res.status(400).json({ message: "Proposal text and requirements are required" });
      }

      const analysis = await analyzeSupplierProposal(proposalText, requirements);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "ai_proposal_analysis",
        entityType: "quote",
        entityId: "proposal_analysis",
        description: "Advanced AI proposal analysis performed"
      });

      res.json(analysis);
    } catch (error) {
      console.error('AI proposal analysis error:', error);
      res.status(500).json({ message: "Failed to analyze proposal" });
    }
  });

  app.post("/api/ai/classify-requisition", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { description, title } = req.body;
      
      if (!description || !title) {
        return res.status(400).json({ message: "Description and title are required" });
      }

      const classification = await classifyRequisition(description, title);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "ai_classification",
        entityType: "requisition",
        entityId: "classification",
        description: `AI classification: ${classification.category} - ${classification.subcategory}`
      });

      res.json(classification);
    } catch (error) {
      console.error('AI classification error:', error);
      res.status(500).json({ message: "Failed to classify requisition" });
    }
  });

  app.post("/api/ai/predict-prices", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { category, historicalData } = req.body;
      
      if (!category) {
        return res.status(400).json({ message: "Category is required" });
      }

      const prediction = await predictPriceTrends(category, historicalData || []);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "ai_price_prediction",
        entityType: "analytics",
        entityId: "price_forecast",
        description: `Price prediction for ${category}: ${prediction.buying_recommendation}`
      });

      res.json(prediction);
    } catch (error) {
      console.error('AI price prediction error:', error);
      res.status(500).json({ message: "Failed to predict prices" });
    }
  });

  app.post("/api/ai/generate-counter-proposal", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { originalProposal, negotiationGoals } = req.body;
      
      if (!originalProposal || !negotiationGoals) {
        return res.status(400).json({ message: "Original proposal and negotiation goals are required" });
      }

      const counterProposal = await generateCounterProposal(originalProposal, negotiationGoals);
      
      await storage.createActivity({
        userId: req.user!.id,
        action: "ai_counter_proposal",
        entityType: "negotiation",
        entityId: "counter_proposal",
        description: "AI-generated counter proposal created"
      });

      res.json(counterProposal);
    } catch (error) {
      console.error('AI counter proposal error:', error);
      res.status(500).json({ message: "Failed to generate counter proposal" });
    }
  });

  // AI Provider Configuration Routes
  app.get("/api/ai/config", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { getAIConfig, getAIProvider, getAvailableProviders } = await import("./ai/providers");
      res.json({
        current_provider: getAIProvider(),
        available_providers: getAvailableProviders(),
        config: getAIConfig()
      });
    } catch (error) {
      console.error("Erro ao obter configuração de IA:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/ai/config/provider", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { provider } = req.body;
      const { setAIProvider, isProviderAvailable } = await import("./ai/providers");
      
      if (!isProviderAvailable(provider)) {
        return res.status(400).json({ error: `Provedor ${provider} não está disponível. Verifique se a API key está configurada.` });
      }
      
      setAIProvider(provider);
      res.json({ message: `Provedor alterado para ${provider} com sucesso`, current_provider: provider });
    } catch (error) {
      console.error("Erro ao alterar provedor de IA:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
