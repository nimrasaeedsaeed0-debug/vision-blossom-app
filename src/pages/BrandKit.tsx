import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Palette, Type, Image as ImageIcon, Plus, X, Upload, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ACCEPTED = "image/png,image/jpeg,image/jpg,image/svg+xml,image/webp";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export default function BrandKit() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [brandName, setBrandName] = useState("My Brand");
  const [colors, setColors] = useState<string[]>(["#7C3AED", "#06B6D4", "#10B981", "#F59E0B"]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [newColor, setNewColor] = useState("#000000");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("brand_kits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setBrandName(data.brand_name);
        setColors((data.colors as string[]) || []);
        setLogoUrl(data.logo_url);
      }
      setLoading(false);
    })();
  }, [user]);

  const persist = async (patch: Partial<{ brand_name: string; colors: string[]; logo_url: string | null }>) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("brand_kits")
      .upsert(
        {
          user_id: user.id,
          brand_name: patch.brand_name ?? brandName,
          colors: patch.colors ?? colors,
          logo_url: patch.logo_url ?? logoUrl,
        },
        { onConflict: "user_id" }
      );
    setSaving(false);
    if (error) toast.error("Failed to save");
  };

  const addColor = async () => {
    if (colors.length >= 10) { toast.error("Max 10 colors"); return; }
    const next = [...colors, newColor];
    setColors(next);
    await persist({ colors: next });
    toast.success("Color added");
  };

  const removeColor = async (index: number) => {
    const next = colors.filter((_, i) => i !== index);
    setColors(next);
    await persist({ colors: next });
  };

  const handleLogoSelect = () => fileInputRef.current?.click();

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting same file
    if (!file || !user) return;

    if (!ACCEPTED.split(",").includes(file.type)) {
      toast.error("Use PNG, JPG, SVG, or WEBP");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Logo must be under 5MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/logo-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("brand-assets")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: pub } = supabase.storage.from("brand-assets").getPublicUrl(path);
    const url = pub.publicUrl;
    setLogoUrl(url);
    await persist({ logo_url: url });
    setUploading(false);
    toast.success("Logo uploaded");
  };

  const removeLogo = async () => {
    setLogoUrl(null);
    await persist({ logo_url: null });
    toast.success("Logo removed");
  };

  const handleNameBlur = () => persist({ brand_name: brandName });

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Brand Kit</h1>
          <p className="text-muted-foreground">Manage your brand identity in one place</p>
        </div>
        {saving && <span className="text-xs text-muted-foreground">Saving…</span>}
      </div>

      <div className="space-y-6">
        {/* Brand Name */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Brand Name</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              onBlur={handleNameBlur}
              className="max-w-sm"
            />
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" /> Brand Colors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {colors.map((color, i) => (
                <div key={i} className="group relative">
                  <div className="h-14 w-14 rounded-xl border-2 border-border/50 shadow-sm transition-transform duration-200 hover:scale-110 cursor-pointer" style={{ backgroundColor: color }} />
                  <button onClick={() => removeColor(i)} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <X className="h-3 w-3" />
                  </button>
                  <p className="mt-1 text-center text-xs text-muted-foreground">{color}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded border-0" />
              <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-28" />
              <Button size="sm" onClick={addColor}><Plus className="mr-1 h-4 w-4" />Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Fonts */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" /> Brand Fonts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { slot: "Heading Font", font: "Plus Jakarta Sans", preview: "The quick brown fox" },
              { slot: "Body Font", font: "Inter", preview: "The quick brown fox jumps over the lazy dog" },
              { slot: "Accent Font", font: "Monospace", preview: "CODE_STYLE" },
            ].map(({ slot, font, preview }) => (
              <div key={slot} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">{slot}</p>
                  <p className="text-xs text-muted-foreground">{font}</p>
                  <p className="mt-1 text-lg" style={{ fontFamily: font }}>{preview}</p>
                </div>
                <Button size="sm" variant="outline">Change</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" /> Brand Logo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED}
              onChange={handleLogoFile}
              className="hidden"
            />
            {logoUrl ? (
              <div className="flex items-center gap-4 rounded-xl border p-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border bg-muted/30 p-2">
                  <img src={logoUrl} alt="Brand logo" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Logo uploaded</p>
                  <p className="text-xs text-muted-foreground truncate">{logoUrl.split("/").pop()}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleLogoSelect} disabled={uploading}>
                      {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Upload className="mr-1 h-3 w-3" />}
                      Replace
                    </Button>
                    <Button size="sm" variant="ghost" onClick={removeLogo} className="text-destructive hover:text-destructive">
                      <Trash2 className="mr-1 h-3 w-3" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center justify-center rounded-xl border-2 border-dashed border-border/50 p-12 text-center cursor-pointer hover:border-primary/40 transition-colors"
                onClick={handleLogoSelect}
              >
                <div>
                  <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Click to upload your logo</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG, SVG or WEBP — up to 5MB</p>
                  <Button size="sm" variant="outline" className="mt-3" disabled={uploading}>
                    {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Upload className="mr-1 h-3 w-3" />}
                    Upload Logo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
