import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Crown, Search, Sparkles, X, Eye, ChevronRight, Loader2, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Thumbnail imports
import instagramStoryImg from "@/assets/templates/instagram-story.jpg";
import youtubeThumbImg from "@/assets/templates/youtube-thumb.jpg";
import pitchDeckImg from "@/assets/templates/pitch-deck.jpg";
import eventNeonImg from "@/assets/templates/event-neon.jpg";
import linkedinBannerImg from "@/assets/templates/linkedin-banner.jpg";
import resumeModernImg from "@/assets/templates/resume-modern.jpg";
import tiktokCoverImg from "@/assets/templates/tiktok-cover.jpg";
import facebookAdImg from "@/assets/templates/facebook-ad.jpg";
import weddingInviteImg from "@/assets/templates/wedding-invite.jpg";
import podcastCoverImg from "@/assets/templates/podcast-cover.jpg";
import instagramFashionImg from "@/assets/templates/instagram-fashion.jpg";
import productLaunchImg from "@/assets/templates/product-launch.jpg";
import infographicStatsImg from "@/assets/templates/infographic-stats.jpg";
import businessCardImg from "@/assets/templates/business-card.jpg";

// ── Types ──────────────────────────────────────────────────────────────

interface Template {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  isPro: boolean;
  color: string;
  thumbnail?: string | null;
  isNew?: boolean;
}

// ── Data ───────────────────────────────────────────────────────────────

const TEMPLATES: Template[] = [
  { id: "1", name: "Instagram Story – Minimal", category: "Social Media", tags: ["instagram", "story", "minimal", "clean"], description: "A sleek minimal story template for Instagram with subtle gradients.", isPro: false, color: "from-primary/40 to-cyan-500/20", thumbnail: instagramStoryImg },
  { id: "2", name: "YouTube Thumbnail – Bold", category: "Social Media", tags: ["youtube", "thumbnail", "bold", "vibrant"], description: "Eye-catching bold thumbnail designed for YouTube creators.", isPro: false, color: "from-cyan-500/40 to-emerald-500/20", thumbnail: youtubeThumbImg },
  { id: "3", name: "Business Pitch Deck", category: "Presentations", tags: ["pitch", "business", "startup", "deck", "professional"], description: "Professional pitch deck template for startups and investors.", isPro: true, color: "from-amber-500/40 to-primary/20", thumbnail: pitchDeckImg },
  { id: "4", name: "Event Poster – Neon", category: "Posters", tags: ["event", "poster", "neon", "party", "vibrant"], description: "Vibrant neon-themed poster for events and parties.", isPro: false, color: "from-red-500/40 to-amber-500/20", thumbnail: eventNeonImg },
  { id: "5", name: "LinkedIn Banner – Pro", category: "Banners", tags: ["linkedin", "banner", "professional", "corporate"], description: "Professional LinkedIn banner to elevate your profile.", isPro: true, color: "from-primary/30 to-emerald-500/30", thumbnail: linkedinBannerImg },
  { id: "6", name: "Resume – Modern Clean", category: "Resumes", tags: ["resume", "cv", "modern", "clean", "job"], description: "Modern and clean resume layout that stands out.", isPro: false, color: "from-muted/60 to-primary/20", thumbnail: resumeModernImg },
  { id: "7", name: "Infographic – Stats", category: "Infographics", tags: ["infographic", "data", "stats", "charts", "visual"], description: "Data-driven infographic template for presenting statistics.", isPro: true, color: "from-cyan-500/40 to-primary/30", thumbnail: infographicStatsImg },
  { id: "8", name: "Facebook Ad – Vibrant", category: "Social Media", tags: ["facebook", "ad", "vibrant", "marketing"], description: "High-conversion Facebook ad template with vibrant colors.", isPro: false, color: "from-primary/50 to-cyan-500/40", thumbnail: facebookAdImg },
  { id: "9", name: "Product Launch Poster", category: "Posters", tags: ["product", "poster", "ecommerce", "launch", "luxury"], description: "Stunning product launch poster for premium brands.", isPro: false, color: "from-emerald-500/30 to-amber-500/30", thumbnail: productLaunchImg },
  { id: "10", name: "Business Card – Elegant", category: "Business Cards", tags: ["business card", "elegant", "luxury", "minimal"], description: "Elegant business card with a luxury minimal feel.", isPro: true, color: "from-muted-foreground/20 to-primary/20", thumbnail: businessCardImg },
  { id: "11", name: "TikTok Cover", category: "Social Media", tags: ["tiktok", "cover", "trending", "creative"], description: "Trendy TikTok cover template to boost your profile.", isPro: false, color: "from-red-500/30 to-cyan-500/30", thumbnail: tiktokCoverImg },
  { id: "12", name: "Instagram Fashion Post", category: "Social Media", tags: ["instagram", "fashion", "aesthetic", "lifestyle", "pastel"], description: "Aesthetic pastel Instagram post for fashion & lifestyle brands.", isPro: false, color: "from-violet-500/30 to-emerald-400/20", thumbnail: instagramFashionImg },
  { id: "13", name: "Podcast Cover Art", category: "Social Media", tags: ["podcast", "cover", "audio", "creative", "neon"], description: "Bold podcast cover art with neon accents.", isPro: false, color: "from-emerald-500/40 to-primary/20", thumbnail: podcastCoverImg },
  { id: "14", name: "Wedding Invitation", category: "Invitations", tags: ["wedding", "invitation", "elegant", "floral", "romantic"], description: "Elegant floral wedding invitation with watercolor roses.", isPro: false, color: "from-rose-400/30 to-amber-300/20", thumbnail: weddingInviteImg },
  { id: "15", name: "Annual Report Deck", category: "Presentations", tags: ["report", "annual", "corporate", "data"], description: "Clean annual report template for corporate presentations.", isPro: true, color: "from-slate-500/30 to-primary/20" },
  { id: "16", name: "Startup Deck – Dark", category: "Presentations", tags: ["startup", "deck", "dark", "modern", "pitch"], description: "Dark-themed startup presentation deck with modern aesthetics.", isPro: true, color: "from-background to-primary/20" },
  { id: "17", name: "Conference Flyer", category: "Posters", tags: ["conference", "flyer", "event", "professional"], description: "Professional conference flyer template for corporate events.", isPro: false, color: "from-blue-500/30 to-cyan-500/20" },
  { id: "18", name: "Menu Design – Restaurant", category: "Business Cards", tags: ["menu", "restaurant", "food", "elegant"], description: "Elegant restaurant menu design template.", isPro: true, color: "from-amber-600/30 to-red-500/20" },
];

