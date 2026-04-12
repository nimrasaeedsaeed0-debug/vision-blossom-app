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
    const { prompt, negativePrompt, width, height, guidanceScale, count } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const HF_API_KEY = Deno.env.get("HUGGING_FACE_API_KEY");
    if (!HF_API_KEY) {
      throw new Error("HUGGING_FACE_API_KEY is not configured");
    }

    const imageCount = Math.min(count || 1, 4);
    const images: string[] = [];

    const imgWidth = width || 512;
    const imgHeight = height || 512;
    const scale = guidanceScale || 7.5;

    for (let i = 0; i < imageCount; i++) {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              width: imgWidth,
              height: imgHeight,
              guidance_scale: scale,
              ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limited. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 503) {
          return new Response(
            JSON.stringify({ error: "Model is loading. Please try again in a moment." }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errText = await response.text();
        console.error("HF API error:", response.status, errText);
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const blob = await response.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(blob).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      images.push(`data:image/png;base64,${base64}`);
    }

    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image-hf error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
