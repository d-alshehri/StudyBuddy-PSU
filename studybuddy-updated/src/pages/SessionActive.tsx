import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const QUIZ = [
  { q: "What does HCI stand for?", a: ["Human Computer Interaction", "High Code Index", "Hyper Computing Interface"], correct: 0 },
  { q: "Which is a usability heuristic?", a: ["Match between system and real world", "Cache invalidation", "Big O analysis"], correct: 0 },
  { q: "Pomodoro length?", a: ["25 min", "60 min", "10 min"], correct: 0 },
];

const SessionActive = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const sid = params.get("sid");
  const pid = params.get("pid");

  const [partner, setPartner] = useState<any>(null);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [tasks, setTasks] = useState<any[]>([
    { text: "Review chapter summary", done: false },
    { text: "Complete practice quiz", done: false },
    { text: "Discuss findings", done: false },
  ]);
  const [newTask, setNewTask] = useState("");
  const [notes, setNotes] = useState("Shared session notes — type together!\n");
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const sessionId = useRef<string | null>(sid);
  const skipNextSync = useRef(false);

  // Init or load session
  useEffect(() => {
    if (!user) return;
    (async () => {
      if (sid) {
        const { data } = await supabase.from("study_sessions").select("*").eq("id", sid).maybeSingle();
        if (data) {
          sessionId.current = data.id;
          if (Array.isArray(data.checklist_progress) && data.checklist_progress.length) setTasks(data.checklist_progress as any);
          if (data.notes) setNotes(data.notes);
        }
      } else {
        const { data } = await supabase.from("study_sessions").insert({
          user1_id: user.id, course_name: "Solo Study Session",
        }).select().single();
        if (data) sessionId.current = data.id;
      }
      if (pid) {
        const { data: pp } = await supabase.from("profiles").select("*").eq("id", pid).maybeSingle();
        setPartner(pp);
      }
    })();
  }, [user, sid, pid]);

  // Realtime sync of session row (notes & checklist)
  useEffect(() => {
    if (!sessionId.current) return;
    const ch = supabase
      .channel("session-" + sessionId.current)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "study_sessions", filter: `id=eq.${sessionId.current}` }, (p) => {
        const s = p.new as any;
        if (skipNextSync.current) { skipNextSync.current = false; return; }
        if (Array.isArray(s.checklist_progress)) setTasks(s.checklist_progress);
        if (typeof s.notes === "string") setNotes(s.notes);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sessionId.current]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const done = tasks.filter((t) => t.done).length;

  const pushUpdate = async (patch: any) => {
    if (!sessionId.current) return;
    skipNextSync.current = true;
    await supabase.from("study_sessions").update(patch).eq("id", sessionId.current);
  };

  const toggleTask = (i: number) => {
    const next = tasks.map((x, j) => (j === i ? { ...x, done: !x.done } : x));
    setTasks(next);
    pushUpdate({ checklist_progress: next });
  };
  const addTask = () => {
    if (!newTask.trim()) return;
    const next = [...tasks, { text: newTask, done: false }];
    setTasks(next);
    setNewTask("");
    pushUpdate({ checklist_progress: next });
  };

  const endSession = async () => {
    if (sessionId.current) {
      await supabase.from("study_sessions").update({
        completed_at: new Date().toISOString(),
        timer_duration: 25 * 60 - seconds,
        checklist_progress: tasks, notes, quiz_score: score,
      }).eq("id", sessionId.current);
    }
    toast.success("Session ended");
    nav("/feedback");
  };

  const answer = (i: number) => {
    if (i === QUIZ[qIdx].correct) setScore((s) => s + 1);
    if (qIdx + 1 < QUIZ.length) setQIdx(qIdx + 1);
    else setQuizDone(true);
  };

  return (
    <AppShell hideNav>
      <div className="px-5 pt-8 pb-2 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Active Study Session</p>
        {partner && (
          <p className="text-sm mt-1">
            with <span className="font-bold text-primary">{partner.full_name}</span> · {partner.current_location || "on campus"}
          </p>
        )}
        <div className="my-5">
          <div className="text-6xl font-bold tabular-nums">{mm} : {ss}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <Button onClick={() => setRunning(!running)} className="h-11 rounded-2xl">{running ? "Pause" : "Start"}</Button>
          <Button onClick={() => { setRunning(false); setSeconds(25 * 60); }} variant="outline" className="h-11 rounded-2xl">Reset</Button>
        </div>
      </div>

      <div className="px-5 mt-2">
        <Tabs defaultValue="goals">
          <TabsList className="grid grid-cols-3 w-full rounded-2xl h-11">
            <TabsTrigger value="goals" className="rounded-xl">Checklist</TabsTrigger>
            <TabsTrigger value="notes" className="rounded-xl">Notes</TabsTrigger>
            <TabsTrigger value="quiz" className="rounded-xl">Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Shared Checklist</h3>
              <span className="text-sm text-muted-foreground">{done}/{tasks.length}</span>
            </div>
            {tasks.map((t, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 flex items-center gap-3">
                <Checkbox checked={t.done} onCheckedChange={() => toggleTask(i)} />
                <span className={t.done ? "line-through text-muted-foreground" : ""}>{t.text}</span>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add task..." className="flex-1 px-4 h-11 rounded-2xl bg-card border border-border outline-none focus:border-primary" />
              <Button onClick={addTask} className="rounded-2xl h-11">Add</Button>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-4 space-y-2">
            <h3 className="font-bold">Shared Notes (live)</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => pushUpdate({ notes })}
              className="min-h-40 rounded-2xl"
            />
            <p className="text-xs text-muted-foreground italic">Saves when you click outside the box.</p>
          </TabsContent>

          <TabsContent value="quiz" className="mt-4 space-y-3">
            {!quizDone ? (
              <div className="bg-card rounded-3xl p-5 space-y-3">
                <p className="text-xs text-muted-foreground">Question {qIdx + 1} of {QUIZ.length}</p>
                <p className="font-semibold">{QUIZ[qIdx].q}</p>
                <div className="space-y-2">
                  {QUIZ[qIdx].a.map((opt, i) => (
                    <button key={i} onClick={() => answer(i)} className="w-full text-left p-3 rounded-2xl border-2 border-border hover:border-primary transition">{opt}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-3xl p-6 text-center">
                <p className="text-muted-foreground text-sm uppercase font-semibold">Your Score</p>
                <p className="text-4xl font-bold text-primary mt-2">{score} / {QUIZ.length}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="px-5 mt-6 pb-8 grid grid-cols-2 gap-3">
        {pid && <Button onClick={() => nav("/chat/" + pid)} variant="outline" className="h-12 rounded-2xl">Open Chat</Button>}
        <Button onClick={endSession} variant="destructive" className={`h-12 rounded-2xl ${pid ? "" : "col-span-2"}`}>End Session</Button>
      </div>
    </AppShell>
  );
};
export default SessionActive;
