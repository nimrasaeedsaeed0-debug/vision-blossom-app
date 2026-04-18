import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Loader2, Copy, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/lib/activity";
import { GenerationProgress } from "@/components/GenerationProgress";

const TONES = ["Witty", "Professional", "Inspirational", "Casual", "Bold"];

export default function CaptionGenerator() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("Witty");
  const [busy, setBusy] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File must be 5MB or smaller");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const generate = async () => {
    if (!preview && !description.trim()) {
      toast.error("Upload an image or describe your post");
      return;
    }
    setBusy(true);
    setCaptions([]);
    try {
      const ctx = description.trim()
        ? `Post description: ${description.trim()}`
        : "An uploaded image (no description provided).";
      const { data, error } = await supabase.functions.invoke("enhance-prompt", {
        body: {
          prompt: `You are a social media copywriter. Tone: ${tone}.
Generate exactly 5 distinct caption variations for this post.
Each caption must include 5-8 relevant hashtags at the end.
Separate each caption with a line containing only "---".
Do not number the captions.

${ctx}`,
        },
      });
      if (error) throw error;
      const text = (data?.enhanced as string) || "";
      const parts = text
        .split(/\n?---\n?/)
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 5);
      setCaptions(parts);
      if (parts.length > 0 && user) {
        await supabase.from("generations").insert({
          user_id: user.id,
          prompt: description || "Image caption",
          tool: "captions",
          output_type: "text",
          metadata: { captions: parts, tone } as never,
        });
        await logActivity(user.id, "generated captions", "text", undefined, { count: parts.length });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 animate-fade-in" onKeyDown={onKeyDown}>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold">Caption Generator</h1>
        <p className="mt-2 text-muted-foreground">5 caption variations with hashtags, instantly</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label>Image (optional)</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/30 px-4 py-6 hover:border-primary/40"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{preview ? "Change image" : "Upload an image"}</span>
            </button>
            {preview && (
              <img src={preview} alt="Preview" className="mt-2 max-h-48 rounded-lg border object-contain" />
            )}
          </div>
          <div className="space-y-2">
            <Label>Or describe your post</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A new product launch for sustainable sneakers made from ocean plastic…"
              className="min-h-[80px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={tone === t ? "default" : "outline"}
                  onClick={() => setTone(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
          <GenerationProgress active={busy} estimatedSeconds={6} label="Writing captions" />
          <Button
            onClick={generate}
            disabled={busy}
            size="lg"
            className="w-full gradient-primary text-primary-foreground"
          >
            {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {busy ? "Writing…" : "Generate Captions"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">⌘/Ctrl + Enter to run</p>
        </CardContent>
      </Card>

      {busy && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {captions.length > 0 && (
        <div className="mt-6 space-y-3">
          {captions.map((c, i) => (
            <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">Variation {i + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(c);
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="mr-1 h-3 w-3" /> Copy
                  </Button>
                </div>
                <p className="whitespace-pre-wrap text-sm">{c}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
