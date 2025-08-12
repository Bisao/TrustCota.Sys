import { ReactNode } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />
      <div className="flex h-[calc(100vh-80px)]">
        {/* Desktop Sidebar - Only visible on large screens */}
        <aside className="hidden lg:block">
          <ScrollArea className="h-full w-64 border-r border-border">
            <Sidebar />
          </ScrollArea>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 h-full">
            <div className="p-4 md:p-6 pb-20 lg:pb-6">
              <div className="max-w-7xl mx-auto w-full">
                {(title || subtitle) && (
                  <div className="mb-6 md:mb-8">
                    {title && (
                      <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="text-muted-foreground text-sm md:text-base">
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="w-full">
                  {children}
                </div>
              </div>
            </div>
          </ScrollArea>
        </main>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}