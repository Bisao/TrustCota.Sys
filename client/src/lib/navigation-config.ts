import { 
  LayoutDashboard, 
  FileText, 
  Building, 
  Quote, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  CheckCircle,
  Send,
  Scale,
  MessageSquare,
  Package,
  FileCheck,
  TrendingUp,
  Shield,
  Zap,
  MessageSquareQuote,
  ShoppingBag,
  Brain
} from "lucide-react";

export interface NavItem {
  icon: any;
  label: string;
  href: string;
  isNew?: boolean;
}

export const navigationItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FileText, label: "Requisitions", href: "/requisitions" },
  { icon: Building, label: "Suppliers", href: "/suppliers" },
  { icon: Shield, label: "Supplier Qualifications", href: "/supplier-qualifications" },
  { icon: Quote, label: "Quotes", href: "/quotes" },
  { icon: Send, label: "RFP Management", href: "/rfp-management" },
  { icon: Scale, label: "Quote Comparison", href: "/quote-comparison" },
  { icon: MessageSquare, label: "Negotiations", href: "/negotiations" },
  { icon: ShoppingCart, label: "Purchase Orders", href: "/purchase-orders" },
  { icon: FileCheck, label: "Receipts", href: "/receipts" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: FileCheck, label: "Contracts", href: "/contracts" },
  { icon: TrendingUp, label: "Spend Analysis", href: "/spend-analysis" },
  { icon: CheckCircle, label: "Approval Rules", href: "/approval-rules" },
  { icon: Send, label: "Flow Management", href: "/flow-management" },
  { icon: FileText, label: "Audit Logs", href: "/audit-logs" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Brain, label: "AI Insights", href: "/ai-insights" },
  { icon: Zap, label: "Integrations", href: "/integrations" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

// Items that should appear in the mobile bottom nav (most frequently used)
export const primaryMobileNavItems = navigationItems.filter(item => 
  ["/", "/requisitions", "/suppliers", "/quotes"].includes(item.href)
);

// All items for the mobile "More" menu
export const allMobileNavItems = navigationItems;