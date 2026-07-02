import {
  Wand2, Clock, Settings, LayoutDashboard,
  FolderOpen, Sparkles, Scissors, Palette, PresentationIcon,
  MessageSquare, Star, Expand, Eraser, BookOpen, Plus, Check, Building2, ChevronDown,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/hooks/useWorkspace";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Templates", url: "/templates", icon: BookOpen },
];

const workNav: NavItem[] = [
  { title: "All Projects", url: "/projects", icon: FolderOpen },
  { title: "Favorites", url: "/favorites", icon: Star },
  { title: "History", url: "/history", icon: Clock },
];

const aiNav: NavItem[] = [
  { title: "Text to Image", url: "/ai-tools", icon: Sparkles },
  { title: "Image Enhancer", url: "/enhancer", icon: Wand2 },
  { title: "Background Remover", url: "/bg-remover", icon: Scissors },
  { title: "Image Expander", url: "/expander", icon: Expand },
  { title: "Magic Erase", url: "/magic-erase", icon: Eraser },
  { title: "Style Transfer", url: "/style-transfer", icon: Palette },
  { title: "Presentation Builder", url: "/presentations", icon: PresentationIcon },
  { title: "Caption Generator", url: "/captions", icon: MessageSquare },
];

const brandNav: NavItem[] = [
  { title: "Brand Kit", url: "/brand-kit", icon: Palette },
];

function NavSection({
  label,
  items,
  collapsed,
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
}) {
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
                  className="hover:bg-sidebar-accent/60 transition-colors duration-200 flex items-center w-full rounded-md"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="mr-2 h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const navigate = useNavigate();

  if (collapsed) {
    return (
      <button
        onClick={() => navigate("/workspace/create")}
        className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20 mx-auto"
        title={activeWorkspace?.name || "Create workspace"}
      >
        <Building2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-left transition hover:bg-sidebar-accent">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Workspace</div>
            <div className="text-sm font-medium truncate">{activeWorkspace?.name || "None"}</div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Your workspaces</DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem key={w.id} onClick={() => setActiveWorkspace(w)}>
            <span className="flex-1 truncate">{w.name}</span>
            {activeWorkspace?.id === w.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/workspace/create")}>
          <Plus className="mr-2 h-4 w-4" /> New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4 space-y-3">
        <NavLink to="/" className="flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02]">
          {collapsed ? <span className="text-xl">⚡</span> : <FlashLogo size="sm" />}
        </NavLink>
        <WorkspaceSwitcher collapsed={collapsed} />
      </SidebarHeader>

      <SidebarContent>
        <NavSection label="Home" items={mainNav} collapsed={collapsed} />
        <NavSection label="My Work" items={workNav} collapsed={collapsed} />
        <NavSection label="AI Tools" items={aiNav} collapsed={collapsed} />
        <NavSection label="Brand" items={brandNav} collapsed={collapsed} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className="hover:bg-sidebar-accent/50 transition-colors duration-200 flex items-center w-full"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              >
                <Settings className="mr-2 h-4 w-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
