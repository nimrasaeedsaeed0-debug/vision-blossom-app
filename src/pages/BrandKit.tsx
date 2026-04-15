import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Type, Image, Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function BrandKit() {
  const [brandName, setBrandName] = useState("My Brand");
  const [colors, setColors] = useState(["#7C3AED", "#06B6D4", "#10B981", "#F59E0B"]);
  const [newColor, setNewColor] = useState("#000000");

  const addColor = () => {
    if (colors.length >= 10) { toast.error("Max 10 colors"); return; }
    setColors([...colors, newColor]);
    toast.success("Color added");
  };

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <h1 className="mb-2 font-heading text-3xl font-bold">Brand Kit</h1>
      <p className="mb-8 text-muted-foreground">Manage your brand identity in one place</p>

      <div className="space-y-6">
        {/* Brand Name */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Brand Name</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} className="max-w-sm" />
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
              <Type className="h-4 w-4 text-cyan" /> Brand Fonts
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

        {/* Logos */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <Image className="h-4 w-4 text-success" /> Brand Logos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border/50 p-12 text-center">
              <div>
                <Image className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Drag & drop your logo here</p>
                <Button size="sm" variant="outline" className="mt-3">Upload Logo</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
