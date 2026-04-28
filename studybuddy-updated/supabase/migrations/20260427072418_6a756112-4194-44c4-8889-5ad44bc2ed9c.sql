
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  current_location TEXT DEFAULT 'Library 2nd Floor',
  availability_status BOOLEAN DEFAULT true,
  major TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'), NEW.email);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name TEXT NOT NULL UNIQUE
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses readable" ON public.courses FOR SELECT TO authenticated USING (true);

INSERT INTO public.courses (course_name) VALUES
  ('CS101 - Intro to CS'),('Software Engineering'),('Database Systems'),
  ('Computer Science'),('Data Structures'),('Operating Systems');

-- User courses
CREATE TABLE public.user_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, course_id)
);
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User courses readable" ON public.user_courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own courses" ON public.user_courses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Matching preferences
CREATE TABLE public.matching_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  proximity TEXT DEFAULT 'same_building'
);
ALTER TABLE public.matching_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own prefs" ON public.matching_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Study requests
CREATE TABLE public.study_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  course_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.study_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sender or receiver view" ON public.study_requests FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Sender creates" ON public.study_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver updates" ON public.study_requests FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert any notification" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  shared_location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat participants view" ON public.chat_messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Sender creates msg" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Study sessions
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users ON DELETE CASCADE,
  course_name TEXT,
  timer_duration INT DEFAULT 1500,
  checklist_progress JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  quiz_score INT,
  feedback_rating INT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Session participants view" ON public.study_sessions FOR SELECT TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "User creates own session" ON public.study_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user1_id);
CREATE POLICY "Participants update" ON public.study_sessions FOR UPDATE TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_sessions;
ALTER TABLE public.study_sessions REPLICA IDENTITY FULL;
