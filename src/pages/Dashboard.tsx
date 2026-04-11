import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, Sparkles, Download, RefreshCw } from "lucide-react";

const SIZES = [
  { label: "1:1", value: "1:1" },
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
] as const;

const STYLES = ["Realistic", "Anime", "Cinematic", "Digital Art"] as const;

export default function Dashboard() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<string>("1:1");
  const [style, setStyle] = useState<string>("Realistic");
  const [images, setImages] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    setGenerating(true);
    setImages([]);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: `${style} style: ${prompt}`, size, count: 2 },
      });
      if (error) throw error;
      if (data?.images) {
        setImages(data.images);
      } else {
        toast.error("No images returned");
      }
    } catch (err: any) {
      console.error(err);
      if (err?.status === 429) {
        toast.error("Rate limited — please wait a moment and try again.");
      } else if (err?.status === 402) {
        toast.error("Credits exhausted. Please add funds.");
      } else {
        toast.error(err?.message || "Failed to generate images");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (dataUrl: string, index: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `imageforge-${Date.now()}-${index}.png`;
    a.click();
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Create Images</h1>
        <p className="mt-2 text-muted-foreground">
          Describe what you want to see
        </p>
      </div>

      {/* Prompt Input */}
      <div className="mx-auto max-w-2xl space-y-4">
        <Textarea
          placeholder="A magical forest at sunset with glowing mushrooms..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] resize-none text-base"
        />

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Size</span>
            <div className="flex gap-1">
              {SIZES.map((s) => (
                <Button
                  key={s.value}
                  variant={size === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSize(s.value)}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Style</span>
            <div className="flex flex-wrap gap-1">
              {STYLES.map((s) => (
                <Button
                  key={s}
                  variant={style === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStyle(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          {generating ? "Generating..." : "Generate Images"}
        </Button>
      </div>

      {/* Results */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {generating &&
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        {images.map((img, i) => (
          <Card key={i} className="group relative overflow-hidden">
            <CardContent className="p-0">
              <img
                src={img}
                alt={`Generated ${i + 1}`}
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => handleDownload(img, i)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleGenerate}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
