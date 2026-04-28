import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MOCK_STUDENTS } from "@/lib/mockSeed";

// Avatar colour palette keyed by first initial
const AVATAR_COLORS: Record<string, string> = {
  S: "bg-primary/20 text-primary",
  A: "bg-primary/20 text-primary",
  L: "bg-primary/20 text-primary",
  O: "bg-primary/20 text-primary",
  F: "bg-primary/20 text-primary",
};
const avatarColor = (name?: string) =>
  AVATAR_COLORS[name?.[0]?.toUpperCase() ?? ""] ?? "bg-primary/15 text-primary";

const MOCK_PROFILES: Record<string, { full_name: string; major: string; year: string }> = {
  [MOCK_STUDENTS.sarah]:  { full_name: "Sarah Al-Qahtani", major: "Software Engineering", year: "3rd Year" },
  [MOCK_STUDENTS.ahmed]:  { full_name: "Ahmed Al-Rashid",  major: "Computer Science",    year: "2nd Year" },
  [MOCK_STUDENTS.layla]:  { full_name: "Layla Hassan",      major: "Information Systems", year: "4th Year" },
  [MOCK_STUDENTS.omar]:   { full_name: "Omar Al-Harbi",     major: "Data Structures",     year: "3rd Year" },
  [MOCK_STUDENTS.fatima]: { full_name: "Fatima Al-Zahrani", major: "Calculus II",          year: "2nd Year" },
};

const Matches = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  const loadAll = async () => {
    if (!user) return;
    const [{ data: inc }, { data: out }] = await Promise.all([
      supabase.from("study_requests").select("*").eq("receiver_id", user.id).eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("study_requests").select("*").eq("sender_id", user.id).in("status", ["pending", "accepted"]).order("created_at", { ascending: false }),
    ]);
    setIncoming(inc || []);
    setOutgoing(out || []);
    const ids = new Set<string>();
    (inc || []).forEach((r: any) => ids.add(r.sender_id));
    (out || []).forEach((r: any) => ids.add(r.receiver_id));
    if (ids.size) {
      const { data: profs } = await supabase.from("profiles").select("*").in("id", Array.from(ids));
      const map: Record<string, any> = {};
      (profs || []).forEach((x: any) => (map[x.id] = x));
      // Merge with local mock profiles so mock users always show names
      Object.assign(map, MOCK_PROFILES);
      setProfiles(map);
    } else {
      setProfiles({ ...MOCK_PROFILES });
    }
  };

  useEffect(() => {
    loadAll();
    if (!user) return;
    const ch = supabase
      .channel("matches-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "study_requests" }, () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const respond = async (req: any, status: "accepted" | "declined") => {
    if (status === "accepted") {
      const { data: sess } = await supabase.from("study_sessions").insert({
        user1_id: req.sender_id, user2_id: req.receiver_id, course_name: req.course_name,
      }).select().single();
      await supabase.from("study_requests").update({ status, session_id: sess?.id }).eq("id", req.id);
      await supabase.from("notifications").insert({
        user_id: req.sender_id,
        message: `${user?.user_metadata?.full_name || "Your partner"} accepted your study request!`,
      });
      toast.success("Match created — joining session");
      if (sess?.id) nav(`/session-active?sid=${sess.id}&pid=${req.sender_id}`);
    } else {
      await supabase.from("study_requests").update({ status }).eq("id", req.id);
      toast("Request declined");
      loadAll();
    }
  };

  const hasContent = incoming.length > 0 || outgoing.length > 0;

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold">Matches</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Study requests & your sent requests</p>
      </div>

      <div className="px-5 space-y-4 pb-8">
        {/* ── Incoming Requests ── */}
        {incoming.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide flex items-center gap-2">
              Received Requests
              <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
                {incoming.length}
              </span>
            </p>
            {incoming.map((r) => {
              const s = profiles[r.sender_id] ?? MOCK_PROFILES[r.sender_id];
              const initials = s?.full_name?.[0] ?? "?";
              return (
                <div key={r.id} className="bg-card rounded-3xl p-5 shadow-[var(--shadow-card)] border-2 border-primary/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${avatarColor(s?.full_name)}`}>
                      {initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{s?.full_name ?? "Student"}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.course_name}
                        {s?.year ? ` · ${s.year}` : ""}
                      </p>
                    </div>
                    <Badge className="bg-primary/15 text-primary border-0 text-[10px]">NEW</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => respond(r, "accepted")} className="rounded-2xl h-10">
                      <Check className="mr-1 h-4 w-4" /> Accept
                    </Button>
                    <Button onClick={() => respond(r, "declined")} variant="outline" className="rounded-2xl h-10">
                      <X className="mr-1 h-4 w-4" /> Decline
                    </Button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* ── Sent Requests ── */}
        {outgoing.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Sent Requests</p>
            {outgoing.map((r) => {
              const s = profiles[r.receiver_id] ?? MOCK_PROFILES[r.receiver_id];
              return (
                <div key={r.id} className="bg-card rounded-3xl p-4 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${avatarColor(s?.full_name)}`}>
                    {s?.full_name?.[0] ?? "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{s?.full_name ?? "Student"}</p>
                    <p className="text-xs text-muted-foreground">{r.course_name}</p>
                  </div>
                  {r.status === "pending" ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <Badge variant="secondary" className="text-[10px]">WAITING</Badge>
                    </div>
                  ) : (
                    <Button size="sm" className="rounded-xl h-8" onClick={() => nav(`/session-active?sid=${r.session_id}&pid=${r.receiver_id}`)}>
                      <PlayCircle className="mr-1 h-3.5 w-3.5" /> Join
                    </Button>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Empty state */}
        {!hasContent && (
          <div className="bg-card rounded-3xl p-6 text-center text-sm text-muted-foreground">
            No requests yet. Find study partners from the Home page.
          </div>
        )}
      </div>
    </AppShell>
  );
};
export default Matches;
