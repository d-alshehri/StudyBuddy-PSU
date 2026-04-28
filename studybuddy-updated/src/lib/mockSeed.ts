import { supabase } from "@/integrations/supabase/client";

// Original mock students — kept for backward compatibility (Matches.tsx MOCK_PROFILES uses these)
export const MOCK_STUDENTS = {
  sarah:  "11111111-1111-1111-1111-111111111111",
  ahmed:  "22222222-2222-2222-2222-222222222222",
  layla:  "33333333-3333-3333-3333-333333333333",
  omar:   "44444444-4444-4444-4444-444444444444",
  fatima: "55555555-5555-5555-5555-555555555555",
};

// PSU student UUIDs — profiles seeded via migration 20260428130000_psu_mock_data.sql
export const PSU_STUDENTS = {
  ghaliah: "b1111111-0000-0000-0000-000000000001",
  raghad:  "b2222222-0000-0000-0000-000000000002",
  najd:    "b3333333-0000-0000-0000-000000000003",
  basmaa:  "b4444444-0000-0000-0000-000000000004",
  sarah_s: "b5555555-0000-0000-0000-000000000005",
  lamar:   "b6666666-0000-0000-0000-000000000006",
  dayala:  "b7777777-0000-0000-0000-000000000007",
  shikah:  "b8888888-0000-0000-0000-000000000008",
  ajeed:   "b9999999-0000-0000-0000-000000000009",
};

// v4 — bumped so existing accounts re-seed after the updated migration is applied.
// The localStorage key is intentionally written AFTER successful inserts so that if the
// database migration hasn't been applied yet the seed retries on the next page load.
const KEY = (uid: string) => `studybuddy_seeded_v4_${uid}`;

/**
 * One-time per-user seeding:
 *  - 4 incoming pending study requests (Matches page → Accept/Decline)
 *  - matching notifications
 * No outgoing requests are seeded — Sent Requests section starts empty.
 */
export async function seedMockData(userId: string) {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEY(userId))) return;

  try {
    // Best-effort cleanup of any old mock incoming requests
    await supabase
      .from("study_requests")
      .delete()
      .eq("receiver_id", userId)
      .in("sender_id", [
        ...Object.values(MOCK_STUDENTS),
        ...Object.values(PSU_STUDENTS),
      ]);

    // 4 incoming pending requests — will throw if the migration hasn't been applied yet
    const { error: reqErr } = await supabase.from("study_requests").insert([
      {
        sender_id: PSU_STUDENTS.ghaliah,
        receiver_id: userId,
        course_name: "CS 210 Data Structures & Algorithms",
        status: "pending",
      },
      {
        sender_id: PSU_STUDENTS.raghad,
        receiver_id: userId,
        course_name: "SE 411 Software Construction",
        status: "pending",
      },
      {
        sender_id: PSU_STUDENTS.najd,
        receiver_id: userId,
        course_name: "CYS 401 Fundamentals of Cybersecurity",
        status: "pending",
      },
      {
        sender_id: PSU_STUDENTS.basmaa,
        receiver_id: userId,
        course_name: "CS 285 Discrete Math",
        status: "pending",
      },
    ]);
    if (reqErr) throw reqErr;

    // Notifications (best-effort — ignore failures)
    await supabase.from("notifications").insert([
      { user_id: userId, message: "Welcome to StudyBuddy! 🎓" },
      { user_id: userId, message: "Ghaliah Khaled sent you a study request for CS 210 Data Structures & Algorithms." },
      { user_id: userId, message: "Raghad Alotaibi sent you a study request for SE 411 Software Construction." },
      { user_id: userId, message: "Najd Abdulaziz sent you a study request for CYS 401 Fundamentals of Cybersecurity." },
      { user_id: userId, message: "Basmaa Almanee sent you a study request for CS 285 Discrete Math." },
    ]);

    // Only lock the key after everything succeeded — retries on failure automatically
    localStorage.setItem(KEY(userId), "1");
  } catch (e) {
    console.warn("seedMockData: inserts failed — apply migration 20260428130000 and reload", e);
  }
}
