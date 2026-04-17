import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface FavGeneration {
  id: string;
  item_id: string;
  generation: {
    id: string;
    prompt: string;
    image_urls: string[] | null;
    created_at: string;
  } | null;
}

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favs, setFavs] = useState<FavGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: favRows } = await supabase
        .from("favorites")
        .select("id, item_id")
        .eq("user_id", user.id)
        .eq("item_type", "generation")
        .order("created_at", { ascending: false });

      const ids = (favRows || []).map((f) => f.item_id);
      if (ids.length === 0) {
        setFavs([]);
        setLoading(false);
        return;
      }
      const { data: gens } = await supabase
        .from("generations")
        .select("id, prompt, image_urls, created_at")
        .in("id", ids);

      const byId = new Map((gens || []).map((g) => [g.id, g]));
      setFavs(
        (favRows || []).map((f) => ({
          id: f.id,
          item_id: f.item_id,
          generation: byId.get(f.item_id) || null,
        }))
      );
      setLoading(false);
    })();
  }, [user]);

  const unfavorite = async (favId: string, itemId: string) => {
    await supabase.from("favorites").delete().eq("id", favId);
    setFavs((prev) => prev.filter((f) => f.item_id !== itemId));
    toast.success("Removed from favorites");
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
          <Star className="h-5 w-5 text-warning fill-warning" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold">Favorites</h1>
          <p className="text-muted-foreground">Your starred generations</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      ) : favs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl">
          <Star className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-heading text-lg font-semibold mb-1">No favorites yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Star generations in your history to find them here.</p>
          <Button onClick={() => navigate("/history")}><Sparkles className="mr-2 h-4 w-4" /> Browse History</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favs.map((f) => f.generation && (
            <Card key={f.id} className="overflow-hidden">
              <CardContent className="p-0">
                {f.generation.image_urls?.[0] && (
                  <img src={f.generation.image_urls[0]} alt={f.generation.prompt} className="aspect-square w-full object-cover" />
                )}
                <div className="p-3">
                  <p className="text-sm line-clamp-2 mb-2">{f.generation.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{new Date(f.generation.created_at).toLocaleDateString()}</span>
                    <button onClick={() => unfavorite(f.id, f.item_id)} aria-label="Unfavorite">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
