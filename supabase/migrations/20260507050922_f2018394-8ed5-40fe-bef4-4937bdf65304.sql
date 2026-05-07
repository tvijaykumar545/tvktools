
-- 1. Razorpay order intent table to prevent parameter tampering
CREATE TABLE IF NOT EXISTS public.razorpay_orders (
  order_id text PRIMARY KEY,
  user_id uuid NOT NULL,
  package_name text NOT NULL,
  points_amount integer NOT NULL,
  price_inr numeric NOT NULL,
  status text NOT NULL DEFAULT 'created',
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz
);

ALTER TABLE public.razorpay_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
ON public.razorpay_orders
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Inserts/updates only via service role from edge functions (no anon/auth policies = denied)

-- 2. Revoke EXECUTE from anon/public on functions that should require authentication.
-- Trigger functions (only invoked by triggers, not RPC):
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.credit_favorite_points() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.credit_review_points() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_duplicate_tool_usage() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_tool_usage_insert() FROM anon, authenticated, PUBLIC;

-- User-callable RPCs: revoke from anon (require auth)
REVOKE EXECUTE ON FUNCTION public.claim_daily_reward(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_referral_bonus(text, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.deduct_tool_points(uuid, text, text, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_purchase_request(uuid, text, integer, numeric, text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_review_id(text) FROM anon, PUBLIC;

-- get_most_used_tools is intentionally public (used on homepage by guests)
