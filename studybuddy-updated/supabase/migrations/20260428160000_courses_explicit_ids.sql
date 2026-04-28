-- Re-seed courses with explicit UUIDs that match the frontend constants in src/lib/courses.ts
DELETE FROM public.user_courses;
DELETE FROM public.courses;

INSERT INTO public.courses (id, course_name) VALUES
  ('c1000001-0000-0000-0000-000000000001', 'CS 101 Computer Programming'),
  ('c1000002-0000-0000-0000-000000000002', 'CS 102 Computer Programming'),
  ('c1000003-0000-0000-0000-000000000003', 'CS 175 Digital Logic & Organization'),
  ('c1000004-0000-0000-0000-000000000004', 'CS 210 Data Structures & Algorithms'),
  ('c1000005-0000-0000-0000-000000000005', 'CS 285 Discrete Math'),
  ('c1000006-0000-0000-0000-000000000006', 'CS 330 Operating Systems'),
  ('c1000007-0000-0000-0000-000000000007', 'CS 331 Data Communications'),
  ('c1000008-0000-0000-0000-000000000008', 'SE 411 Software Construction'),
  ('c1000009-0000-0000-0000-000000000009', 'SE 423 Project Management'),
  ('c1000010-0000-0000-0000-000000000010', 'CYS 401 Fundamentals of Cybersecurity');
