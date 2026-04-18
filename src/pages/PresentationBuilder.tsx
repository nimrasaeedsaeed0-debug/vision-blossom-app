import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PresentationIcon, Loader2, Download, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/lib/activity";
import { GenerationProgress } from "@/components/GenerationProgress";

interface Slide {
  title: string;
  bullets: string[];
}

export default function PresentationBuilder() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(6);
  const [busy, setBusy] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic");
      return;
    }
    setBusy(true);
    setSlides([]);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-prompt", {
        body: {
          prompt: `Create a ${slideCount}-slide presentation outline on: "${topic}".
Format your response as:

Slide 1: <title>
- bullet 1
- bullet 2
- bullet 3

Slide 2: <title>
- bullet 1
...

Keep each title under 8 words. 3-4 concise bullets per slide.`,
        },
      });
      if (error) throw error;
      const text = (data?.enhanced as string) || "";
      const parsed = parseSlides(text);
      setSlides(parsed);
      if (parsed.length === 0) {
        toast.error("Could not parse slides — try again");
      } else if (user) {
        await supabase.from("generations").insert({
          user_id: user.id,
          prompt: topic,
          tool: "presentations",
          output_type: "presentation",
          metadata: { slides: parsed } as never,
        });
        await logActivity(user.id, "created presentation", "presentation", undefined, { slides: parsed.length });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const downloadOutline = () => {
    const txt = slides
      .map((s, i) => `Slide ${i + 1}: ${s.title}\n${s.bullets.map((b) => `- ${b}`).join("\n")}`)
      .join("\n\n");
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presentation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = () => {
    const txt = slides
      .map((s, i) => `Slide ${i + 1}: ${s.title}\n${s.bullets.map((b) => `- ${b}`).join("\n")}`)
      .join("\n\n");
    navigator.clipboard.writeText(txt);
    toast.success("Copied");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 animate-fade-in" onKeyDown={onKeyDown}>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <PresentationIcon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold">Presentation Builder</h1>
        <p className="mt-2 text-muted-foreground">Generate a complete slide outline with AI</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label>Topic</Label>
            <Textarea
              placeholder="The future of renewable energy in urban planning…"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Number of slides</Label>
            <Input
              type="number"
              min={3}
              max={20}
              value={slideCount}
              onChange={(e) => setSlideCount(Math.max(3, Math.min(20, Number(e.target.value) || 6)))}
              className="max-w-[120px]"
            />
          </div>
          <GenerationProgress active={busy} estimatedSeconds={10} label="Drafting slides" />
          <Button
            onClick={generate}
            disabled={busy || !topic.trim()}
            size="lg"
            className="w-full gradient-primary text-primary-foreground"
          >
            {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {busy ? "Generating…" : "Generate Outline"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">⌘/Ctrl + Enter to run</p>
        </CardContent>
      </Card>

      {busy && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      )}

      {slides.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={copyAll}>
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button size="sm" onClick={downloadOutline}>
              <Download className="mr-2 h-4 w-4" /> Download Outline
            </Button>
          </div>
          {slides.map((s, i) => (
            <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-5">
                <div className="mb-2 flex items-baseline gap-3">
                  <span className="text-xs font-bold text-primary">Slide {i + 1}</span>
                  <h3 className="font-heading text-lg font-semibold">{s.title}</h3>
                </div>
                <ul className="ml-1 space-y-1 text-sm text-muted-foreground">
                  {s.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function parseSlides(text: string): Slide[] {
  const slides: Slide[] = [];
  const blocks = text.split(/\n\s*\n+/);
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    const titleMatch = lines[0].match(/^(?:slide\s*\d+\s*[:\-]\s*|#+\s*)?(.+?)$/i);
    if (!titleMatch) continue;
    const title = titleMatch[1].replace(/^\*\*|\*\*$/g, "").trim();
    const bullets = lines
      .slice(1)
      .map((l) => l.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean);
    if (title && bullets.length > 0) slides.push({ title, bullets });
  }
  return slides;
}
