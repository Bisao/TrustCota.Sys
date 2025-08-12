import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Bell, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/use-language";
import LanguageSelector from "./language-selector";
import NotificationDropdown from "./notifications";
import TutorialSystem from "@/components/tutorial/tutorial-system";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { t } = useLanguage();

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">TrustCota</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <TutorialSystem />
            <NotificationDropdown />

            <div className="flex items-center space-x-3 border-l border-border pl-4">
              <LanguageSelector />

              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                <span>{user ? getUserInitials(user.firstName, user.lastName) : "JD"}</span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-foreground">
                  {user ? `${user.firstName} ${user.lastName}` : "John Doe"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.role === "admin" ? "Administrator" : "Procurement User"}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}