const CATEGORIES = [
  "All", "Social Media", "Presentations", "Posters",
  "Business Cards", "Infographics", "Resumes", "Banners", "Invitations",
];

// Per-category visual styles — each category gets a UNIQUE look
type CategoryStyle = {
  cardShape: string;        // border radius / shape
  aspectRatio: string;      // template card aspect
  accent: string;           // accent border color
  titleClass: string;       // typography
  layout: "default" | "wide" | "square" | "portrait" | "compact";
  badge?: string;
};

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "Social Media":   { cardShape: "rounded-2xl", aspectRatio: "aspect-[9/16]", accent: "border-primary/40", titleClass: "font-heading font-bold tracking-tight", layout: "portrait", badge: "📱" },
  "Presentations":  { cardShape: "rounded-md",  aspectRatio: "aspect-[16/9]", accent: "border-cyan-500/30", titleClass: "font-heading font-semibold", layout: "wide", badge: "🎤" },
  "Posters":        { cardShape: "rounded-3xl", aspectRatio: "aspect-[3/4]",  accent: "border-warning/40", titleClass: "font-heading font-extrabold uppercase tracking-wider text-xs", layout: "default", badge: "🎨" },
  "Business Cards": { cardShape: "rounded-lg",  aspectRatio: "aspect-[7/4]",  accent: "border-foreground/20", titleClass: "font-heading font-medium tracking-wide", layout: "wide", badge: "💼" },
  "Infographics":   { cardShape: "rounded-xl",  aspectRatio: "aspect-[4/5]",  accent: "border-emerald-500/30", titleClass: "font-mono font-medium text-xs", layout: "default", badge: "📊" },
  "Resumes":        { cardShape: "rounded-sm",  aspectRatio: "aspect-[3/4]",  accent: "border-foreground/30", titleClass: "font-heading font-light tracking-wide", layout: "default", badge: "📄" },
  "Banners":        { cardShape: "rounded-xl",  aspectRatio: "aspect-[21/9]", accent: "border-primary/30", titleClass: "font-heading font-bold", layout: "wide", badge: "🖼️" },
  "Invitations":    { cardShape: "rounded-[2rem]", aspectRatio: "aspect-[2/3]", accent: "border-rose-400/40", titleClass: "font-heading italic font-light", layout: "portrait", badge: "💌" },
};

