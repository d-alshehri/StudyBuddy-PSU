import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LogOut, Pencil, Check, Clock, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const AVATARS = ["🦊", "🐼", "🐧", "🦁", "🐨", "🐸", "🦉", "🐯", "🐰", "🐻", "🦄", "🐶"];
const MAJORS = [
  "Computer Science",
  "Software Engineering",
  "Information Systems",
  "Cybersecurity",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Architecture",
  "Business Administration",
  "Finance",
  "Accounting",
  "Marketing",
  "Law",
  "Interior Design",
];

const Profile = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [major, setMajor] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      setProfile(data);
      setName(data?.full_name || "");
      setAvatar(data?.avatar_url || "");
      setMajor(data?.major || "");
    });
    supabase.from("study_sessions").select("*").eq("user1_id", user.id).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setSessions(data || []));
  }, [user]);

  const logout = async () => { await supabase.auth.signOut(); nav("/"); };

  const save = async () => {
    if (!user) return;
    if (!name.trim()) return toast.error("Name can't be empty");
    const { error } = await supabase.from("profiles")
      .update({ full_name: name.trim(), avatar_url: avatar || null, major: major || null })
      .eq("id", user.id);
    if (error) return toast.error(error.message);
    setProfile({ ...profile, full_name: name.trim(), avatar_url: avatar, major });
    setEditOpen(false);
    toast.success("Profile updated");
  };

  const initial = profile?.full_name?.[0] || "S";

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <button onClick={logout} className="p-2 rounded-full bg-card"><LogOut className="h-5 w-5" /></button>
      </div>
      <div className="px-5 space-y-5">
        <div className="bg-card rounded-3xl p-6 text-center relative">
          <button
            onClick={() => setEditOpen(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-primary text-primary-foreground"
            aria-label="Edit profile"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <div className="h-20 w-20 rounded-full bg-primary/15 mx-auto flex items-center justify-center font-bold text-primary text-3xl">
            {profile?.avatar_url ? <span className="text-4xl">{profile.avatar_url}</span> : initial}
          </div>
          <h2 className="text-xl font-bold mt-3">{profile?.full_name || "Student"}</h2>
          {profile?.major && <p className="text-sm text-muted-foreground mt-0.5">{profile.major}</p>}
          <Badge className={`mt-2 ${profile?.availability_status ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{profile?.availability_status ? "Available" : "Busy"}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-3xl p-5 text-center">
            <p className="text-xs uppercase font-semibold text-muted-foreground">Study Time</p>
            <p className="text-2xl font-bold mt-1">28.5 hrs</p>
          </div>
          <div className="bg-card rounded-3xl p-5 text-center">
            <p className="text-xs uppercase font-semibold text-muted-foreground">Active Matches</p>
            <p className="text-2xl font-bold mt-1">12</p>
            <p className="text-xs text-muted-foreground">Partners</p>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-3">Session History</h3>
          <div className="space-y-3">
            {/* Mock completed session */}
            <div className="bg-card rounded-3xl p-5 border border-primary/20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold leading-tight">Ghaliah Khaled</p>
                  <p className="text-sm text-muted-foreground mt-0.5">CS 210 Data Structures & Algorithms</p>
                </div>
                <Badge className="bg-primary text-primary-foreground shrink-0 ml-3">Completed</Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> April 25, 2026
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 1h 30min
                </span>
              </div>

              <div className="space-y-1.5 mb-3">
                {[
                  "Reviewed sorting algorithms",
                  "Solved 3 practice problems",
                  "Discussed Big O notation",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground italic leading-relaxed">
                "Binary search runs in O(log n)... merge sort is O(n log n) — stable and preferred for linked lists."
              </div>
            </div>

          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Full name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-2xl mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Major</label>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full h-12 rounded-2xl mt-1 border border-border bg-background px-3 text-sm"
              >
                <option value="">Select your major…</option>
                {MAJORS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Avatar</label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`h-12 w-12 rounded-2xl text-2xl flex items-center justify-center border-2 transition ${
                      avatar === a ? "border-primary bg-primary/10" : "border-border bg-card"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={save} className="rounded-2xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};
export default Profile;
