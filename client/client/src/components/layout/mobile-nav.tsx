import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { primaryMobileNavItems, allMobileNavItems } from "@/lib/navigation-config";
import { useNavigationTranslations } from "@/lib/translation-helper";

export default function MobileNav() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const getTranslatedLabel = useNavigationTranslations();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-5 gap-1">
        {primaryMobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          const translatedLabel = getTranslatedLabel(item.label);
          
          return (
            <Link key={item.href} href={item.href} className={cn(
              "p-3 text-center transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs block">{translatedLabel}</span>
            </Link>
          );
        })}
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="p-3 text-center transition-colors text-muted-foreground">
              <Menu className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs block">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh]">
            <div className="py-6">
              <h3 className="text-lg font-semibold mb-4">All Features</h3>
              <div className="grid grid-cols-2 gap-4">
                {allMobileNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  const translatedLabel = getTranslatedLabel(item.label);
                  
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                        isActive 
                          ? "text-primary-foreground bg-primary" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{translatedLabel}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
