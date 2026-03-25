-- Add columns to points_purchases for approval flow
ALTER TABLE public.points_purchases 
  ADD COLUMN IF NOT EXISTS screenshot_url text,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS user_email text;

-- Update default status to 'pending'
ALTER TABLE public.points_purchases ALTER COLUMN status SET DEFAULT 'pending';

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for payment-screenshots bucket
CREATE POLICY "Authenticated users can upload screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Anyone can view payment screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Admins can delete payment screenshots"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'payment-screenshots' AND public.has_role(auth.uid(), 'admin'));

-- Add admin update policy on points_purchases
CREATE POLICY "Admins can update purchases"
ON public.points_purchases FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to submit purchase request (pending, no immediate credit)
CREATE OR REPLACE FUNCTION public.submit_purchase_request(
  p_user_id uuid,
  p_package_name text,
  p_points_amount integer,
  p_price_inr numeric,
  p_screenshot_url text DEFAULT NULL,
  p_user_email text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_purchase_id uuid;
BEGIN
  INSERT INTO public.points_purchases (user_id, package_name, points_amount, price_inr, status, screenshot_url, user_email)
  VALUES (p_user_id, p_package_name, p_points_amount, p_price_inr, 'pending', p_screenshot_url, p_user_email)
  RETURNING id INTO v_purchase_id;

  RETURN json_build_object('success', true, 'purchase_id', v_purchase_id);
END;
$$;

-- Function for admin to approve purchase
CREATE OR REPLACE FUNCTION public.admin_approve_purchase(
  p_admin_id uuid,
  p_purchase_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_purchase record;
  v_new_balance integer;
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  SELECT * INTO v_purchase FROM public.points_purchases WHERE id = p_purchase_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Purchase not found');
  END IF;

  IF v_purchase.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Purchase already processed');
  END IF;

  UPDATE public.points_purchases 
  SET status = 'approved', approved_by = p_admin_id, approved_at = now()
  WHERE id = p_purchase_id;

  UPDATE public.profiles 
  SET points_balance = points_balance + v_purchase.points_amount
  WHERE user_id = v_purchase.user_id
  RETURNING points_balance INTO v_new_balance;

  INSERT INTO public.points_transactions (user_id, points_used, action_type, description, admin_id, balance_after)
  VALUES (v_purchase.user_id, v_purchase.points_amount, 'add', 
    'Purchase approved: ' || v_purchase.package_name || ' (₹' || v_purchase.price_inr || ')', 
    p_admin_id, v_new_balance);

  RETURN json_build_object('success', true, 'balance', v_new_balance);
END;
$$;

-- Function for admin to reject purchase
CREATE OR REPLACE FUNCTION public.admin_reject_purchase(
  p_admin_id uuid,
  p_purchase_id uuid,
  p_reason text DEFAULT 'Payment could not be verified'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_purchase record;
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  SELECT * INTO v_purchase FROM public.points_purchases WHERE id = p_purchase_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Purchase not found');
  END IF;

  IF v_purchase.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Purchase already processed');
  END IF;

  UPDATE public.points_purchases 
  SET status = 'rejected', rejection_reason = p_reason, approved_by = p_admin_id, approved_at = now()
  WHERE id = p_purchase_id;

  RETURN json_build_object('success', true);
END;
$$;

-- Enable realtime for purchases so admin sees new ones
ALTER PUBLICATION supabase_realtime ADD TABLE public.points_purchases;