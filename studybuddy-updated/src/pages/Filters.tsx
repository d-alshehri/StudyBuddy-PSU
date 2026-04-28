import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PSU_COURSES } from "@/lib/courses";

const proxOptions = [
  { id: "same_building", title: "Same building",         sub: "Best for quick meetups" },
  { id: "5min_walk",     title: "Within 5-minute walk", sub: "Just across the quad" },
  { id: "anywhere",      title: "Anywhere on campus",   sub: "Maximum study options" },
];

const Filters = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [courseId, setCourseId] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [prox, setProx] = useState("same_building");

  useEffect(() => {
    if (!user) return;

    // Pre-fill from localStorage first (instant, no network)
    const stored = localStorage.getItem(`studybuddy_filters_${user.id}`);
    if (stored) {
      try {
        const { courseId: sid, prox: sp } = JSON.parse(stored);
        if (sid && PSU_COURSES.find(c => c.id === sid)) setCourseId(sid);
        if (sp) setProx(sp);
        return;
      } catch {}
    }

    // Fall back to DB when localStorage is empty
    supabase
      .from("user_courses")
      .select("course_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.course_id && PSU_COURSES.find(c => c.id === data.course_id))
          setCourseId(data.course_id);
      });

    supabase
      .from("matching_preferences")
      .select("proximity")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => { if (data?.proximity) setProx(data.proximity); });
  }, [user]);

  const find = async () => {
    if (user) {
      const courseName = PSU_COURSES.find(c => c.id === courseId)?.name ?? "";

      // Persist to localStorage immediately so Home page always reads the latest selection
      localStorage.setItem(`studybuddy_filters_${user.id}`, JSON.stringify({ courseId, courseName, prox }));

      // DB writes are best-effort — don't block navigation on them
      supabase
        .from("matching_preferences")
        .upsert({ user_id: user.id, proximity: prox }, { onConflict: "user_id" });

      if (courseId) {
        supabase.from("user_courses").delete().eq("user_id", user.id)
          .then(() => supabase.from("user_courses").insert({ user_id: user.id, course_id: courseId }));
      }
    }
    nav("/home");
  };

  const reset = () => {
    setCourseId("");
    setProx("same_building");
    setCourseSearch("");
    if (user) localStorage.removeItem(`studybuddy_filters_${user.id}`);
  };

  const filtered = PSU_COURSES.filter(c =>
    c.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => nav(-1)} className="p-2 rounded-full bg-card">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Filters</h1>
        </div>
        <button onClick={reset} className="text-primary text-sm font-semibold">Reset</button>
      </div>

      <div className="px-5 space-y-6">
        <div>
          <h2 className="font-bold mb-1">Course</h2>
          <p className="text-sm text-muted-foreground mb-3">Select your current course</p>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search courses…"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="h-12 rounded-2xl pl-9"
            />
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setCourseId(c.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl border-2 transition text-sm ${
                  courseId === c.id
                    ? "border-primary bg-primary/5 font-semibold"
                    : "border-border bg-card"
                }`}
              >
                {c.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No courses match your search.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-bold mb-3">Proximity</h2>
          <div className="space-y-3">
            {proxOptions.map(o => (
              <button
                key={o.id}
                onClick={() => setProx(o.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between transition ${
                  prox === o.id ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div>
                  <p className="font-semibold">{o.title}</p>
                  <p className="text-xs text-muted-foreground">{o.sub}</p>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${prox === o.id ? "border-primary bg-primary" : "border-border"}`}>
                  {prox === o.id && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={find} className="w-full h-12 rounded-2xl">
          <Search className="mr-2 h-4 w-4" /> Find Matches
        </Button>
      </div>
    </AppShell>
  );
};
export default Filters;
