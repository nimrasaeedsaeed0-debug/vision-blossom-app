import {
  Film, Wand2, Clock, Settings, LayoutDashboard,
  FolderOpen, Sparkles, Scissors, Palette, PresentationIcon,
  MessageSquare, Star, Expand, Eraser, Image as ImageIcon,
  Video, UserCircle, Award, Smartphone, Brush, Replace,
  SlidersHorizontal, ScanFace, BookOpen, Maximize2, Users,
  FolderHeart,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: "Beta" | "Soon";
};

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Templates", url: "/templates", icon: LayoutDashboard },
];

const workNav: NavItem[] = [
  { title: "All Projects", url: "/projects", icon: FolderOpen },
  { title: "Favorites", url: "/favorites", icon: Star },
  { title: "History", url: "/history", icon: Clock },
];

const aiNav: NavItem[] = [
  { title: "Text to Image", url: "/ai-tools", icon: Sparkles },
  { title: "Image to Video", url: "/image-to-video", icon: Film },
  { title: "Image Enhancer", url: "/enhancer", icon: Wand2 },
  { title: "Background Remover", url: "/bg-remover", icon: Scissors },
  { title: "Image Expander", url: "/expander", icon: Expand },
  { title: "Magic Erase", url: "/magic-erase", icon: Eraser },
  { title: "Presentation Builder", url: "/presentations", icon: PresentationIcon },
  { title: "Caption Generator", url: "/captions", icon: MessageSquare },
  { title: "Style Transfer", url: "/style-transfer", icon: Palette },
];

const createNav: NavItem[] = [
  { title: "AI Video Generator", url: "/coming-soon/video-generator", icon: Video, badge: "Beta" },
  { title: "Avatar Creator", url: "/coming-soon/avatar-creator", icon: UserCircle, badge: "Beta" },
  { title: "Logo Maker", url: "/coming-soon/logo-maker", icon: Award, badge: "Beta" },
  { title: "Mockup Generator", url: "/coming-soon/mockup-generator", icon: Smartphone, badge: "Beta" },
];

const editNav: NavItem[] = [
  { title: "Smart Retouch", url: "/coming-soon/smart-retouch", icon: Brush, badge: "Beta" },
  { title: "Object Replacer", url: "/coming-soon/object-replacer", icon: Replace, badge: "Beta" },
  { title: "Color Grader", url: "/coming-soon/color-grader", icon: SlidersHorizontal, badge: "Beta" },
  { title: "Face Swap", url: "/coming-soon/face-swap", icon: ScanFace, badge: "Beta" },
];

const brandNav: NavItem[] = [
  { title: "Brand Kit", url: "/brand-kit", icon: Palette },
  { title: "Template Library", url: "/templates", icon: BookOpen },
  { title: "Resize for Platform", url: "/coming-soon/resize", icon: Maximize2, badge: "Soon" },
];

const collabNav: NavItem[] = [
  { title: "Team Workspace", url: "/coming-soon/team", icon: Users, badge: "Soon" },
  { title: "Asset Library", url: "/coming-soon/assets", icon: FolderHeart, badge: "Soon" },
];

function Badge({ kind }: { kind: "Beta" | "Soon" }) {
  const cls =
    kind === "Beta"
      ? "bg-primary/15 text-primary border-primary/20"
      : "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`ml-auto rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${cls}`}
    >
      {kind}
    </span>
  );
}

function NavSection({
  label,
  items,
  collapsed,
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
}) {
  const handleBetaClick = (e: React.MouseEvent, item: NavItem) => {
    if (!item.badge) return;
    e.preventDefault();
    toast.success(`You're on the list! We'll notify you when ${item.title} launches.`);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const link = (
              <NavLink
                to={item.url}
                end
                onClick={(e) => handleBetaClick(e, item)}
                className="hover:bg-sidebar-accent/50 transition-colors duration-200 flex items-center w-full"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-sidebar-primary"
              >
                <item.icon className="mr-2 h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
                {!collapsed && item.badge && <Badge kind={item.badge} />}
              </NavLink>
            );

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  {item.badge && !collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">
                        Coming soon — join the waitlist
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
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
          {collapsed ? <span className="text-xl">⚡</span> : <FlashLogo size="sm" />}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <NavSection label="Home" items={mainNav} collapsed={collapsed} />
        <NavSection label="My Work" items={workNav} collapsed={collapsed} />
        <NavSection label="AI Tools" items={aiNav} collapsed={collapsed} />
        <NavSection label="Create" items={createNav} collapsed={collapsed} />
        <NavSection label="Edit" items={editNav} collapsed={collapsed} />
        <NavSection label="Brand Kit" items={brandNav} collapsed={collapsed} />
        <NavSection label="Collaborate" items={collabNav} collapsed={collapsed} />
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
