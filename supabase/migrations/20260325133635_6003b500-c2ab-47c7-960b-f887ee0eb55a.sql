
-- Points purchases table to log UPI payment confirmations
CREATE TABLE public.points_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_name text NOT NULL,
  points_amount integer NOT NULL,
  price_inr numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.points_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases" ON public.points_purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can insert their own purchases
CREATE POLICY "Users can insert own purchases" ON public.points_purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases" ON public.points_purchases
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to credit points after purchase confirmation
CREATE OR REPLACE FUNCTION public.credit_points_purchase(
  p_user_id uuid,
  p_package_name text,
  p_points_amount integer,
  p_price_inr numeric
) RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_balance integer;
  v_new_balance integer;
  v_purchase_id uuid;
BEGIN
  SELECT points_balance INTO v_balance
  FROM profiles WHERE user_id = p_user_id FOR UPDATE;

  IF v_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  v_new_balance := v_balance + p_points_amount;

  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = p_user_id;

  INSERT INTO points_purchases (user_id, package_name, points_amount, price_inr)
  VALUES (p_user_id, p_package_name, p_points_amount, p_price_inr)
  RETURNING id INTO v_purchase_id;

  INSERT INTO points_transactions (user_id, points_used, action_type, description, balance_after)
  VALUES (p_user_id, p_points_amount, 'add', 'Purchased ' || p_package_name, v_new_balance);

  RETURN json_build_object('success', true, 'balance', v_new_balance, 'purchase_id', v_purchase_id);
END;
$$;
