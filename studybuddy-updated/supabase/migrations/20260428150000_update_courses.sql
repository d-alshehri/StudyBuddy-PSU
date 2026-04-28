
-- Remove old course entries and any stale user_course rows that reference them
DELETE FROM public.user_courses;
DELETE FROM public.courses;

-- Insert the correct PSU course list
INSERT INTO public.courses (course_name) VALUES
  ('CS 101 Computer Programming'),
  ('CS 102 Computer Programming'),
  ('CS 175 Digital Logic & Organization'),
  ('CS 210 Data Structures & Algorithms'),
  ('CS 285 Discrete Math'),
  ('CS 330 Operating Systems'),
  ('CS 331 Data Communications'),
  ('SE 411 Software Construction'),
  ('SE 423 Project Management'),
  ('CYS 401 Fundamentals of Cybersecurity');
