import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Copy, RefreshCw, Trash2, Download, Eye, Star } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Generation {
  id: string;
  prompt: string;
  style: string | null;
  size: string | null;
  image_urls: string[] | null;
  created_at: string;
  tool?: string | null;
  output_type?: string | null;
}

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<{ url: string; prompt: string } | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: gens, error }, { data: favs }] = await Promise.all([
      supabase
        .from("generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("favorites")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("item_type", "generation"),
    ]);

    if (error) toast.error("Failed to load history");
    else setGenerations(gens || []);
    setFavorites(new Set((favs || []).map((f) => f.item_id)));
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, [user]);

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied!");
  };

  const rerun = (g: Generation) => {
    const params = new URLSearchParams({ prompt: g.prompt });
    if (g.style) params.set("style", g.style);
    if (g.size) params.set("size", g.size);
    navigate(`/dashboard?${params.toString()}`);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("generations").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      toast.success("Deleted");
    }
  };

  const download = async (url: string) => {
    try {
      const r = await fetch(url);
      const blob = await r.blob();
      const dl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dl;
      a.download = `flashai-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(dl);
    } catch {
      toast.error("Download failed");
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!user) return;
    const isFav = favorites.has(id);
    if (isFav) {
      await supabase.from("favorites").delete()
        .eq("user_id", user.id).eq("item_id", id).eq("item_type", "generation");
      setFavorites((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id, item_id: id, item_type: "generation",
      });
      setFavorites((prev) => new Set(prev).add(id));
      toast.success("Added to favorites");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold">Generation History</h1>
        <p className="mt-2 text-muted-foreground">View, re-run, and download your creations</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : generations.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p className="text-lg">No generations yet</p>
          <p className="text-sm">Your generated images will appear here</p>
          <Button className="mt-4" onClick={() => navigate("/dashboard")}>Start Creating</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {generations.map((gen) => {
            const isFav = favorites.has(gen.id);
            return (
              <Card key={gen.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* Outputs */}
                    {gen.image_urls && gen.image_urls.length > 0 && (
                      <div className="flex gap-2 sm:w-56 shrink-0">
                        {gen.image_urls.slice(0, 2).map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setPreview({ url, prompt: gen.prompt })}
                            className="group relative h-24 w-24 overflow-hidden rounded-lg border hover:border-primary/50 transition-colors"
                            aria-label="View full image"
                          >
                            <img src={url} alt={`Output ${i + 1}`} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="h-5 w-5 text-white" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{gen.prompt}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {gen.tool && <span className="rounded bg-primary/10 text-primary px-2 py-0.5 capitalize">{gen.tool.replace(/-/g, " ")}</span>}
                        {gen.style && <span className="rounded bg-muted px-2 py-0.5">{gen.style}</span>}
                        {gen.size && <span className="rounded bg-muted px-2 py-0.5">{gen.size}</span>}
                        <span>{new Date(gen.created_at).toLocaleString()}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => copyPrompt(gen.prompt)}>
                          <Copy className="mr-1 h-3 w-3" /> Copy
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => rerun(gen)}>
                          <RefreshCw className="mr-1 h-3 w-3" /> Re-run
                        </Button>
                        {gen.image_urls?.[0] && (
                          <Button size="sm" variant="outline" onClick={() => download(gen.image_urls![0])}>
                            <Download className="mr-1 h-3 w-3" /> Download
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFavorite(gen.id)}
                          aria-pressed={isFav}
                        >
                          <Star className={`mr-1 h-3 w-3 ${isFav ? "fill-warning text-warning" : ""}`} />
                          {isFav ? "Starred" : "Star"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(gen.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="line-clamp-2 pr-6">{preview?.prompt}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-3">
              <img src={preview.url} alt="Full" className="w-full rounded-lg" />
              <div className="flex gap-2">
                <Button onClick={() => download(preview.url)}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button variant="outline" onClick={() => copyPrompt(preview.prompt)}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Prompt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
