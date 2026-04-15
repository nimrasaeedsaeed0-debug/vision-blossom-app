import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Search } from "lucide-react";
import { toast } from "sonner";

const categories = ["All", "Social Media", "Presentations", "Posters", "Business Cards", "Infographics", "Resumes", "Banners"];

const templates = [
  { id: "1", name: "Instagram Story – Minimal", category: "Social Media", isPro: false, color: "from-primary/40 to-cyan/20" },
  { id: "2", name: "YouTube Thumbnail – Bold", category: "Social Media", isPro: false, color: "from-cyan/40 to-success/20" },
  { id: "3", name: "Business Pitch Deck", category: "Presentations", isPro: true, color: "from-warning/40 to-primary/20" },
  { id: "4", name: "Event Poster – Neon", category: "Posters", isPro: false, color: "from-destructive/40 to-warning/20" },
  { id: "5", name: "LinkedIn Banner – Pro", category: "Banners", isPro: true, color: "from-primary/30 to-success/30" },
  { id: "6", name: "Resume – Modern Clean", category: "Resumes", isPro: false, color: "from-muted/60 to-primary/20" },
  { id: "7", name: "Infographic – Stats", category: "Infographics", isPro: true, color: "from-cyan/40 to-primary/30" },
  { id: "8", name: "Facebook Ad – Vibrant", category: "Social Media", isPro: false, color: "from-primary/50 to-cyan/40" },
  { id: "9", name: "Product Poster", category: "Posters", isPro: false, color: "from-success/30 to-warning/30" },
  { id: "10", name: "Business Card – Elegant", category: "Business Cards", isPro: true, color: "from-muted-foreground/20 to-primary/20" },
  { id: "11", name: "TikTok Cover", category: "Social Media", isPro: false, color: "from-destructive/30 to-cyan/30" },
  { id: "12", name: "Startup Deck – Dark", category: "Presentations", isPro: true, color: "from-background to-primary/20" },
];

export default function Templates() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = templates.filter((t) => {
    const matchCat = category === "All" || t.category === category;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      <h1 className="mb-2 font-heading text-3xl font-bold">Templates</h1>
      <p className="mb-6 text-muted-foreground">Start with a professionally designed template</p>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search templates..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" onClick={() => setCategory(cat)} className="rounded-full transition-all duration-200">
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((t) => (
          <div key={t.id} className="group cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
            <div className={`relative aspect-[3/4] bg-gradient-to-br ${t.color} flex items-center justify-center`}>
              <span className="text-lg font-bold text-foreground/10">{t.name.charAt(0)}</span>
              {t.isPro && (
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning">
                  <Crown className="h-3 w-3" /> Pro
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Button size="sm" onClick={() => toast.info("Template preview coming soon")}>Preview</Button>
                <Button size="sm" variant="secondary" onClick={() => toast.info("Editor opening coming soon")}>Use Template</Button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium truncate">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
