import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const proxOptions = [
  { id: "same_building", title: "Same building",           sub: "Best for quick meetups" },
  { id: "5min_walk",     title: "Within 5-minute walk",   sub: "Just across the quad" },
  { id: "anywhere",      title: "Anywhere on campus",     sub: "Maximum study options" },
];

const Filters = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<{ id: string; course_name: string }[]>([]);
  const [course, setCourse] = useState<string>("");
  const [prox, setProx] = useState("same_building");

  useEffect(() => {
    // Load available courses
    supabase.from("courses").select("*").order("course_name").then(({ data }) => setCourses(data || []));

    // Pre-fill with the user's existing preferences
    if (!user) return;
    supabase
      .from("user_courses")
      .select("course_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data?.course_id) setCourse(data.course_id); });

    supabase
      .from("matching_preferences")
      .select("proximity")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => { if (data?.proximity) setProx(data.proximity); });
  }, [user]);

  const find = async () => {
    if (user) {
      await supabase
        .from("matching_preferences")
        .upsert({ user_id: user.id, proximity: prox }, { onConflict: "user_id" });

      if (course) {
        // Replace the previous selection so the home card always shows the latest choice
        await supabase.from("user_courses").delete().eq("user_id", user.id);
        await supabase.from("user_courses").insert({ user_id: user.id, course_id: course });
      }
    }
    nav("/home");
  };

  const reset = () => { setCourse(""); setProx("same_building"); };

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
          <Select value={course} onValueChange={setCourse}>
            <SelectTrigger className="h-12 rounded-2xl">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.course_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
