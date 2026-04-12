import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Copy, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Generation {
  id: string;
  prompt: string;
  style: string | null;
  size: string | null;
  image_urls: string[] | null;
  created_at: string;
}

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
      toast.error("Failed to load history");
    } else {
      setGenerations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied!");
  };

  const handleRerun = (prompt: string) => {
    navigate(`/dashboard?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("generations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      toast.success("Deleted");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Generation History</h1>
        <p className="mt-2 text-muted-foreground">
          View and reuse your previous generations
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : generations.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p className="text-lg">No generations yet</p>
          <p className="text-sm">Your generated images will appear here</p>
          <Button className="mt-4" onClick={() => navigate("/dashboard")}>
            Start Creating
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {generations.map((gen) => (
            <Card key={gen.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Thumbnails */}
                  {gen.image_urls && gen.image_urls.length > 0 && (
                    <div className="flex gap-2 sm:w-48 shrink-0">
                      {gen.image_urls.slice(0, 2).map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Gen ${i}`}
                          className="h-20 w-20 rounded-lg border object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">
                      {gen.prompt}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {gen.style && <span className="rounded bg-muted px-2 py-0.5">{gen.style}</span>}
                      {gen.size && <span className="rounded bg-muted px-2 py-0.5">{gen.size}</span>}
                      <span>{new Date(gen.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyPrompt(gen.prompt)}
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRerun(gen.prompt)}
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Re-run
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(gen.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                      </Button>
                    </div>
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
