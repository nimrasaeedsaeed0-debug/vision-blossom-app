import { Eraser } from "lucide-react";
import { ToolUploadShell } from "@/components/ToolUploadShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";

export default function MagicErase() {
  const { user } = useAuth();
  return (
    <ToolUploadShell
      icon={Eraser}
      title="Magic Erase"
      description="Remove unwanted objects, people, or text from your photos"
      ctaLabel="Erase Object"
      instructionLabel="What to remove"
      instructionPlaceholder="Remove the person on the left, the trash can, and the text overlay…"
      estimatedSeconds={12}
      onProcess={async (_f, instruction, dataUrl) => {
        if (!instruction.trim()) {
          throw new Error("Describe what to remove");
        }
        const { data, error } = await supabase.functions.invoke("enhance-image", {
          body: {
            imageUrl: dataUrl,
            instruction: `Cleanly remove: ${instruction}. Fill the gap so it looks natural and untouched.`,
          },
        });
        if (error) throw error;
        const out = data?.image as string | undefined;
        if (out && user) {
          await supabase.from("generations").insert({
            user_id: user.id,
            prompt: `Erase: ${instruction}`,
            tool: "magic-erase",
            output_type: "image",
            image_urls: [out],
          });
          await logActivity(user.id, "erased objects", "image");
        }
        return out ?? null;
      }}
    />
  );
}