const DEFAULT_STYLE: CategoryStyle = {
  cardShape: "rounded-xl", aspectRatio: "aspect-[3/4]", accent: "border-border/50",
  titleClass: "font-heading font-semibold", layout: "default",
};

// ── Search index ───────────────────────────────────────────────────────

function buildSearchIndex(templates: Template[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const t of templates) {
    const words = [
      ...t.name.toLowerCase().split(/[\s–—-]+/),
      ...t.category.toLowerCase().split(/\s+/),
      ...t.tags.map((tag) => tag.toLowerCase()),
      ...t.description.toLowerCase().split(/\s+/),
    ];
    for (const word of words) {
      for (let len = 2; len <= word.length; len++) {
        const prefix = word.slice(0, len);
        if (!index.has(prefix)) index.set(prefix, new Set());
        index.get(prefix)!.add(t.id);
      }
    }
  }
  return index;
}

const SEARCH_INDEX = buildSearchIndex(TEMPLATES);

const CATEGORY_COUNTS: Record<string, number> = TEMPLATES.reduce(
  (acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; },
  { All: TEMPLATES.length } as Record<string, number>
);

function highlightText(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-primary/30 text-foreground rounded-sm px-0.5">{part}</mark> : part
  );
}

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Lazy Image ─────────────────────────────────────────────────────────

const LazyTemplateImage = React.memo(function LazyTemplateImage({
  template, aspectRatio,
}: { template: Template; aspectRatio: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative ${aspectRatio} overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${template.color} flex items-center justify-center`}>
        <span className="text-5xl font-bold text-foreground/10 select-none">{template.name.charAt(0)}</span>
      </div>
      {visible && template.thumbnail && (
        <img
          src={template.thumbnail}
          alt={`Template: ${template.name}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
      {template.isPro && (
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-warning/20 backdrop-blur-sm px-2 py-0.5 text-xs font-semibold text-warning z-10">
          <Crown className="h-3 w-3" /> Pro
        </div>
      )}
      {template.isNew && (
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-cyan-500/20 backdrop-blur-sm px-2 py-0.5 text-xs font-semibold text-cyan-400 z-10">
          <Sparkles className="h-3 w-3" /> New
        </div>
      )}
    </div>
  );
});

// ── Template Card (per-category styled) ────────────────────────────────

