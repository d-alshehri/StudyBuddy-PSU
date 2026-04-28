export const PSU_COURSES = [
  { id: "c1000001-0000-0000-0000-000000000001", name: "CS 101 Computer Programming" },
  { id: "c1000002-0000-0000-0000-000000000002", name: "CS 102 Computer Programming" },
  { id: "c1000003-0000-0000-0000-000000000003", name: "CS 175 Digital Logic & Organization" },
  { id: "c1000004-0000-0000-0000-000000000004", name: "CS 210 Data Structures & Algorithms" },
  { id: "c1000005-0000-0000-0000-000000000005", name: "CS 285 Discrete Math" },
  { id: "c1000006-0000-0000-0000-000000000006", name: "CS 330 Operating Systems" },
  { id: "c1000007-0000-0000-0000-000000000007", name: "CS 331 Data Communications" },
  { id: "c1000008-0000-0000-0000-000000000008", name: "SE 411 Software Construction" },
  { id: "c1000009-0000-0000-0000-000000000009", name: "SE 423 Project Management" },
  { id: "c1000010-0000-0000-0000-000000000010", name: "CYS 401 Fundamentals of Cybersecurity" },
] as const;

export const COURSE_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  PSU_COURSES.map(c => [c.id, c.name])
);
