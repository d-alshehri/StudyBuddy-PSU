
DROP POLICY IF EXISTS "Insert any notification" ON public.notifications;
CREATE POLICY "Authenticated insert notification" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
