import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const Notifications = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [acceptedReqs, setAcceptedReqs] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  const load = async () => {
    if (!user) return;
    const [{ data: n }, { data: ar }] = await Promise.all([
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("study_requests").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).eq("status", "accepted").order("created_at", { ascending: false }),
    ]);
    setNotifs(n || []);
    setAcceptedReqs(ar || []);
    const ids = new Set<string>();
    (ar || []).forEach((x: any) => { ids.add(x.sender_id); ids.add(x.receiver_id); });
    if (ids.size) {
      const { data: p } = await supabase.from("profiles").select("id, full_name").in("id", Array.from(ids));
      const m: Record<string, any> = {};
      (p || []).forEach((x: any) => (m[x.id] = x));
      setProfiles(m);
    }
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase.channel("notif-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const findAcceptedFor = (notif: any) => {
    if (!/accepted/i.test(notif.message)) return null;
    const nTime = new Date(notif.created_at).getTime();
    let best: any = null;
    let bestDiff = Infinity;
    for (const r of acceptedReqs) {
      const diff = Math.abs(new Date(r.created_at).getTime() - nTime);
      if (diff < bestDiff) { best = r; bestDiff = diff; }
    }
    return best;
  };

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4 flex items-center gap-3">
        <button onClick={() => nav(-1)} className="p-2 rounded-full bg-card"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>
      <div className="px-5 space-y-4">
        <h2 className="font-bold text-sm uppercase text-muted-foreground tracking-wide">Recent</h2>
        {notifs.length === 0 && (
          <div className="bg-card rounded-3xl p-5 text-center text-sm text-muted-foreground">Nothing yet.</div>
        )}
        {notifs.map((n) => (
          <NotifCard
            key={n.id}
            notif={n}
            accepted={findAcceptedFor(n)}
            currentUserId={user?.id}
            profiles={profiles}
            onChat={(partnerId) => nav(`/chat/${partnerId}`)}
            onSession={(sid, partnerId) => nav(`/session-active?sid=${sid}&pid=${partnerId}`)}
          />
        ))}
      </div>
    </AppShell>
  );
};
export default Notifications;

function NotifCard({
  notif, accepted, currentUserId, profiles, onChat, onSession,
}: {
  notif: any; accepted: any; currentUserId?: string; profiles: Record<string, any>;
  onChat: (partnerId: string) => void;
  onSession: (sid: string, partnerId: string) => void;
}) {
  const partnerId = accepted
    ? (accepted.sender_id === currentUserId ? accepted.receiver_id : accepted.sender_id)
    : null;
  const partnerName = partnerId ? profiles[partnerId]?.full_name : null;
  return (
    <div className="bg-card rounded-3xl p-4">
      <p className="text-sm">{notif.message}</p>
      <p className="text-xs text-muted-foreground mt-1">{new Date(notif.created_at).toLocaleString()}</p>
      {accepted && partnerId && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button size="sm" variant="outline" className="rounded-2xl h-9" onClick={() => onChat(partnerId)}>
            <MessageCircle className="mr-1 h-4 w-4" /> Chat{partnerName ? ` ${partnerName.split(" ")[0]}` : ""}
          </Button>
          {accepted.session_id && (
            <Button size="sm" className="rounded-2xl h-9" onClick={() => onSession(accepted.session_id, partnerId)}>
              <PlayCircle className="mr-1 h-4 w-4" /> Session
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
