-- Revoke EXECUTE from public on all SECURITY DEFINER functions in public schema
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_favorite_points() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_review_points() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_duplicate_tool_usage() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_tool_usage_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_api_key(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.api_deduct_points(uuid, text, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_points_purchase(uuid, text, integer, numeric) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- Client-callable functions: revoke from public/anon, allow authenticated only
REVOKE EXECUTE ON FUNCTION public.create_api_key(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.revoke_api_key(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rotate_api_key(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.deduct_tool_points(uuid, text, text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_daily_reward(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_referral_bonus(text, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_review_id(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_purchase_request(uuid, text, integer, numeric, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_adjust_points(uuid, uuid, integer, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_approve_purchase(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_reject_purchase(uuid, uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;

-- Public/anonymous access intentionally kept for homepage stats
-- get_most_used_tools(integer) remains executable by anon and authenticated