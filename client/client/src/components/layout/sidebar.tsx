import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils"
import { navigationItems } from "@/lib/navigation-config"
import { useNavigationTranslations } from "@/lib/translation-helper"

export default function Sidebar() {
  const [location] = useLocation();
  const getTranslatedLabel = useNavigationTranslations();

  return (
    <nav className="w-full bg-card h-full">
      <div className="p-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            const translatedLabel = getTranslatedLabel(item.label);

            return (
              <li key={item.href}>
                <Link href={item.href} className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-sm font-medium",
                  isActive 
                    ? "text-primary-foreground bg-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{translatedLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}