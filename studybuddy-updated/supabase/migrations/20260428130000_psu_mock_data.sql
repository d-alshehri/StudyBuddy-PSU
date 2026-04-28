
-- ── study_requests ──────────────────────────────────────────────────────────
-- Drop FK on sender_id so mock student UUIDs (not in auth.users) can be senders
ALTER TABLE public.study_requests DROP CONSTRAINT IF EXISTS study_requests_sender_id_fkey;

-- Allow any authenticated user to insert a request (needed because mock senders
-- are fake UUIDs, so the old "auth.uid() = sender_id" check always failed)
DROP POLICY IF EXISTS "Sender creates" ON public.study_requests;
CREATE POLICY "Authenticated insert requests" ON public.study_requests
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow receiver (or sender) to delete incoming requests — used by mock cleanup
DROP POLICY IF EXISTS "Receiver deletes" ON public.study_requests;
CREATE POLICY "Receiver deletes" ON public.study_requests
  FOR DELETE TO authenticated USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- ── study_sessions ───────────────────────────────────────────────────────────
-- When a user accepts a mock request, Matches.tsx inserts a session with
-- user1_id = PSU student UUID (fake). Drop the FK so that doesn't violate the constraint.
ALTER TABLE public.study_sessions DROP CONSTRAINT IF EXISTS study_sessions_user1_id_fkey;
ALTER TABLE public.study_sessions DROP CONSTRAINT IF EXISTS study_sessions_user2_id_fkey;

-- Allow any authenticated user to create a session (old policy required user1_id = auth.uid(),
-- which fails when user1_id is the mock sender's fake UUID)
DROP POLICY IF EXISTS "User creates own session" ON public.study_sessions;
CREATE POLICY "Authenticated creates session" ON public.study_sessions
  FOR INSERT TO authenticated WITH CHECK (true);

-- ── PSU mock student profiles ─────────────────────────────────────────────────
-- profiles.id FK to auth.users was already dropped in migration 20260428002129
INSERT INTO public.profiles (id, full_name, email, current_location, availability_status, major)
VALUES
  ('b1111111-0000-0000-0000-000000000001', 'Ghaliah Khaled',   'ghaliah@psu.edu.sa',    'Building N',    true, 'Computer Science · AI & Data Science'),
  ('b2222222-0000-0000-0000-000000000002', 'Raghad Alotaibi',  'raghad@psu.edu.sa',     'Building W',    true, 'Software Engineering · Digital Transformation'),
  ('b3333333-0000-0000-0000-000000000003', 'Najd Abdulaziz',   'najd@psu.edu.sa',       'Building S',    true, 'Computer Science · Cybersecurity'),
  ('b4444444-0000-0000-0000-000000000004', 'Basmaa Almanee',   'basmaa@psu.edu.sa',     'Main Building', true, 'Information Systems · AI & Data Science'),
  ('b5555555-0000-0000-0000-000000000005', 'Sarah Saleh',      'sarahsaleh@psu.edu.sa', 'Building N',    true, 'Computer Science · Cybersecurity'),
  ('b6666666-0000-0000-0000-000000000006', 'Lamar Aldossari',  'lamar@psu.edu.sa',      'Building W',    true, 'Software Engineering · Digital Transformation'),
  ('b7777777-0000-0000-0000-000000000007', 'Dayala Alhammad',  'dayala@psu.edu.sa',     'Building S',    true, 'Computer Science · AI & Data Science'),
  ('b8888888-0000-0000-0000-000000000008', 'Shikah Abuhaimed', 'shikah@psu.edu.sa',     'Main Building', true, 'Information Systems · Digital Transformation'),
  ('b9999999-0000-0000-0000-000000000009', 'Ajeed Ahmad',      'ajeed@psu.edu.sa',      'Building N',    true, 'Computer Science · Cybersecurity')
ON CONFLICT (id) DO UPDATE SET
  full_name           = EXCLUDED.full_name,
  current_location    = EXCLUDED.current_location,
  availability_status = EXCLUDED.availability_status,
  major               = EXCLUDED.major;
