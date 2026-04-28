import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Bell, Clock, ChevronRight, Search, GraduationCap, SlidersHorizontal } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MOCK_STUDENTS, PSU_STUDENTS } from "@/lib/mockSeed";
import { COURSE_NAME_BY_ID } from "@/lib/courses";

const MOCK_IDS = new Set(Object.values(MOCK_STUDENTS));
const PSU_IDS  = new Set(Object.values(PSU_STUDENTS));

const Home = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<any>(null);
  const [durationOpen, setDurationOpen] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [showPartners, setShowPartners] = useState(false);
  const [filterSummary, setFilterSummary] = useState<{ course: string; prox: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data));
    loadUpcoming();
    loadOutgoing();
    loadFilterSummary();
  }, [user, loc.key]);

  const proxMap: Record<string, string> = {
    same_building: "Same building",
    "5min_walk":   "5-min walk",
    anywhere:      "Anywhere on campus",
  };

  const loadFilterSummary = async () => {
    if (!user) return;

    // Primary: localStorage (written by Filters page on every save — always up to date)
    const stored = localStorage.getItem(`studybuddy_filters_${user.id}`);
    if (stored) {
      try {
        const { courseName, prox } = JSON.parse(stored);
        const proxLabel = prox ? (proxMap[prox] ?? prox) : null;
        if (courseName || proxLabel) {
          setFilterSummary({ course: courseName ?? "", prox: proxLabel ?? "" });
          return;
        }
      } catch {}
    }

    // Fallback: DB (for users who set preferences before this change)
    const [{ data: uc }, { data: mp }] = await Promise.all([
      supabase.from("user_courses").select("course_id").eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("matching_preferences").select("proximity").eq("user_id", user.id).maybeSingle(),
    ]);

    let courseName: string | null = null;
    if (uc?.course_id) {
      const { data: c } = await supabase.from("courses").select("course_name").eq("id", uc.course_id).maybeSingle();
      courseName = c?.course_name ?? COURSE_NAME_BY_ID[uc.course_id] ?? null;
    }
    const proxLabel = mp?.proximity ? (proxMap[mp.proximity] ?? mp.proximity) : null;

    if (courseName || proxLabel) setFilterSummary({ course: courseName ?? "", prox: proxLabel ?? "" });
    else setFilterSummary(null);
  };

  const loadPartners = async () => {
    if (!user) return;

    // Check localStorage first, then DB
    const stored = localStorage.getItem(`studybuddy_filters_${user.id}`);
    const hasCourse = stored && (() => { try { return !!JSON.parse(stored).courseName; } catch { return false; } })();
    if (!hasCourse) {
      const { data: uc } = await supabase.from("user_courses").select("id").eq("user_id", user.id).limit(1);
      if (!uc || uc.length === 0) {
        toast("Choose a course first", {
          description: "Select what you're studying so we can find the right partners.",
          action: { label: "Choose Course", onClick: () => nav("/filters") },
        });
        return;
      }
    }
    const { data } = await supabase.from("profiles").select("*").neq("id", user.id).eq("availability_status", true).limit(50);
    // Only show PSU mock students, deduplicated by ID
    const seen = new Set<string>();
    const unique = (data || []).filter(p => {
      if (!PSU_IDS.has(p.id) || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    setPartners(unique);
    setShowPartners(true);
  };

  const loadOutgoing = async () => {
    if (!user) return;
    const { data } = await supabase.from("study_requests").select("*").eq("sender_id", user.id).in("status", ["pending", "accepted"]);
    setOutgoing(data || []);
  };

  const sendRequest = async (partner: any) => {
    if (!user) return;
    if (outgoing.find((o) => o.receiver_id === partner.id)) {
      toast.info("Request already sent");
      return;
    }
    const { data: req, error } = await supabase.from("study_requests").insert({
      sender_id: user.id, receiver_id: partner.id, course_name: partner.major || "Study session",
    }).select().single();
    if (error) return toast.error(error.message);
    await supabase.from("notifications").insert({
      user_id: partner.id, message: `New study request from ${user.user_metadata?.full_name || "a student"}`,
    });
    toast.success(`Request sent to ${partner.full_name}`);
    loadOutgoing();
    if (req && (MOCK_IDS.has(partner.id) || PSU_IDS.has(partner.id))) {
      setTimeout(async () => {
        const { data: sess } = await supabase.from("study_sessions").insert({
          user1_id: user.id, user2_id: partner.id, course_name: req.course_name,
        }).select().single();
        await supabase.from("study_requests").update({ status: "accepted", session_id: sess?.id }).eq("id", req.id);
        await supabase.from("notifications").insert({
          user_id: user.id, message: `${partner.full_name} accepted your study request!`,
        });
      }, 3500);
    }
  };

  const loadUpcoming = async () => {
    if (!user) return;
    // Find an accepted study request that hasn't been completed
    const { data: reqs } = await supabase
      .from("study_requests")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq("status", "accepted")
      .order("created_at", { ascending: false });
    if (!reqs || reqs.length === 0) return setUpcoming(null);
    const r = reqs[0];
    const otherId = r.sender_id === user.id ? r.receiver_id : r.sender_id;
    const { data: p } = await supabase.from("profiles").select("full_name").eq("id", otherId).maybeSingle();
    setUpcoming({ ...r, partnerName: p?.full_name, otherId });
  };

  const toggleAvail = async (v: boolean) => {
    if (v) {
      setDurationOpen(true);
      return;
    }
    setProfile({ ...profile, availability_status: false, available_until: null });
    await supabase.from("profiles")
      .update({ availability_status: false, available_until: null })
      .eq("id", user!.id);
  };

  const setAvailableFor = async (minutes: number) => {
    const until = new Date(Date.now() + minutes * 60_000).toISOString();
    setProfile({ ...profile, availability_status: true, available_until: until });
    setDurationOpen(false);
    await supabase.from("profiles")
      .update({ availability_status: true, available_until: until })
      .eq("id", user!.id);
  };

  const firstName = (profile?.full_name || "Student").split(" ")[0];
  const availLabel = profile?.available_until
    ? `Until ${new Date(profile.available_until).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : profile?.availability_status ? "AVAILABLE" : "BUSY";

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hello, {firstName}!</h1>
          <p className="text-muted-foreground text-sm">Ready for a study session?</p>
        </div>
        <button onClick={() => nav("/notifications")} className="relative p-2 rounded-full bg-card">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full" />
        </button>
      </div>

      <div className="px-5 space-y-4">
        <button onClick={() => nav("/location")} className="w-full text-left bg-card rounded-3xl p-5 shadow-[var(--shadow-card)] flex items-center gap-4">
          <div className="bg-primary/10 rounded-2xl p-3"><MapPin className="h-6 w-6 text-primary" /></div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Current Location</p>
            <p className="font-semibold">{profile?.current_location || "Set your location"}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="bg-card rounded-3xl p-5 flex items-center justify-between shadow-[var(--shadow-card)]">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Availability Status</p>
            <p className={`font-semibold ${profile?.availability_status ? "text-primary" : "text-muted-foreground"}`}>{availLabel}</p>
          </div>
          <Switch checked={!!profile?.availability_status} onCheckedChange={toggleAvail} />
        </div>

        <button onClick={() => nav("/filters")} className="w-full text-left bg-card rounded-3xl p-5 shadow-[var(--shadow-card)] flex items-center gap-4">
          <div className="bg-primary/10 rounded-2xl p-3"><SlidersHorizontal className="h-6 w-6 text-primary" /></div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Course & Filters</p>
            {filterSummary ? (
              <div className="mt-0.5 space-y-0.5">
                {filterSummary.course && <p className="font-semibold leading-tight">{filterSummary.course}</p>}
                {filterSummary.prox && <p className="text-xs text-muted-foreground">{filterSummary.prox}</p>}
              </div>
            ) : (
              <p className="font-semibold text-muted-foreground">Set your study preferences</p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        <Button onClick={loadPartners} className="w-full h-14 rounded-2xl text-base shadow-[var(--shadow-soft)]">
          <Search className="mr-2 h-5 w-5" /> Find Study Partners
        </Button>

        {showPartners && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Available Partners</p>
            {partners.length === 0 && (
              <div className="bg-card rounded-3xl p-5 text-center text-sm text-muted-foreground">No available partners right now.</div>
            )}
            {partners.map((p) => {
              const sent = outgoing.find((o) => o.receiver_id === p.id);
              return (
                <div key={p.id} className="bg-card rounded-3xl p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {p.full_name?.[0] || "S"}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold leading-tight">{p.full_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5" /> {p.major || "Student"} · {p.current_location || "On campus"}
                      </div>
                    </div>
                  </div>
                  {sent ? (
                    <Button disabled variant="outline" className="w-full h-10 rounded-2xl">
                      {sent.status === "accepted" ? "Accepted" : "Waiting for approval…"}
                    </Button>
                  ) : (
                    <Button onClick={() => sendRequest(p)} className="w-full h-10 rounded-2xl">Send Request</Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {upcoming && (
          <div className="pt-4">
            <h2 className="font-bold mb-3">Your Activity</h2>
            <button
              onClick={() => nav(`/session-active?sid=${upcoming.session_id}&pid=${upcoming.otherId}`)}
              className="w-full text-left bg-card rounded-3xl p-5 flex items-center gap-4 shadow-[var(--shadow-card)]"
            >
              <div className="bg-accent rounded-2xl p-3"><Clock className="h-6 w-6 text-primary" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Active Session</p>
                  <span className="text-primary text-sm font-semibold">Join</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {upcoming.course_name || "Study session"} · with {upcoming.partnerName || "your partner"}
                </p>
              </div>
            </button>
          </div>
        )}
      </div>

      <Dialog open={durationOpen} onOpenChange={setDurationOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>How long are you available?</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {[
              { l: "30 minutes", m: 30 },
              { l: "1 hour", m: 60 },
              { l: "2 hours", m: 120 },
              { l: "Rest of the day", m: 60 * 8 },
            ].map((o) => (
              <Button key={o.m} onClick={() => setAvailableFor(o.m)} className="h-12 rounded-2xl" variant="outline">
                {o.l}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDurationOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};
export default Home;