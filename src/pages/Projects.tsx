import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderOpen, Plus, Search, Grid, List, Clock, MoreHorizontal, Star, Trash2, Pencil } from "lucide-react";
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
  "from-primary/30 to-cyan-500/20",
  "from-cyan-500/30 to-emerald-500/20",
  "from-amber-500/30 to-primary/20",
  "from-rose-500/30 to-primary/20",
];

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, type, thumbnail_url, starred, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error("Failed to load projects");
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const createProject = async () => {
    if (!user) return;
    const name = `Untitled ${new Date().toLocaleDateString()}`;
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name, type: "design" })
      .select()
      .single();
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
    if (!error) {
      setProjects((prev) => prev.map((x) => x.id === p.id ? { ...x, starred: !x.starred } : x));
    }
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

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">{loading ? "Loading…" : `${filtered.length} project${filtered.length === 1 ? "" : "s"}`}</p>
        </div>
        <Button className="gradient-primary text-primary-foreground" onClick={createProject}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          <Button size="icon" variant={view === "grid" ? "default" : "ghost"} className="h-8 w-8" onClick={() => setView("grid")}><Grid className="h-4 w-4" /></Button>
          <Button size="icon" variant={view === "list" ? "default" : "ghost"} className="h-8 w-8" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/50 rounded-xl">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-heading text-lg font-semibold mb-1">
            {search ? "No matching projects" : "No projects yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {search ? "Try a different search term." : "Create your first project to get started — or pick a template."}
          </p>
          {!search && (
            <div className="flex gap-2">
              <Button onClick={createProject}>
                <Plus className="mr-2 h-4 w-4" /> Create Project
              </Button>
              <Button variant="outline" onClick={() => navigate("/templates")}>
                Browse Templates
              </Button>
            </div>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              onClick={() => navigate(`/editor?project=${p.id}`)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
            >
              <div className={`relative aspect-[4/3] bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center`}>
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-foreground/10">{p.name.charAt(0).toUpperCase()}</span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStar(p); }}
                  className="absolute top-3 right-3"
                  aria-label={p.starred ? "Unstar" : "Star"}
                >
                  <Star className={`h-4 w-4 transition-colors ${p.starred ? "fill-warning text-warning" : "text-foreground/40 hover:text-warning"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{timeAgo(p.updated_at)}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => renameProject(p)}><Pencil className="mr-2 h-4 w-4" /> Rename</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteProject(p.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              onClick={() => navigate(`/editor?project=${p.id}`)}
              className="flex items-center gap-4 rounded-lg border border-border/50 bg-card p-3 transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer"
            >
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${COLORS[i % COLORS.length]} shrink-0 overflow-hidden`}>
                {p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(p.updated_at)}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); toggleStar(p); }} aria-label="Star">
                <Star className={`h-4 w-4 ${p.starred ? "fill-warning text-warning" : "text-muted-foreground"}`} />
              </button>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
