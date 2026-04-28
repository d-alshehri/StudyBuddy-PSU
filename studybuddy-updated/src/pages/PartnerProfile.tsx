import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const PartnerProfile = () => {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [p, setP] = useState<any>(null);
  const [req, setReq] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("profiles").select("*").eq("id", id).maybeSingle().then(({ data }) => setP(data));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    const load = () => supabase.from("study_requests").select("*")
      .eq("sender_id", user.id).eq("receiver_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => setReq(data));
    load();
    const ch = supabase.channel("partner-" + id)
      .on("postgres_changes", { event: "*", schema: "public", table: "study_requests", filter: `receiver_id=eq.${id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, id]);

  useEffect(() => {
    if (req?.status === "accepted" && req.session_id) {
      toast.success("Your request was accepted!");
      nav(`/session-active?sid=${req.session_id}&pid=${id}`);
    }
  }, [req, id, nav]);

  const sendReq = async () => {
    if (!user || !p) return;
    const { error } = await supabase.from("study_requests").insert({
      sender_id: user.id, receiver_id: p.id, course_name: p.major || "Study session",
    });
    if (error) return toast.error(error.message);
    await supabase.from("notifications").insert({
      user_id: p.id, message: `New study request from ${user.user_metadata?.full_name || "a student"}`,
    });
    toast.success("Request sent — waiting for approval");
  };

  if (!p) return <AppShell><div className="p-8 text-center text-muted-foreground">Loading…</div></AppShell>;

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4 flex items-center gap-3">
        <button onClick={() => nav(-1)} className="p-2 rounded-full bg-card"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-xl font-bold">Study Partner</h1>
      </div>
      <div className="px-5 space-y-5">
        <div className="bg-card rounded-3xl p-6 text-center">
          <div className="relative inline-block">
            <div className="h-20 w-20 rounded-full bg-primary/15 mx-auto flex items-center justify-center font-bold text-primary text-3xl">{p.full_name?.[0]}</div>
            {p.availability_status && <div className="absolute bottom-1 right-1 h-4 w-4 bg-primary rounded-full border-2 border-card" />}
          </div>
          <h2 className="text-2xl font-bold mt-3">{p.full_name}</h2>
          <p className="text-muted-foreground">{p.major || "Student"}</p>
          {req?.status === "pending" && <Badge className="mt-3 bg-secondary text-secondary-foreground">Waiting for approval</Badge>}
          {req?.status === "accepted" && <Badge className="mt-3 bg-success text-success-foreground">Match Accepted</Badge>}
        </div>
        <div className="bg-card rounded-3xl p-5">
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Current Location</p>
          <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><span className="font-semibold">{p.current_location || "On campus"}</span></div>
        </div>
        <div className="bg-card rounded-3xl p-5">
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Availability</p>
          <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary" /><span className="font-semibold">{p.availability_status ? "Available now" : "Currently busy"}</span></div>
        </div>
        {!req && <Button onClick={sendReq} className="w-full h-12 rounded-2xl">Send Study Request</Button>}
        {req?.status === "pending" && <Button disabled variant="outline" className="w-full h-12 rounded-2xl">Waiting for approval…</Button>}
        {req?.status === "accepted" && (
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => nav(`/session-active?sid=${req.session_id}&pid=${id}`)} className="h-12 rounded-2xl">Join Session</Button>
            <Button onClick={() => nav("/chat/" + id)} variant="outline" className="h-12 rounded-2xl">
              <MessageCircle className="mr-2 h-4 w-4" /> Chat
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
};
export default PartnerProfile;
