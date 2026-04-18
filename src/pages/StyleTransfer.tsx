import { useState } from "react";
import { Palette } from "lucide-react";
import { ToolUploadShell } from "@/components/ToolUploadShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";
import { Button } from "@/components/ui/button";

const STYLES = [
  "Van Gogh",
  "Watercolor",
  "Oil Painting",
  "Anime",
  "Pixel Art",
  "Cyberpunk",
  "Comic Book",
  "Pencil Sketch",
];

export default function StyleTransfer() {
  const { user } = useAuth();
  const [selectedStyle, setSelectedStyle] = useState("Van Gogh");

  return (
    <div>
      <div className="container mx-auto max-w-4xl px-4 pt-8">
        <div className="mb-4 rounded-lg border bg-card p-4">
          <p className="mb-2 text-sm font-medium">Choose a style</p>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={selectedStyle === s ? "default" : "outline"}
                onClick={() => setSelectedStyle(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <ToolUploadShell
        icon={Palette}
        title="Style Transfer"
        description="Apply famous artistic styles to your photos"
        ctaLabel={`Apply ${selectedStyle}`}
        estimatedSeconds={14}
        onProcess={async (_f, _i, dataUrl) => {
          const { data, error } = await supabase.functions.invoke("enhance-image", {
            body: {
              imageUrl: dataUrl,
              instruction: `Restyle this image in the style of ${selectedStyle}. Preserve the original composition and subject placement, only change the artistic rendering.`,
            },
          });
          if (error) throw error;
          const out = data?.image as string | undefined;
          if (out && user) {
            await supabase.from("generations").insert({
              user_id: user.id,
              prompt: `Style: ${selectedStyle}`,
              tool: "style-transfer",
              output_type: "image",
              style: selectedStyle,
              image_urls: [out],
            });
            await logActivity(user.id, "applied style", "image", undefined, { style: selectedStyle });
          }
          return out ?? null;
        }}
      />
    </div>
  );
}
