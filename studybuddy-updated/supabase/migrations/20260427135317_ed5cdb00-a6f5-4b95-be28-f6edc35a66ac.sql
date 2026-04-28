ALTER TABLE public.study_requests ADD COLUMN IF NOT EXISTS session_id uuid;

-- Enable realtime on requests, sessions, messages, notifications
ALTER TABLE public.study_requests REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.study_sessions REPLICA IDENTITY FULL;

DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='study_requests';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.study_requests; END IF;
END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='chat_messages';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages; END IF;
END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='notifications';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; END IF;
END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='study_sessions';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.study_sessions; END IF;
END $$;