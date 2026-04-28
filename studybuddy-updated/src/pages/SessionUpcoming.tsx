import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, MapPin, Clock, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const SessionUpcoming = () => {
  const nav = useNavigate();
  const [agenda, setAgenda] = useState([
    { text: "Chapter 7 - Supply & Demand", done: true },
    { text: "Practice Questions", done: false },
  ]);

  const toggle = (i: number) => setAgenda(a => a.map((x, j) => j === i ? { ...x, done: !x.done } : x));

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4 flex items-center gap-3">
        <button onClick={() => nav(-1)} className="p-2 rounded-full bg-card"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-xl font-bold">Upcoming Study Session</h1>
      </div>
      <div className="px-5 space-y-5">
        <div className="bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] rounded-3xl p-6 text-primary-foreground">
          <p className="text-xs font-semibold uppercase opacity-80">Course</p>
          <h2 className="text-2xl font-bold">Software Engineering</h2>
          <div className="flex items-center gap-2 mt-3 text-sm"><Clock className="h-4 w-4" /> Today • 2:00 PM - 4:00 PM</div>
          <div className="flex items-center gap-2 mt-1 text-sm"><MapPin className="h-4 w-4" /> Library</div>
        </div>
        <div>
          <h3 className="font-bold mb-3">Session Agenda</h3>
          <div className="space-y-2">
            {agenda.map((a, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 flex items-center gap-3">
                <Checkbox checked={a.done} onCheckedChange={() => toggle(i)} />
                <span className={a.done ? "line-through text-muted-foreground" : ""}>{a.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => nav("/session-active")} className="h-12 rounded-2xl">Join Session</Button>
          <Button onClick={() => nav("/chat/sarah")} variant="outline" className="h-12 rounded-2xl"><MessageCircle className="mr-2 h-4 w-4" /> Message</Button>
        </div>
      </div>
    </AppShell>
  );
};
export default SessionUpcoming;