import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
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
  Loader2, Sparkles, Download, RefreshCw, Wand2, RotateCcw, Pencil,
  Plus, Zap, Upload, LayoutGrid, FolderOpen, Clock, Copy, Share2, Camera
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";
import { useWorkspace } from "@/hooks/useWorkspace";

const SIZES = [
  { label: "1:1", value: "1:1", w: 1024, h: 1024 },
  { label: "16:9", value: "16:9", w: 1024, h: 576 },
  { label: "9:16", value: "9:16", w: 576, h: 1024 },
  { label: "4:5", value: "4:5", w: 1024, h: 1280 },
] as const;

const STYLES = ["Realistic", "Anime", "Cinematic", "Digital Art", "Watercolor", "3D Render"] as const;

type Provider = "lovable" | "realistic" | "huggingface";

interface RecentProject {
  id: string;
  name: string;
  thumbnail_url: string | null;
  updated_at: string;
}

interface ActivityItem {
  id: string;
  action: string;
  resource_type: string | null;
  created_at: string;
}

const PROJECT_COLORS = [
  "from-primary/30 to-cyan-500/20",
  "from-cyan-500/30 to-emerald-500/20",
  "from-warning/30 to-primary/20",
  "from-rose-500/30 to-primary/20",
];

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
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
  const [activeTab, setActiveTab] = useState<"create" | "projects">("create");
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const p = searchParams.get("prompt");
    if (p) setPrompt(p);
    const sz = searchParams.get("size");
    if (sz) setSize(sz);
    const st = searchParams.get("style");
    if (st) setStyle(st);
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: projects }, { data: acts }, { data: settings }] = await Promise.all([
        supabase.from("projects").select("id, name, thumbnail_url, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(4),
        supabase.from("activity_log").select("id, action, resource_type, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("user_settings").select("default_size, default_style").eq("user_id", user.id).maybeSingle(),
      ]);
      setRecentProjects(projects || []);
      setActivity(acts || []);
      if (settings) {
        if (!searchParams.get("size")) setSize(settings.default_size);
        if (!searchParams.get("style")) setStyle(settings.default_style);
      }
    })();
  }, [user, searchParams]);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Please enter a prompt"); return; }
    setGenerating(true);
    setImages([]);
    let resultImages: string[] = [];
    try {
      const sizeConfig = SIZES.find((s) => s.value === size) || SIZES[0];
      if (provider === "huggingface") {
        const { data, error } = await supabase.functions.invoke("generate-image-hf", {
          body: { prompt: `${style} style: ${prompt}`, negativePrompt: negativePrompt || undefined, width: sizeConfig.w, height: sizeConfig.h, guidanceScale, count: 2 },
        });
        if (error) throw error;
        if (data?.images) { resultImages = data.images; setImages(data.images); }
        else toast.error("No images returned");
      } else {
        const isRealistic = provider === "realistic";
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { prompt: `${style} style: ${prompt}`, size, count: 2, realistic: isRealistic },
        });
        if (error) throw error;
        if (data?.images) { resultImages = data.images; setImages(data.images); }
        else toast.error("No images returned");
      }
      if (user && resultImages.length > 0) {
        await supabase.from("generations").insert({
          user_id: user.id,
          prompt: `${style} style: ${prompt}`,
          style, size,
          image_urls: resultImages,
          tool: "text-to-image",
          output_type: "image",
        });
        await logActivity(user.id, "generated images", "image", undefined, { count: resultImages.length, prompt });
      }
    } catch (err: any) {
      if (err?.status === 429) toast.error("Rate limited — please wait and try again.");
      else if (err?.status === 503) toast.error("Model is loading — try again in a moment.");
      else toast.error(err?.message || "Failed to generate images");
    } finally {
      setGenerating(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) { toast.error("Enter a prompt to enhance"); return; }
    setEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-prompt", { body: { prompt } });
      if (error) throw error;
      if (data?.enhanced) { setPrompt(data.enhanced); toast.success("Prompt enhanced!"); }
    } catch (err: any) {
      toast.error(err?.message || "Failed to enhance prompt");
    } finally {
      setEnhancing(false);
    }
  };

  const handleReset = () => {
    setPrompt(""); setNegativePrompt(""); setImages([]); setSize("1:1"); setStyle("Realistic"); setGuidanceScale(7.5);
  };

  const handleDownload = (dataUrl: string, index: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `flashai-${Date.now()}-${index}.png`;
    a.click();
  };

  const handleCopyPrompt = () => {
    if (!prompt.trim()) { toast.error("Nothing to copy"); return; }
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied");
  };

  const handleShare = async (dataUrl: string) => {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "flashai.png", { type: blob.type });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Made with Flash AI" });
      } else {
        await navigator.clipboard.writeText(dataUrl);
        toast.success("Image URL copied to clipboard");
      }
    } catch {
      toast.error("Could not share");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Plus, label: "New Design", desc: "Start from scratch", onClick: () => setActiveTab("create") },
          { icon: Zap, label: "Generate with AI", desc: "Describe your idea", onClick: () => setActiveTab("create") },
          { icon: Upload, label: "Upload File", desc: "Import your media", onClick: () => toast.info("Coming soon") },
          { icon: LayoutGrid, label: "Templates", desc: "Browse 1,000+", onClick: () => navigate("/templates") },
        ].map(({ icon: Icon, label, desc, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="group flex flex-col items-start gap-3 rounded-2xl glass p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-foreground/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background transition-transform duration-300 group-hover:scale-110">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-semibold tracking-tight">{label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border bg-muted p-1">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${activeTab === "create" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Sparkles className="mr-2 inline h-4 w-4" />Create with AI
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${activeTab === "projects" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <FolderOpen className="mr-2 inline h-4 w-4" />Recent Projects
        </button>
      </div>

      {activeTab === "create" ? (
        <div className="mx-auto max-w-2xl space-y-4">
          <Textarea
            placeholder="A magical forest at sunset with glowing mushrooms..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleGenerate();
              }
            }}
            className="min-h-[100px] resize-none text-base"
          />
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Size</span>
              <div className="flex gap-1">
                {SIZES.map((s) => (
                  <Button key={s.value} variant={size === s.value ? "default" : "outline"} size="sm" onClick={() => setSize(s.value)} className="transition-all duration-200">{s.label}</Button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Style</span>
              <div className="flex flex-wrap gap-1">
                {STYLES.map((s) => (
                  <Button key={s} variant={style === s ? "default" : "outline"} size="sm" onClick={() => setStyle(s)} className="transition-all duration-200">{s}</Button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Model</span>
              <div className="flex flex-wrap gap-1">
                <Button variant={provider === "lovable" ? "default" : "outline"} size="sm" onClick={() => setProvider("lovable")} className="transition-all duration-200">
                  <Zap className="mr-1 h-3.5 w-3.5" /> Flash
                </Button>
                <Button variant={provider === "realistic" ? "default" : "outline"} size="sm" onClick={() => setProvider("realistic")} className="transition-all duration-200">
                  <Camera className="mr-1 h-3.5 w-3.5" /> Photorealistic
                </Button>
                <Button variant={provider === "huggingface" ? "default" : "outline"} size="sm" onClick={() => setProvider("huggingface")} className="transition-all duration-200">Stable Diffusion</Button>
              </div>
            </div>
          </div>
          {provider === "huggingface" && (
            <div className="space-y-3 rounded-lg border p-4">
              <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {showAdvanced ? "▼" : "▶"} Advanced Settings
              </button>
              {showAdvanced && (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-1">
                    <Label className="text-xs">Negative Prompt</Label>
                    <Input placeholder="blurry, low quality, distorted..." value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Guidance Scale: {guidanceScale}</Label>
                    <input type="range" min={1} max={20} step={0.5} value={guidanceScale} onChange={(e) => setGuidanceScale(Number(e.target.value))} className="w-full" />
                  </div>
                </div>
              )}
            </div>
          )}
          <SplitButton
            className="w-full"
            label={
              <>
                {generating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5 fill-current" />}
                {generating ? "Generating..." : "Generate Images"}
              </>
            }
            onClick={handleGenerate}
            disabled={generating || enhancing}
            dropdownItems={[
              { label: enhancing ? "Enhancing..." : "Enhance Prompt", icon: <Wand2 className="h-4 w-4" />, onClick: handleEnhancePrompt },
              { label: "Copy Prompt", icon: <Copy className="h-4 w-4" />, onClick: handleCopyPrompt },
              { label: "Reset", icon: <RotateCcw className="h-4 w-4" />, onClick: handleReset },
            ]}
          />
          {/* Results */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {generating && Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl animate-shimmer" />
            ))}
            {images.map((img, i) => (
              <Card key={i} className="group relative overflow-hidden animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
                <CardContent className="p-0">
                  <img src={img} alt={`Generated ${i + 1}`} className="aspect-square w-full object-cover" />
                  <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button size="icon" variant="secondary" onClick={() => handleDownload(img, i)} title="Download"><Download className="h-4 w-4" /></Button>
                    <Button size="icon" variant="secondary" onClick={() => handleShare(img)} title="Share"><Share2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="secondary" onClick={() => navigate(`/editor?image=${encodeURIComponent(img)}`)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="secondary" onClick={handleGenerate} title="Regenerate"><RefreshCw className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/50 rounded-xl">
              <FolderOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No projects yet — create your first one</p>
              <Button size="sm" onClick={() => navigate("/projects")}>
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentProjects.map((project, i) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/editor?project=${project.id}`)}
                  className="group cursor-pointer rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <div className={`aspect-[4/3] bg-gradient-to-br ${PROJECT_COLORS[i % PROJECT_COLORS.length]} flex items-center justify-center overflow-hidden`}>
                    {project.thumbnail_url ? (
                      <img src={project.thumbnail_url} alt={project.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-foreground/20">{project.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{project.name}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {timeAgo(project.updated_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Activity Feed */}
      {activity.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="rounded-xl border border-border/50 bg-card divide-y divide-border/50">
            {activity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate"><span className="font-medium capitalize">{a.action}</span>{a.resource_type && <span className="text-muted-foreground"> · {a.resource_type}</span>}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{timeAgo(a.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
