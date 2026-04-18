import { Expand } from "lucide-react";
import { ToolUploadShell } from "@/components/ToolUploadShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";

export default function ImageExpander() {
  const { user } = useAuth();
  return (
    <ToolUploadShell
      icon={Expand}
      title="Image Expander"
      description="Extend your images naturally with AI outpainting"
      ctaLabel="Expand Image"
      instructionLabel="Direction & content (optional)"
      instructionPlaceholder="Extend the scene to the left and right with matching style…"
      estimatedSeconds={14}
      onProcess={async (_f, instruction, dataUrl) => {
        const { data, error } = await supabase.functions.invoke("enhance-image", {
          body: {
            imageUrl: dataUrl,
            instruction:
              instruction ||
              "Extend the canvas on all sides, seamlessly continuing the scene with matching lighting, color, and composition.",
          },
        });
        if (error) throw error;
        const out = data?.image as string | undefined;
        if (out && user) {
          await supabase.from("generations").insert({
            user_id: user.id,
            prompt: instruction || "Expanded image",
            tool: "expander",
            output_type: "image",
            image_urls: [out],
          });
          await logActivity(user.id, "expanded image", "image");
        }
        return out ?? null;
      }}
    />
  );
}
