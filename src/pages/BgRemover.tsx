import { Scissors } from "lucide-react";
import { ToolUploadShell } from "@/components/ToolUploadShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";

export default function BgRemover() {
  const { user } = useAuth();

  return (
    <ToolUploadShell
      icon={Scissors}
      title="Background Remover"
      description="Strip backgrounds from any image instantly with AI"
      ctaLabel="Remove Background"
      estimatedSeconds={8}
      onProcess={async (_file, _instruction, dataUrl) => {
        const { data, error } = await supabase.functions.invoke("enhance-image", {
          body: {
            imageUrl: dataUrl,
            instruction:
              "Remove the background completely. Output the subject on a transparent background.",
          },
        });
        if (error) throw error;
        const out = data?.image as string | undefined;
        if (out && user) {
          await supabase.from("generations").insert({
            user_id: user.id,
            prompt: "Background removed",
            tool: "bg-remover",
            output_type: "image",
            image_urls: [out],
          });
          await logActivity(user.id, "removed background", "image");
        }
        return out ?? null;
      }}
    />
  );
}