const TemplateCard = React.memo(function TemplateCard({
  template, query, onPreview, onUse,
}: {
  template: Template;
  query: string;
  onPreview: (t: Template) => void;
  onUse: (t: Template) => void;
}) {
  const style = CATEGORY_STYLES[template.category] || DEFAULT_STYLE;

  return (
    <div
      className={`group cursor-pointer overflow-hidden ${style.cardShape} border-2 ${style.accent} bg-card transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 focus-within:ring-2 focus-within:ring-primary`}
      tabIndex={0}
      role="article"
      aria-label={`Template: ${template.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onUse(template); }
      }}
    >
      <div className="relative">
        <LazyTemplateImage template={template} aspectRatio={style.aspectRatio} />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-20">
          <Button
            size="sm" variant="outline"
            className="border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white"
            onClick={(e) => { e.stopPropagation(); onPreview(template); }}
          >
            <Eye className="mr-1 h-3 w-3" /> Preview Template
          </Button>
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onUse(template); }}>
            Use Template
          </Button>
        </div>
      </div>
      <div className={style.layout === "wide" ? "p-2.5" : "p-3"}>
        <p className={`${style.titleClass} truncate`}>
          {style.badge && <span className="mr-1">{style.badge}</span>}
          {highlightText(template.name, query)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{template.category}</p>
      </div>
    </div>
  );
});

// ── Main Page ──────────────────────────────────────────────────────────

export default function Templates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryParam = searchParams.get("category") || "All";
  const queryParam = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(queryParam);
  const debouncedQuery = useDebounce(searchInput, 120);

  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [useTemplateOpen, setUseTemplateOpen] = useState<Template | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [sessionTemplates, setSessionTemplates] = useState<Template[]>([]);

  // Use Template flow state
  const [usePrompt, setUsePrompt] = useState("");
  const [useGenerating, setUseGenerating] = useState(false);
  const [useUploading, setUseUploading] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (categoryParam !== "All") params.category = categoryParam;
    if (debouncedQuery) params.q = debouncedQuery;
    setSearchParams(params, { replace: true });
  }, [categoryParam, debouncedQuery, setSearchParams]);

  const setCategory = useCallback((cat: string) => {
    const params: Record<string, string> = {};
    if (cat !== "All") params.category = cat;
    if (debouncedQuery) params.q = debouncedQuery;
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, setSearchParams]);

  const allTemplates = useMemo(() => [...sessionTemplates, ...TEMPLATES], [sessionTemplates]);

  const filtered = useMemo(() => {
    let ids: Set<string> | null = null;
    if (debouncedQuery && debouncedQuery.length >= 2) {
      const words = debouncedQuery.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
      for (const word of words) {
        const matchingIds = SEARCH_INDEX.get(word);
        if (!matchingIds) { ids = new Set(); break; }
        ids = ids === null ? new Set(matchingIds) : new Set([...ids].filter((id) => matchingIds.has(id)));
      }
      const sessionMatches = sessionTemplates.filter((t) => {
        const hay = `${t.name} ${t.category} ${t.tags.join(" ")} ${t.description}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      });
      const sessionIds = new Set(sessionMatches.map((t) => t.id));
      ids = ids ? new Set([...ids, ...sessionIds]) : sessionIds;
    }
    return allTemplates.filter((t) => {
      if (ids && !ids.has(t.id)) return false;
      if (categoryParam !== "All" && t.category !== categoryParam) return false;
      return true;
    });
  }, [debouncedQuery, categoryParam, allTemplates, sessionTemplates]);

  // Group by category when "All"
  const grouped = useMemo(() => {
    if (categoryParam !== "All") return null;
    const map = new Map<string, Template[]>();
    for (const t of filtered) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
    }
    return Array.from(map.entries());
  }, [filtered, categoryParam]);

  const handleUseTemplate = useCallback((t: Template) => {
    if (t.isPro) { setUpgradeOpen(true); return; }
    setUseTemplateOpen(t);
    setUsePrompt(`A ${t.name.toLowerCase()} for `);
  }, []);

  const handlePreview = useCallback((t: Template) => setPreviewTemplate(t), []);

  // Create project from template
  const createProjectFromTemplate = async (t: Template, opts: { thumbnail?: string }) => {
    if (!user) {
      toast.error("Please sign in");
      return null;
    }
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: t.name,
        type: t.category.toLowerCase().replace(/\s+/g, "-"),
        template_id: t.id,
        thumbnail_url: opts.thumbnail || t.thumbnail || null,
      })
      .select()
      .single();
    if (error || !data) {
      toast.error("Failed to create project");
      return null;
    }
    return data.id as string;
  };

  // Upload file path
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !useTemplateOpen || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setUseUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/uploads/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("generated-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("generated-images").getPublicUrl(path);
      const projectId = await createProjectFromTemplate(useTemplateOpen, { thumbnail: pub.publicUrl });
      if (projectId) {
        toast.success("Project created from upload");
        setUseTemplateOpen(null);
        navigate(`/editor?project=${projectId}`);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUseUploading(false);
    }
  };

  // AI generate path
  const handleUseAiGenerate = async () => {
    if (!useTemplateOpen || !usePrompt.trim()) return;
    setUseGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: usePrompt.trim(), size: "1:1", count: 1 },
      });
      if (error) throw error;
      const img = data?.images?.[0];
      const projectId = await createProjectFromTemplate(useTemplateOpen, { thumbnail: img });
      if (projectId) {
        toast.success("AI-generated project created");
        setUseTemplateOpen(null);
        navigate(`/editor?project=${projectId}`);
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Generation failed";
      toast.error(m);
    } finally {
      setUseGenerating(false);
    }
  };

  // Top-level AI Template generation (existing)
  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        toast.error("Please sign in to generate templates with AI");
        setAiGenerating(false);
        return;
      }
      const { data, error } = await supabase.functions.invoke("generate-template", {
        body: { prompt: aiPrompt.trim() },
      });
      if (error) throw error;
      const newTemplate: Template = {
        ...data.template,
        isNew: true,
        color: "from-cyan-500/40 to-primary/30",
      };
      setSessionTemplates((prev) => [newTemplate, ...prev]);
      setAiPrompt("");
      toast.success("Template generated with AI!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      toast.error(message);
    } finally {
      setAiGenerating(false);
    }
  }, [aiPrompt]);

  const renderGrid = (items: Template[]) => (
    <div className="masonry-grid">
      {items.map((t) => (
        <div key={t.id} className="masonry-item">
          <TemplateCard
            template={t} query={debouncedQuery}
            onPreview={handlePreview} onUse={handleUseTemplate}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto max-w-[1600px] px-4 py-10 animate-fade-in">
      <h1 className="mb-2 text-4xl font-bold tracking-tighter md:text-5xl">Templates</h1>
      <p className="mb-8 text-muted-foreground">Start with a professionally designed template</p>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..." className="pl-10"
          value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search templates"
        />
        {searchInput && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSearchInput("")} aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* AI Generate bar */}
      <div className="mb-4">
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className="flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          aria-expanded={aiOpen}
        >
          <Sparkles className="h-4 w-4" /> Generate with AI
          <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${aiOpen ? "rotate-90" : ""}`} />
        </button>
        {aiOpen && (
          <div className="mt-3 flex gap-2 max-w-lg animate-fade-in">
            <Input
              placeholder='Describe a template (e.g., "dark minimal LinkedIn banner")...'
              value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !aiGenerating && handleAiGenerate()}
              className="flex-1" disabled={aiGenerating}
            />
            <Button onClick={handleAiGenerate} disabled={aiGenerating || !aiPrompt.trim()} size="sm" className="min-w-[100px]">
              {aiGenerating ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Creating...</> : <><Sparkles className="mr-1 h-3 w-3" />Generate</>}
            </Button>
          </div>
        )}
      </div>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat} variant={categoryParam === cat ? "default" : "outline"} size="sm"
            onClick={() => setCategory(cat)} className="rounded-full transition-all duration-200"
            aria-pressed={categoryParam === cat}
          >
            {cat}
            <span className="ml-1 text-xs opacity-60">({CATEGORY_COUNTS[cat] || 0})</span>
          </Button>
        ))}
      </div>

      {/* AI generating skeleton */}
      {aiGenerating && (
        <div className="mb-6 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          <div className="overflow-hidden rounded-xl border border-primary/20">
            <div className="aspect-[3/4] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-primary/10 to-muted animate-pulse" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                <span className="text-xs text-muted-foreground">Generating...</span>
              </div>
            </div>
            <div className="p-3">
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        grouped ? (
          <div className="space-y-12">
            {grouped.map(([cat, items]) => {
              const style = CATEGORY_STYLES[cat] || DEFAULT_STYLE;
              return (
                <section key={cat}>
                  <div className="mb-4 flex items-end justify-between border-b border-border/50 pb-2">
                    <h2 className={`text-xl ${style.titleClass} flex items-center gap-2`}>
                      {style.badge && <span>{style.badge}</span>} {cat}
                    </h2>
                    <span className="text-xs text-muted-foreground">{items.length} templates</span>
                  </div>
                  {renderGrid(items)}
                </section>
              );
            })}
          </div>
        ) : (
          renderGrid(filtered)
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No templates found</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Try different keywords or generate one with AI</p>
          <Button variant="outline" size="sm" onClick={() => { setAiOpen(true); setSearchInput(""); }}>
            <Sparkles className="mr-1 h-4 w-4" /> Generate with AI
          </Button>
        </div>
      )}

      {/* Preview Modal — full-screen */}
      <Dialog open={!!previewTemplate} onOpenChange={(o) => !o && setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-heading text-2xl">
                  {previewTemplate.name}
                  {previewTemplate.isPro && (
                    <span className="flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-xs font-semibold text-warning">
                      <Crown className="h-3 w-3" /> Pro
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription>{previewTemplate.description}</DialogDescription>
              </DialogHeader>
              <div className="relative w-full rounded-lg overflow-hidden bg-muted/20">
                {previewTemplate.thumbnail ? (
                  <img src={previewTemplate.thumbnail} alt={previewTemplate.name} className="w-full max-h-[60vh] object-contain mx-auto" />
                ) : (
                  <div className={`w-full aspect-[3/4] bg-gradient-to-br ${previewTemplate.color} flex items-center justify-center`}>
                    <span className="text-6xl font-bold text-foreground/10 select-none">{previewTemplate.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{previewTemplate.category}</span>
                {previewTemplate.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground">{tag}</span>
                ))}
              </div>
              <Button className="w-full" onClick={() => { const t = previewTemplate; setPreviewTemplate(null); handleUseTemplate(t); }}>
                Use Template
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Use Template Modal — Upload OR AI Generate */}
      <Dialog open={!!useTemplateOpen} onOpenChange={(o) => !o && setUseTemplateOpen(null)}>
        <DialogContent className="max-w-2xl">
          {useTemplateOpen && (
            <>
              <DialogHeader>
                <DialogTitle>Use "{useTemplateOpen.name}"</DialogTitle>
                <DialogDescription>Choose how you'd like to bring content into your project.</DialogDescription>
              </DialogHeader>

              <input
                ref={fileInputRef} type="file" accept="image/*"
                onChange={handleUploadFile} className="hidden"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Upload */}
                <div className="rounded-xl border-2 border-dashed border-border/50 p-6 text-center hover:border-primary/40 transition-colors">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">Upload File</h3>
                  <p className="text-xs text-muted-foreground mb-4">Bring your own image (PNG, JPG, WEBP)</p>
                  <Button onClick={handleUploadClick} disabled={useUploading || useGenerating} className="w-full">
                    {useUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="mr-2 h-4 w-4" /> Choose File</>}
                  </Button>
                </div>

                {/* AI Generate */}
                <div className="rounded-xl border-2 border-cyan-500/30 bg-cyan-500/5 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10">
                    <Wand2 className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">AI Generate</h3>
                  <p className="text-xs text-muted-foreground mb-4">Describe what you want, AI creates it</p>
                  <Input
                    placeholder="A vibrant fitness brand..."
                    value={usePrompt} onChange={(e) => setUsePrompt(e.target.value)}
                    className="mb-2 text-sm"
                    disabled={useGenerating}
                  />
                  <Button onClick={handleUseAiGenerate} disabled={useGenerating || useUploading || !usePrompt.trim()} className="w-full">
                    {useGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate</>}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-warning" /> Upgrade to Pro
            </DialogTitle>
            <DialogDescription>
              This template is available on the Pro plan. Unlock all Pro templates, unlimited AI generations, and more.
            </DialogDescription>
          </DialogHeader>
          <Button className="w-full" onClick={() => navigate("/pricing")}>View Plans</Button>
          <Button variant="ghost" className="w-full" onClick={() => setUpgradeOpen(false)}>Maybe later</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
