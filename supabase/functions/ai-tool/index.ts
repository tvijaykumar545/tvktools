import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const toolPrompts: Record<string, string> = {
  "ai-prompt-generator": "You are an expert prompt engineer. Given the user's topic or goal, generate 3 highly optimized, detailed prompts they can use with AI models like ChatGPT, Claude, or Midjourney. Format each prompt clearly with a label.",
  "ai-blog-title": "You are a content marketing expert. Given the user's topic or keywords, generate 10 catchy, SEO-friendly blog title ideas. Mix different styles: listicles, how-tos, questions, and power-word titles.",
  "ai-image-prompt": "You are an expert at writing prompts for AI image generators (Midjourney, DALL-E, Stable Diffusion). Given the user's concept, generate 3 detailed image generation prompts with style, lighting, composition, and mood descriptors.",
  "ai-tweet-generator": "You are a social media expert. Given the user's topic, generate 5 engaging tweet ideas. Include relevant emojis and hashtag suggestions. Keep each under 280 characters.",
  "ai-hashtag-generator": "You are a social media strategist. Given the user's topic or niche, generate 30 relevant hashtags organized by popularity tier: 10 high-volume, 10 medium-volume, and 10 niche/long-tail hashtags.",
  "ai-bio-generator": "You are a personal branding expert. Given the user's role, industry, and key achievements, generate 3 professional bios in different lengths: short (1-2 sentences), medium (3-4 sentences), and long (full paragraph).",
  "ai-product-desc": "You are an expert copywriter. Given the product details, generate 3 compelling product descriptions: one short (50 words), one medium (100 words), and one long (200 words). Use persuasive language and highlight benefits.",
  "ai-email-generator": "You are a professional communication expert. Given the user's context and purpose, generate a well-structured professional email with appropriate greeting, body, and sign-off. Provide 2 variants: formal and semi-formal.",
  "ai-code-generator": "You are an expert programmer. Given the user's description of what they want to build, generate clean, well-commented code. Include brief explanations of the approach. Default to TypeScript unless another language is specified.",
  "ai-chat": "You are a helpful, knowledgeable AI assistant. Provide clear, concise, and accurate responses. Use markdown formatting when helpful.",
  "keyword-suggestions": "You are an SEO expert. Given the user's topic or seed keyword, generate 20 keyword suggestions organized by search intent (informational, navigational, transactional, commercial). Include estimated search volume tier (high/medium/low) and competition level.",
  "seo-title-generator": "You are an SEO specialist and copywriter. Given the user's topic and target keyword, generate 10 SEO-optimized page titles. Each should be under 60 characters, include the target keyword naturally, and be compelling enough to earn clicks.",
  "competitor-keywords": "You are an SEO analyst. Given a domain or niche, generate a realistic analysis of 15 keywords a competitor might rank for, with estimated position, search volume tier, and content type needed to compete.",
  "seo-audit": "You are an SEO auditor. Given a URL or page description, provide a comprehensive SEO audit covering: title tag, meta description, headings, content quality, keyword usage, internal linking, image optimization, mobile-friendliness, and page speed recommendations.",
  "backlink-checker": "You are an SEO link building expert. Given a domain, provide a simulated backlink analysis including: estimated domain authority, total backlinks estimate, top referring domains, anchor text distribution, and link building recommendations.",
  "domain-authority": "You are an SEO metrics expert. Given a domain, provide a comprehensive domain analysis including: estimated domain authority score, page authority, trust flow, citation flow, spam score, and recommendations for improvement.",
  "competitor-ranking": "You are a competitive SEO analyst. Given a domain or niche, provide analysis of the top 10 keywords competitors are likely ranking for, with estimated positions, traffic potential, and content gap opportunities.",
  "smtp-tester": "You are a server administration expert. Given SMTP server details, explain how to test the connection and common issues to look for. Provide a diagnostic checklist and troubleshooting steps.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { toolId, input } = await req.json();

    // Validate toolId
    if (!toolId || typeof toolId !== 'string' || !toolPrompts[toolId]) {
      return new Response(JSON.stringify({ error: "Invalid or unsupported tool." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate input length
    const MAX_INPUT = 4000;
    if (typeof input !== 'string' || input.trim().length === 0 || input.length > MAX_INPUT) {
      return new Response(JSON.stringify({ error: `Input must be between 1 and ${MAX_INPUT} characters.` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = toolPrompts[toolId];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-tool error:", e);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again later." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
