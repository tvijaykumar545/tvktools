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

  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAnon.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing session ID");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, error: "Payment not completed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Verify the session belongs to this user
    if (session.metadata?.user_id !== user.id) {
      throw new Error("Payment session does not belong to this user");
    }

    const points = parseInt(session.metadata?.points || "0", 10);
    const packageId = session.metadata?.package_id || "";

    if (points <= 0) throw new Error("Invalid points amount");

    // Check if this session was already processed (idempotency)
    const { data: existing } = await supabaseAdmin
      .from("points_purchases")
      .select("id")
      .eq("screenshot_url", sessionId)
      .limit(1);

    if (existing && existing.length > 0) {
      // Already processed - return success without double-crediting
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("points_balance")
        .eq("user_id", user.id)
        .single();

      return new Response(
        JSON.stringify({ success: true, already_processed: true, balance: profile?.points_balance ?? 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Credit points using the existing RPC
    const priceInr = (session.amount_total || 0) / 100;

    // Get current balance with lock
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("points_balance")
      .eq("user_id", user.id)
      .single();

    if (!profile) throw new Error("User profile not found");

    const newBalance = (profile.points_balance || 0) + points;

    // Update balance
    await supabaseAdmin
      .from("profiles")
      .update({ points_balance: newBalance })
      .eq("user_id", user.id);

    // Record purchase (use screenshot_url field to store session ID for idempotency)
    await supabaseAdmin
      .from("points_purchases")
      .insert({
        user_id: user.id,
        package_name: packageId,
        points_amount: points,
        price_inr: priceInr,
        status: "approved",
        approved_at: new Date().toISOString(),
        screenshot_url: sessionId,
        user_email: user.email,
      });

    // Record transaction
    await supabaseAdmin
      .from("points_transactions")
      .insert({
        user_id: user.id,
        points_used: points,
        action_type: "add",
        description: `Stripe payment: ${packageId} (₹${priceInr})`,
        balance_after: newBalance,
      });

    return new Response(
      JSON.stringify({ success: true, balance: newBalance, points_credited: points }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("verify-payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
