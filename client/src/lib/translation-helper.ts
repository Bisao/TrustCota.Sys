import { useLanguage } from "@/hooks/use-language";

// Centralized translation helper to eliminate duplication
export const useNavigationTranslations = () => {
  const { t } = useLanguage();
  
  return (label: string): string => {
    const translations: Record<string, string> = {
      "Dashboard": t("dashboard"),
      "Requisitions": t("requisitions"),
      "Suppliers": t("suppliers"),
      "Quotes": t("quotes"),
      "Purchase Orders": t("purchaseOrders"),
      "Analytics": t("analytics"),
      "AI Insights": "Insights de IA",
      "Settings": t("settings"),
      "Integrations": "Integrações"
    };
    return translations[label] || label;
  };
};