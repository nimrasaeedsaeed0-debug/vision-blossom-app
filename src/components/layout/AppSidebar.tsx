import {
  Film, Wand2, Clock, Settings, LayoutDashboard,
  FolderOpen, Sparkles, Scissors, Palette, PresentationIcon, MessageSquare, Star
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { FlashLogo } from "@/components/FlashLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Templates", url: "/templates", icon: LayoutDashboard },
  { title: "Brand Kit", url: "/brand-kit", icon: Palette },
];

const workNav = [
  { title: "All Projects", url: "/projects", icon: FolderOpen },
  { title: "Favorites", url: "/favorites", icon: Star },
  { title: "History", url: "/history", icon: Clock },
];

const aiNav = [
  { title: "Text to Image", url: "/ai-tools", icon: Sparkles },
  { title: "Image to Video", url: "/image-to-video", icon: Film },
  { title: "Image Enhancer", url: "/enhancer", icon: Wand2 },
  { title: "Background Remover", url: "/ai-tools/bg-remover", icon: Scissors },
  { title: "Presentation Builder", url: "/ai-tools/presentations", icon: PresentationIcon },
  { title: "Caption Generator", url: "/ai-tools/captions", icon: MessageSquare },
];

function NavSection({ label, items, collapsed }: { label: string; items: typeof mainNav; collapsed: boolean }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end
                  className="hover:bg-sidebar-accent/50 transition-colors duration-200"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-sidebar-primary"
                >
                  <item.icon className="mr-2 h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <NavLink to="/" className="flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02]">
          {collapsed ? (
            <span className="text-xl">⚡</span>
          ) : (
            <FlashLogo size="sm" />
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <NavSection label="Home" items={mainNav} collapsed={collapsed} />
        <NavSection label="My Work" items={workNav} collapsed={collapsed} />
        <NavSection label="AI Tools" items={aiNav} collapsed={collapsed} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className="hover:bg-sidebar-accent/50 transition-colors duration-200"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              >
                <Settings className="mr-2 h-4 w-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && <ThemeToggle />}
      </SidebarFooter>
    </Sidebar>
  );
}
