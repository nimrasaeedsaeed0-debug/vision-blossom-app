import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { QuickCreateFab } from "@/components/QuickCreateFab";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/pricing"];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
  const showSidebar = user && !isPublicRoute;

  if (showSidebar) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-50 h-14 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-lg px-4">
              <SidebarTrigger className="ml-0" />
              <Navbar minimal />
            </header>
            <main className="flex-1">{children}</main>
          </div>
          <QuickCreateFab />
        </div>
      </SidebarProvider>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <QuickCreateFab />
    </div>
  );
}
