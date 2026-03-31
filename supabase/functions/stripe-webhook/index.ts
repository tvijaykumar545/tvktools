import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;

    if (webhookSecret && sig) {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Fallback: parse without verification (for initial setup)
      event = JSON.parse(body);
      console.warn("Webhook signature verification skipped - no STRIPE_WEBHOOK_SECRET configured");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        console.log("Session not paid yet, skipping:", session.id);
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = session.metadata?.user_id;
      const points = parseInt(session.metadata?.points || "0", 10);
      const packageId = session.metadata?.package_id || "";

      if (!userId || points <= 0) {
        console.error("Missing metadata:", { userId, points, packageId });
        return new Response(JSON.stringify({ received: true, error: "Missing metadata" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Idempotency: check if already processed using session ID
      const { data: existing } = await supabaseAdmin
        .from("points_purchases")
        .select("id")
        .eq("screenshot_url", session.id)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log("Session already processed:", session.id);
        return new Response(JSON.stringify({ received: true, already_processed: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Credit points
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("points_balance")
        .eq("user_id", userId)
        .single();

      if (!profile) {
        console.error("User profile not found:", userId);
        return new Response(JSON.stringify({ received: true, error: "User not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const newBalance = (profile.points_balance || 0) + points;
      const priceInr = (session.amount_total || 0) / 100;

      // Update balance
      await supabaseAdmin
        .from("profiles")
        .update({ points_balance: newBalance })
        .eq("user_id", userId);

      // Record purchase
      await supabaseAdmin
        .from("points_purchases")
        .insert({
          user_id: userId,
          package_name: packageId,
          points_amount: points,
          price_inr: priceInr,
          status: "approved",
          approved_at: new Date().toISOString(),
          screenshot_url: session.id,
          user_email: session.customer_email || null,
        });

      // Record transaction
      await supabaseAdmin
        .from("points_transactions")
        .insert({
          user_id: userId,
          points_used: points,
          action_type: "add",
          description: `Stripe payment: ${packageId} (₹${priceInr})`,
          balance_after: newBalance,
        });

      console.log(`Webhook: Credited ${points} points to user ${userId}, new balance: ${newBalance}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
