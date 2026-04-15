import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles, Film, Wand2, Scissors, Expand, Eraser, PresentationIcon,
  MessageSquare, Palette, Loader2, Download, Zap
} from "lucide-react";

const tools = [
  { id: "text-to-image", icon: Sparkles, label: "Text to Image", desc: "Generate images from text prompts", color: "text-primary" },
  { id: "image-to-video", icon: Film, label: "Image to Video", desc: "Animate static images", color: "text-cyan" },
  { id: "enhancer", icon: Wand2, label: "Image Enhancer", desc: "Upscale & improve images", color: "text-success" },
  { id: "bg-remover", icon: Scissors, label: "Background Remover", desc: "Remove backgrounds instantly", color: "text-warning" },
  { id: "expander", icon: Expand, label: "Image Expander", desc: "Extend images with AI outpainting", color: "text-primary" },
  { id: "eraser", icon: Eraser, label: "Magic Erase", desc: "Remove objects from images", color: "text-destructive" },
  { id: "presentations", icon: PresentationIcon, label: "Presentation Builder", desc: "Generate full slide decks", color: "text-cyan" },
  { id: "captions", icon: MessageSquare, label: "Caption Generator", desc: "AI-written captions & hashtags", color: "text-warning" },
  { id: "style-transfer", icon: Palette, label: "Style Transfer", desc: "Apply artistic styles to photos", color: "text-primary" },
];

const SIZES = [
  { label: "1:1", value: "1:1" },
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
  { label: "4:5", value: "4:5" },
];

const STYLES = ["Realistic", "Anime", "Cinematic", "Digital Art", "Watercolor", "Oil Painting", "Sketch", "Pixel Art", "3D Render", "Comic Book"];

export default function AITools() {
  const [activeTool, setActiveTool] = useState("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1:1");
  const [style, setStyle] = useState("Realistic");
  const [images, setImages] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [captionInput, setCaptionInput] = useState("");
  const [captions, setCaptions] = useState<string[]>([]);
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Enter a prompt"); return; }
    setGenerating(true);
    setImages([]);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: `${style} style: ${prompt}`, size, count: 2 },
      });
      if (error) throw error;
      if (data?.images) setImages(data.images);
    } catch (err: any) {
      toast.error(err?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleCaptions = async () => {
    if (!captionInput.trim()) { toast.error("Describe your post"); return; }
    setGenerating(true);
    setCaptions([]);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-prompt", {
        body: { prompt: `Generate 3 social media caption variations for: ${captionInput}. Include hashtags.` },
      });
      if (error) throw error;
      if (data?.enhanced) setCaptions(data.enhanced.split("\n\n").filter(Boolean));
    } catch (err: any) {
      toast.error(err?.message || "Failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      <h1 className="mb-2 font-heading text-3xl font-bold">AI Tools</h1>
      <p className="mb-6 text-muted-foreground">Powerful AI features to supercharge your creativity</p>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Tool Selector */}
        <div className="space-y-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                activeTool === tool.id
                  ? "bg-primary/10 border border-primary/20 font-medium"
                  : "hover:bg-muted"
              }`}
            >
              <tool.icon className={`h-4 w-4 shrink-0 ${tool.color}`} />
              <div>
                <p className="font-medium">{tool.label}</p>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Active Tool */}
        <div>
          {activeTool === "text-to-image" && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Text to Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea placeholder="Describe the image you want to create..." value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[100px]" />
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Size</Label>
                    <div className="flex gap-1">
                      {SIZES.map((s) => (
                        <Button key={s.value} variant={size === s.value ? "default" : "outline"} size="sm" onClick={() => setSize(s.value)}>{s.label}</Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Style</Label>
                    <div className="flex flex-wrap gap-1">
                      {STYLES.map((s) => (
                        <Button key={s} variant={style === s ? "default" : "outline"} size="sm" onClick={() => setStyle(s)}>{s}</Button>
                      ))}
                    </div>
                  </div>
                </div>
                <Button onClick={handleGenerate} disabled={generating} className="gradient-primary text-primary-foreground w-full transition-all duration-200 hover:scale-[1.02]">
                  {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4 fill-current" />}
                  {generating ? "Generating..." : "Generate Images"}
                </Button>
                <div className="grid gap-4 sm:grid-cols-2">
                  {generating && [0, 1].map((i) => <Skeleton key={i} className="aspect-square rounded-xl animate-shimmer" />)}
                  {images.map((img, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-xl border animate-scale-in">
                      <img src={img} alt="" className="aspect-square w-full object-cover" />
                      <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Button size="icon" variant="secondary" onClick={() => { const a = document.createElement("a"); a.href = img; a.download = `flashai-${Date.now()}.png`; a.click(); }}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTool === "captions" && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-warning" />
                  Caption Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea placeholder="Describe your post or upload context..." value={captionInput} onChange={(e) => setCaptionInput(e.target.value)} className="min-h-[80px]" />
                <Button onClick={handleCaptions} disabled={generating} className="w-full gradient-primary text-primary-foreground">
                  {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4 fill-current" />}
                  Generate Captions
                </Button>
                {captions.length > 0 && (
                  <div className="space-y-3">
                    {captions.map((c, i) => (
                      <div key={i} className="rounded-lg border p-4 text-sm animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                        <p>{c}</p>
                        <Button size="sm" variant="ghost" className="mt-2" onClick={() => { navigator.clipboard.writeText(c); toast.success("Copied!"); }}>Copy</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!["text-to-image", "captions"].includes(activeTool) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  {(() => { const t = tools.find((t) => t.id === activeTool); return t ? <t.icon className={`h-8 w-8 ${t.color}`} /> : null; })()}
                </div>
                <h3 className="font-heading text-xl font-semibold">
                  {tools.find((t) => t.id === activeTool)?.label}
                </h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  This tool is coming soon. We're building something amazing — stay tuned!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
