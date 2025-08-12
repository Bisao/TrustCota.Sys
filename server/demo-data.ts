import { storage } from "./storage";

export async function seedDemoData() {
  try {
    // Check if demo data already exists
    const existingSuppliers = await storage.getSuppliers();
    if (existingSuppliers.length > 0) {
      console.log("Demo data already exists, skipping seed.");
      return;
    }

    console.log("Seeding demo data...");

    // Create demo user first
    const demoUser = await storage.createUser({
      username: "admin",
      password: "admin123", // In real app, this would be hashed
      email: "admin@trustcota.com",
      firstName: "Sistema",
      lastName: "Administrador",
      role: "admin",
      department: "TI"
    });

    // Create demo suppliers
    const supplier1 = await storage.createSupplier({
      name: "TechCorp Inc",
      contactEmail: "contact@techcorp.com",
      contactPhone: "+1 (555) 123-4567",
      address: "123 Tech Street, Silicon Valley, CA 94000",
      category: "it-equipment",
      rating: "4.8",
      totalOrders: 24,
      performanceScore: "95",
      status: "active",
      taxId: "12-3456789",
    });

    const supplier2 = await storage.createSupplier({
      name: "Office Solutions Pro",
      contactEmail: "sales@officesolutions.com",
      contactPhone: "+1 (555) 987-6543",
      address: "456 Business Ave, New York, NY 10001",
      category: "office-supplies",
      rating: "4.5",
      totalOrders: 18,
      performanceScore: "88",
      status: "active",
      taxId: "98-7654321",
    });

    const supplier3 = await storage.createSupplier({
      name: "Marketing Experts LLC",
      contactEmail: "hello@marketingexperts.com",
      contactPhone: "+1 (555) 456-7890",
      address: "789 Creative Blvd, Los Angeles, CA 90210",
      category: "marketing",
      rating: "4.7",
      totalOrders: 12,
      performanceScore: "92",
      status: "active",
      taxId: "45-6789012",
    });

    // Use the demo user
    const userId = demoUser.id;
    
    // Create demo requisitions
    const req1 = await storage.createRequisition({
      requesterId: userId,
      description: "New laptops for development team",
      category: "it-equipment",
      quantity: 5,
      estimatedAmount: "15000",
      urgency: "high",
      status: "pending",
      justification: "Current laptops are outdated and affecting productivity",
    });

    const req2 = await storage.createRequisition({
      requesterId: userId,
      description: "Office furniture for new workspace",
      category: "office-supplies",
      quantity: 20,
      estimatedAmount: "8500",
      urgency: "medium",
      status: "approved",
      justification: "Expanding team requires additional workspace setup",
    });

    const req3 = await storage.createRequisition({
      requesterId: userId,
      description: "Marketing campaign materials",
      category: "marketing",
      quantity: 1,
      estimatedAmount: "12000",
      urgency: "medium",
      status: "pending",
      justification: "Q1 marketing campaign launch materials and design services",
    });

    // Create demo quotes
    await storage.createQuote({
      requisitionId: req1.id,
      supplierId: supplier1.id,
      totalAmount: "14500",
      deliveryTime: 7,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "pending",
      terms: "Payment within 30 days. Free shipping included.",
    });

    await storage.createQuote({
      requisitionId: req2.id,
      supplierId: supplier2.id,
      totalAmount: "7800",
      deliveryTime: 14,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "pending",
      terms: "Bulk discount applied. Assembly service included.",
    });

    await storage.createQuote({
      requisitionId: req3.id,
      supplierId: supplier3.id,
      totalAmount: "11200",
      deliveryTime: 21,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "pending",
      terms: "Creative concepts included. Revisions up to 3 rounds.",
    });

    // Create demo purchase order
    await storage.createPurchaseOrder({
      requisitionId: req2.id,
      supplierId: supplier2.id,
      totalAmount: "7800",
      expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "pending",
    });

    // Create demo activities
    await storage.createActivity({
      userId: userId,
      action: "created",
      entityType: "requisition",
      entityId: req1.id,
      description: `Created requisition for ${req1.description}`,
    });

    await storage.createActivity({
      userId: userId,
      action: "created",
      entityType: "supplier",
      entityId: supplier1.id,
      description: `Added new supplier ${supplier1.name}`,
    });

    await storage.createActivity({
      userId: userId,
      action: "updated",
      entityType: "requisition",
      entityId: req2.id,
      description: `Approved requisition ${req2.requisitionNumber}`,
    });

    console.log("Demo data seeded successfully!");
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}