
-- Add points_balance to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points_balance integer NOT NULL DEFAULT 100;

-- Add points_cost to managed_tools
ALTER TABLE public.managed_tools ADD COLUMN IF NOT EXISTS points_cost integer NOT NULL DEFAULT 0;

-- Create points_transactions table
CREATE TABLE public.points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id text,
  tool_name text,
  points_used integer NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('use', 'add', 'deduct')),
  description text DEFAULT '',
  admin_id uuid,
  balance_after integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.points_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert transactions for themselves (tool usage)
CREATE POLICY "Users can insert own transactions"
  ON public.points_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND action_type = 'use');

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.points_transactions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert transactions (add/deduct)
CREATE POLICY "Admins can insert transactions"
  ON public.points_transactions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create a secure function to deduct points atomically
CREATE OR REPLACE FUNCTION public.deduct_tool_points(
  p_user_id uuid,
  p_tool_id text,
  p_tool_name text,
  p_points_cost integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance integer;
  v_new_balance integer;
BEGIN
  -- Get current balance with row lock
  SELECT points_balance INTO v_balance
  FROM profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  IF p_points_cost = 0 THEN
    RETURN json_build_object('success', true, 'balance', v_balance);
  END IF;

  IF v_balance < p_points_cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient points', 'balance', v_balance, 'cost', p_points_cost);
  END IF;

  v_new_balance := v_balance - p_points_cost;

  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = p_user_id;

  INSERT INTO points_transactions (user_id, tool_id, tool_name, points_used, action_type, balance_after)
  VALUES (p_user_id, p_tool_id, p_tool_name, p_points_cost, 'use', v_new_balance);

  RETURN json_build_object('success', true, 'balance', v_new_balance);
END;
$$;

-- Create a secure function for admin to adjust points
CREATE OR REPLACE FUNCTION public.admin_adjust_points(
  p_admin_id uuid,
  p_user_id uuid,
  p_points integer,
  p_action text,
  p_description text DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance integer;
  v_new_balance integer;
BEGIN
  -- Verify admin
  IF NOT has_role(p_admin_id, 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT points_balance INTO v_balance
  FROM profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  IF p_action = 'add' THEN
    v_new_balance := v_balance + p_points;
  ELSIF p_action = 'deduct' THEN
    v_new_balance := GREATEST(v_balance - p_points, 0);
  ELSE
    RETURN json_build_object('success', false, 'error', 'Invalid action');
  END IF;

  UPDATE profiles SET points_balance = v_new_balance WHERE user_id = p_user_id;

  INSERT INTO points_transactions (user_id, points_used, action_type, description, admin_id, balance_after)
  VALUES (p_user_id, p_points, p_action, p_description, p_admin_id, v_new_balance);

  RETURN json_build_object('success', true, 'balance', v_new_balance);
END;
$$;
