import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Plus, Search, Grid, List, Clock, MoreHorizontal, Star } from "lucide-react";

const mockProjects = [
  { id: "1", name: "Instagram Story – Summer", updated: "5 min ago", starred: true, color: "from-primary/30 to-cyan/30" },
  { id: "2", name: "YouTube Thumbnail", updated: "2 hours ago", starred: false, color: "from-cyan/30 to-success/30" },
  { id: "3", name: "Brand Poster Launch", updated: "Yesterday", starred: true, color: "from-warning/30 to-primary/30" },
  { id: "4", name: "Social Post Collection", updated: "2 days ago", starred: false, color: "from-destructive/30 to-primary/30" },
  { id: "5", name: "Team Presentation Q4", updated: "3 days ago", starred: false, color: "from-primary/40 to-muted/40" },
  { id: "6", name: "Newsletter Header", updated: "1 week ago", starred: false, color: "from-success/30 to-cyan/30" },
];

export default function Projects() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = mockProjects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">{filtered.length} projects</p>
        </div>
        <Button className="gradient-primary text-primary-foreground">
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

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="group cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <div className={`relative aspect-[4/3] bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                <span className="text-3xl font-bold text-foreground/10">{p.name.charAt(0)}</span>
                {p.starred && <Star className="absolute top-3 right-3 h-4 w-4 fill-warning text-warning" />}
              </div>
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{p.updated}</div>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-lg border border-border/50 bg-card p-3 transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${p.color} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.updated}</p>
              </div>
              {p.starred && <Star className="h-4 w-4 fill-warning text-warning shrink-0" />}
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
