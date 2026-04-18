-- Deny all direct INSERTs to referral_claims from clients.
-- The claim_referral_bonus() SECURITY DEFINER function bypasses RLS and is the
-- only legitimate writer (it validates the referral code and prevents self-referrals).
CREATE POLICY "Block direct inserts to referral_claims"
ON public.referral_claims
FOR INSERT
TO authenticated, anon
WITH CHECK (false);