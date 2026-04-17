import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sun, Moon, Settings as SettingsIcon, Image as ImageIcon, Sparkles, Globe, BarChart3, HardDrive, Wand2 } from "lucide-react";
import { toast } from "sonner";

const SIZES = ["1:1", "16:9", "9:16", "4:5"];
const STYLES = ["Realistic", "Anime", "Cinematic", "Digital Art", "Watercolor", "3D Render"];
const LANGUAGES = [
  { v: "en", label: "English" },
  { v: "es", label: "Español" },
  { v: "fr", label: "Français" },
  { v: "de", label: "Deutsch" },
  { v: "pt", label: "Português" },
  { v: "ja", label: "日本語" },
  { v: "zh", label: "中文" },
];

interface Stats {
  storageUsed: number;
  generationsThisMonth: number;
  topTool: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [defaultSize, setDefaultSize] = useState("1:1");
  const [defaultStyle, setDefaultStyle] = useState("Realistic");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<Stats>({ storageUsed: 0, generationsThisMonth: 0, topTool: "—" });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setDefaultSize(data.default_size);
        setDefaultStyle(data.default_style);
        setLanguage(data.language);
      }

      // Stats
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: gens } = await supabase
        .from("generations")
        .select("tool, image_urls, created_at")
        .eq("user_id", user.id);

      if (gens) {
        const monthGens = gens.filter((g) => new Date(g.created_at) >= monthStart);
        const toolCounts: Record<string, number> = {};
        let bytes = 0;
        for (const g of gens) {
          const tool = (g as any).tool || "text-to-image";
          toolCounts[tool] = (toolCounts[tool] || 0) + 1;
          // rough estimate: 250KB per image
          bytes += (g.image_urls?.length || 0) * 250 * 1024;
        }
        const top = Object.entries(toolCounts).sort((a, b) => b[1] - a[1])[0];
        setStats({
          storageUsed: bytes,
          generationsThisMonth: monthGens.length,
          topTool: top ? top[0] : "—",
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          theme: theme || "dark",
          default_size: defaultSize,
          default_style: defaultStyle,
          language,
        },
        { onConflict: "user_id" }
      );
    setSaving(false);
    if (error) toast.error("Failed to save settings");
    else toast.success("Settings saved");
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your FlashAI experience</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Appearance</CardTitle>
            <CardDescription>Switch between light and dark mode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-amber-500" />}
                <div>
                  <p className="text-sm font-medium">{theme === "dark" ? "Dark Mode" : "Light Mode"}</p>
                  <p className="text-xs text-muted-foreground">
                    {theme === "dark" ? "Easy on the eyes in low light" : "Bright and crisp"}
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(c) => setTheme(c ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
            </div>
          </CardContent>
        </Card>

        {/* Generation Defaults */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Generation Defaults</CardTitle>
            <CardDescription>Pre-fill these on every new design</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <ImageIcon className="h-4 w-4 text-primary" /> Default Size
                </Label>
                <Select value={defaultSize} onValueChange={setDefaultSize}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" /> Default Style
                </Label>
                <Select value={defaultStyle} onValueChange={setDefaultStyle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-primary" /> Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => <SelectItem key={l.v} value={l.v}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Usage Stats
            </CardTitle>
            <CardDescription>Your activity at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <HardDrive className="h-3 w-3" /> Storage Used
                  </div>
                  <p className="font-heading text-2xl font-bold">{formatBytes(stats.storageUsed)}</p>
                  <p className="text-xs text-muted-foreground mt-1">of 5 GB</p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" /> Generations
                  </div>
                  <p className="font-heading text-2xl font-bold">{stats.generationsThisMonth}</p>
                  <p className="text-xs text-muted-foreground mt-1">this month</p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Wand2 className="h-3 w-3" /> Top Tool
                  </div>
                  <p className="font-heading text-lg font-bold capitalize truncate">{stats.topTool.replace(/-/g, " ")}</p>
                  <p className="text-xs text-muted-foreground mt-1">most used</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
