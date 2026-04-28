import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type Msg = { id: string; sender_id: string; receiver_id: string; message: string; shared_location?: string | null; created_at: string };

const ChatList = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      const seen = new Set<string>();
      const t: any[] = [];
      (msgs || []).forEach((m: any) => {
        const other = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        if (seen.has(other)) return;
        seen.add(other);
        t.push({ other, last: m.message, at: m.created_at });
      });
      if (t.length) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", t.map((x) => x.other));
        const map: Record<string, string> = {};
        (profs || []).forEach((p: any) => (map[p.id] = p.full_name));
        setThreads(t.map((x) => ({ ...x, name: map[x.other] || "Student" })));
      }
    })();
  }, [user]);

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4"><h1 className="text-2xl font-bold">Chats</h1></div>
      <div className="px-5 space-y-3">
        {threads.length === 0 && (
          <div className="bg-card rounded-3xl p-6 text-center text-sm text-muted-foreground">
            No chats yet. Match with a partner to start a conversation.
          </div>
        )}
        {threads.map((t) => (
          <button key={t.other} onClick={() => nav("/chat/" + t.other)} className="w-full text-left bg-card rounded-3xl p-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary">{t.name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-muted-foreground truncate">{t.last}</p>
            </div>
          </button>
        ))}
      </div>
    </AppShell>
  );
};

const ChatThread = ({ partnerId }: { partnerId: string }) => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [partner, setPartner] = useState<any>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", partnerId).maybeSingle().then(({ data }) => setPartner(data));
    supabase
      .from("chat_messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMsgs((data as any) || []));

    const ch = supabase
      .channel("chat-" + user.id + "-" + partnerId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (p) => {
        const m = p.new as any;
        if ((m.sender_id === user.id && m.receiver_id === partnerId) || (m.sender_id === partnerId && m.receiver_id === user.id)) {
          setMsgs((prev) => prev.find((x) => x.id === m.id) ? prev : [...prev, m]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, partnerId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [msgs]);

  const send = async (location?: string) => {
    if (!user || (!text.trim() && !location)) return;
    const payload = {
      sender_id: user.id,
      receiver_id: partnerId,
      message: location ? "Shared my location" : text,
      shared_location: location ?? null,
    };
    setText("");
    const { data, error } = await supabase.from("chat_messages").insert(payload).select().single();
    if (!error && data) setMsgs((m) => (m.find((x) => x.id === data.id) ? m : [...m, data as any]));
  };

  return (
    <AppShell>
      <div className="sticky top-0 bg-background z-10 px-5 pt-8 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={() => nav(-1)} className="p-2 rounded-full bg-card"><ArrowLeft className="h-5 w-5" /></button>
        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary">
          {partner?.full_name?.[0] || "?"}
        </div>
        <div>
          <p className="font-bold">{partner?.full_name || "Student"}</p>
          <p className="text-xs text-primary">{partner?.availability_status ? "Online" : "Offline"}</p>
        </div>
      </div>
      <div ref={scrollRef} className="px-5 py-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
        {msgs.length === 0 && <p className="text-center text-xs text-muted-foreground">Say hi 👋</p>}
        {msgs.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card rounded-bl-sm"}`}>
                <p className="text-sm">{m.message}</p>
                {m.shared_location && (
                  <div className={`mt-2 flex items-center gap-1.5 text-xs ${mine ? "text-primary-foreground/90" : "text-primary"}`}>
                    <MapPin className="h-3.5 w-3.5" /> {m.shared_location}
                  </div>
                )}
                <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-md px-4 py-2 bg-background border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shrink-0" onClick={() => send(partner?.current_location || "On campus")}>
            <MapPin className="h-4 w-4" />
          </Button>
          <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message..." className="h-10 rounded-full" />
          <Button onClick={() => send()} size="icon" className="rounded-full h-10 w-10 shrink-0"><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </AppShell>
  );
};

const ChatPage = () => {
  const { id } = useParams();
  if (!id) return <ChatList />;
  return <ChatThread partnerId={id} />;
};
export default ChatPage;
