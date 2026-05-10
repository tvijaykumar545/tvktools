CREATE POLICY "Admins can view all api keys"
ON public.api_keys
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all api request log"
ON public.api_request_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));