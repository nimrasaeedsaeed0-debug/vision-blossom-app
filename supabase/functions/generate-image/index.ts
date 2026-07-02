import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, size, count, model: reqModel, realistic } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const imageCount = Math.min(count || 2, 4);
    const images: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      const sizeInstruction = size === "16:9"
        ? "wide landscape format 16:9 aspect ratio"
        : size === "9:16"
        ? "tall portrait format 9:16 aspect ratio"
        : "square 1:1 aspect ratio";

      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: reqModel || (realistic ? "google/gemini-3-pro-image" : "google/gemini-2.5-flash-image"),
            messages: [
              {
                role: "user",
                content: realistic
                  ? `Generate an ultra-photorealistic image: ${prompt}. Use ${sizeInstruction}. Shot on a full-frame DSLR, sharp focus, natural lighting, lifelike skin/textures, cinematic depth of field, 8k detail. Avoid illustration, avoid CGI look.`
                  : `Generate a high quality image: ${prompt}. Use ${sizeInstruction}. Make it visually stunning and detailed.`,
              },
            ],
            modalities: ["image", "text"],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limited. Please try again later." }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Credits exhausted. Please add funds." }),
            {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        const errText = await response.text();
        console.error("AI gateway error:", response.status, errText);
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const imageUrl =
        data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (imageUrl) {
        images.push(imageUrl);
      }
    }

    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
