ALTER TABLE public.study_requests DROP CONSTRAINT IF EXISTS study_requests_sender_id_fkey;
ALTER TABLE public.study_requests DROP CONSTRAINT IF EXISTS study_requests_receiver_id_fkey;
ALTER TABLE public.study_sessions DROP CONSTRAINT IF EXISTS study_sessions_user1_id_fkey;
ALTER TABLE public.study_sessions DROP CONSTRAINT IF EXISTS study_sessions_user2_id_fkey;
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_receiver_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS major text;