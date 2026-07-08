import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate a template thumbnail image using AI
    const imageResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: `Generate a professional design template thumbnail for: ${prompt.trim()}. Make it colorful, modern, and visually striking. It should look like a ready-to-use graphic design template.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      }
    );

    if (!imageResponse.ok) {
      throw new Error(`AI API error: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const generatedImage =
      imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;

    // Upload image to storage if generated
    let publicUrl: string | null = null;
    if (generatedImage) {
      const base64Data = generatedImage.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const binaryData = Uint8Array.from(atob(base64Data), (c) =>
        c.charCodeAt(0)
      );
      const fileName = `templates/ai-${Date.now()}.png`;

      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, serviceRoleKey);

      const { error: uploadError } = await adminClient.storage
        .from("generated-images")
        .upload(fileName, binaryData, {
          contentType: "image/png",
          upsert: false,
        });

      if (!uploadError) {
        const { data: urlData } = await adminClient.storage
          .from("generated-images")
          .createSignedUrl(fileName, 60 * 60 * 24 * 365);
        publicUrl = urlData?.signedUrl ?? null;
      }
    }

    const template = {
      id: `ai-${Date.now()}`,
      name: prompt.trim().slice(0, 50),
      category: "AI Generated",
      tags: ["ai-generated", ...prompt.toLowerCase().split(/\s+/).slice(0, 4)],
      description: `AI-generated template: ${prompt}`,
      isPro: false,
      thumbnail: publicUrl,
    };

    return new Response(JSON.stringify({ template }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
