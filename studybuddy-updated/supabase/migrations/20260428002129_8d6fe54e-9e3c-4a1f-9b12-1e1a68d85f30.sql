ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS available_until timestamptz;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

INSERT INTO public.profiles (id, full_name, email, current_location, availability_status, major, avatar_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ghaliah Khaled',    'ghaliah@psu.edu.sa',  'Main Building',  true, 'Computer Science – Artificial Intelligence & Data Science', null),
  ('22222222-2222-2222-2222-222222222222', 'Raghad Alotaibi',   'raghad@psu.edu.sa',   'Building N',     true, 'Software Engineering – Digital Transformation',             null),
  ('33333333-3333-3333-3333-333333333333', 'Najd Abdulaziz',    'najd@psu.edu.sa',     'Building W',     true, 'Information System – Cybersecurity',                        null),
  ('44444444-4444-4444-4444-444444444444', 'Basmaa Almanee',    'basmaa@psu.edu.sa',   'Building S',     true, 'Computer Science – Cybersecurity',                          null),
  ('55555555-5555-5555-5555-555555555555', 'Sarah Saleh',       'sarahS@psu.edu.sa',   'Main Building',  true, 'Software Engineering – Artificial Intelligence & Data Science', null),
  ('66666666-6666-6666-6666-666666666666', 'Lamar Aldossari',   'lamar@psu.edu.sa',    'Building N',     true, 'Information System – Digital Transformation',               null),
  ('77777777-7777-7777-7777-777777777777', 'Dayala Alhammad',   'dayala@psu.edu.sa',   'Building W',     true, 'Computer Science – Digital Transformation',                 null),
  ('88888888-8888-8888-8888-888888888888', 'Shikah Abuhaimed',  'shikah@psu.edu.sa',   'Building S',     true, 'Software Engineering – Cybersecurity',                      null),
  ('99999999-9999-9999-9999-999999999999', 'Ajeed Ahmad',       'ajeed@psu.edu.sa',    'Main Building',  true, 'Information System – Artificial Intelligence & Data Science', null)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  current_location = EXCLUDED.current_location,
  availability_status = EXCLUDED.availability_status,
  major = EXCLUDED.major;

INSERT INTO public.study_requests (sender_id, receiver_id, course_name, status)
SELECT
  sender_id, receiver_id, course_name, 'pending'
FROM (VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, auth.uid(), 'CS 210 – Data Structures & Algorithms'),
  ('33333333-3333-3333-3333-333333333333'::uuid, auth.uid(), 'CS 285 – Discrete Math'),
  ('55555555-5555-5555-5555-555555555555'::uuid, auth.uid(), 'SE 411 – Software Construction'),
  ('77777777-7777-7777-7777-777777777777'::uuid, auth.uid(), 'CYS 401 – Fundamentals of Cybersecurity')
) AS t(sender_id, receiver_id, course_name)
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;