import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Clock, MoreHorizontal, Star, Trash2, Pencil, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";

interface Project {
  id: string;
  name: string;
  type: string;
  thumbnail_url: string | null;
  starred: boolean;
  updated_at: string;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

const COLORS = [
  "from-primary/25 to-cyan-400/20",
  "from-cyan-400/25 to-emerald-400/20",
  "from-amber-300/25 to-primary/20",
  "from-rose-300/25 to-primary/20",
  "from-primary/20 to-accent/40",
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, type, thumbnail_url, starred, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) toast.error("Failed to load projects");
    else setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const createProject = async () => {
    if (!user || creating) return;
    setCreating(true);
    const name = `Untitled ${new Date().toLocaleDateString()}`;
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name, type: "design" })
      .select()
      .single();
    setCreating(false);
    if (error || !data) {
      toast.error("Could not create project");
      return;
    }
    await logActivity(user.id, "created project", "project", data.id, { name });
    toast.success("Project created");
    navigate(`/editor?project=${data.id}`);
  };

  const toggleStar = async (p: Project) => {
    const { error } = await supabase
      .from("projects")
      .update({ starred: !p.starred })
      .eq("id", p.id);
    if (!error) setProjects((prev) => prev.map((x) => x.id === p.id ? { ...x, starred: !x.starred } : x));
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else {
      setProjects((prev) => prev.filter((x) => x.id !== id));
      toast.success("Project deleted");
    }
  };

  const renameProject = async (p: Project) => {
    const newName = window.prompt("Rename project", p.name);
    if (!newName || newName === p.name) return;
    const { error } = await supabase.from("projects").update({ name: newName }).eq("id", p.id);
    if (!error) {
      setProjects((prev) => prev.map((x) => x.id === p.id ? { ...x, name: newName } : x));
      toast.success("Renamed");
    }
  };

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 animate-fade-in">
      {/* Greeting */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-base font-medium text-muted-foreground">
            Your projects, ready when you are.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/ai-tools")} className="font-semibold">
            <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
          </Button>
          <Button
            onClick={createProject}
            disabled={creating}
            className="gradient-primary text-primary-foreground font-semibold shadow-md hover:glow-primary transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          className="pl-10 font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid: New Project card + Projects */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* New Project Card — always first */}
        <button
          onClick={createProject}
          disabled={creating}
          className="group flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:glow-primary disabled:opacity-60"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-md transition-transform duration-300 group-hover:scale-110">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <p className="font-heading text-base font-bold text-foreground">New Project</p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">Start with a blank canvas</p>
          </div>
        </button>

        {/* Loading skeletons */}
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
        ))}

        {/* Projects */}
        {!loading && filtered.map((p, i) => (
          <div
            key={p.id}
            onClick={() => navigate(`/editor?project=${p.id}`)}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg animate-fade-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className={`relative aspect-[4/3] bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center`}>
              {p.thumbnail_url ? (
                <img src={p.thumbnail_url} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-heading text-5xl font-black text-foreground/15">
                  {p.name.charAt(0).toUpperCase()}
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); toggleStar(p); }}
                className="absolute top-3 right-3 rounded-full bg-background/70 p-1.5 backdrop-blur-sm transition-transform hover:scale-110"
                aria-label={p.starred ? "Unstar" : "Star"}
              >
                <Star className={`h-4 w-4 ${p.starred ? "fill-warning text-warning" : "text-foreground/60"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
                <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />{timeAgo(p.updated_at)}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => renameProject(p)}>
                    <Pencil className="mr-2 h-4 w-4" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteProject(p.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && search && (
        <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
          No projects match "{search}".
        </p>
      )}
    </div>
  );
}
