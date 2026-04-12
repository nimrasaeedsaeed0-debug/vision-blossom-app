import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SplitButton } from "@/components/SplitButton";
import { toast } from "sonner";
import {
  Loader2,
  Sparkles,
  Download,
  RefreshCw,
  Wand2,
  RotateCcw,
  Pencil,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const SIZES = [
  { label: "1:1", value: "1:1", w: 1024, h: 1024 },
  { label: "16:9", value: "16:9", w: 1024, h: 576 },
  { label: "9:16", value: "9:16", w: 576, h: 1024 },
] as const;

const STYLES = ["Realistic", "Anime", "Cinematic", "Digital Art"] as const;

type Provider = "lovable" | "huggingface";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [size, setSize] = useState<string>("1:1");
  const [style, setStyle] = useState<string>("Realistic");
  const [provider, setProvider] = useState<Provider>("lovable");
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [images, setImages] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const p = searchParams.get("prompt");
    if (p) setPrompt(p);
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    setGenerating(true);
    setImages([]);
    try {
      const sizeConfig = SIZES.find((s) => s.value === size) || SIZES[0];

      if (provider === "huggingface") {
        const { data, error } = await supabase.functions.invoke("generate-image-hf", {
          body: {
            prompt: `${style} style: ${prompt}`,
            negativePrompt: negativePrompt || undefined,
            width: sizeConfig.w,
            height: sizeConfig.h,
            guidanceScale,
            count: 2,
          },
        });
        if (error) throw error;
        if (data?.images) setImages(data.images);
        else toast.error("No images returned");
      } else {
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { prompt: `${style} style: ${prompt}`, size, count: 2 },
        });
        if (error) throw error;
        if (data?.images) setImages(data.images);
        else toast.error("No images returned");
      }

      // Save to history
      if (user) {
        await supabase.from("generations").insert({
          user_id: user.id,
          prompt: `${style} style: ${prompt}`,
          style,
          size,
          image_urls: images.length > 0 ? images : undefined,
        });
      }
    } catch (err: any) {
      console.error(err);
      if (err?.status === 429) {
        toast.error("Rate limited — please wait and try again.");
      } else if (err?.status === 503) {
        toast.error("Model is loading — try again in a moment.");
      } else {
        toast.error(err?.message || "Failed to generate images");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Enter a prompt to enhance");
      return;
    }
    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-prompt", {
        body: { prompt },
      });
      if (error) throw error;
      if (data?.enhanced) {
        setPrompt(data.enhanced);
        toast.success("Prompt enhanced!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to enhance prompt");
    } finally {
      setEnhancing(false);
    }
  };

  const handleReset = () => {
    setPrompt("");
    setNegativePrompt("");
    setImages([]);
    setSize("1:1");
    setStyle("Realistic");
    setGuidanceScale(7.5);
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
        <p className="mt-2 text-muted-foreground">Describe what you want to see</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-4">
        {/* Prompt */}
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
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Provider</span>
            <div className="flex gap-1">
              <Button
                variant={provider === "lovable" ? "default" : "outline"}
                size="sm"
                onClick={() => setProvider("lovable")}
              >
                Lovable AI
              </Button>
              <Button
                variant={provider === "huggingface" ? "default" : "outline"}
                size="sm"
                onClick={() => setProvider("huggingface")}
              >
                Stable Diffusion
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced (HF only) */}
        {provider === "huggingface" && (
          <div className="space-y-3 rounded-lg border p-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdvanced ? "▼" : "▶"} Advanced Settings
            </button>
            {showAdvanced && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Negative Prompt</Label>
                  <Input
                    placeholder="blurry, low quality, distorted..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">
                    Guidance Scale: {guidanceScale}
                  </Label>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={guidanceScale}
                    onChange={(e) => setGuidanceScale(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Split Button */}
        <SplitButton
          className="w-full"
          label={
            <>
              {generating ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              {generating ? "Generating..." : "Generate Images"}
            </>
          }
          onClick={handleGenerate}
          disabled={generating || enhancing}
          dropdownItems={[
            {
              label: enhancing ? "Enhancing..." : "Enhance Prompt",
              icon: <Wand2 className="h-4 w-4" />,
              onClick: handleEnhancePrompt,
            },
            {
              label: "Reset",
              icon: <RotateCcw className="h-4 w-4" />,
              onClick: handleReset,
            },
          ]}
        />
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
                  onClick={() =>
                    navigate(`/editor?image=${encodeURIComponent(img)}`)
                  }
                >
                  <Pencil className="h-4 w-4" />
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
