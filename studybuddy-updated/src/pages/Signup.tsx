import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Signup = () => {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", pw: "", cpw: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pw !== form.cpw) return toast.error("Passwords do not match");
    if (form.pw.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.pw,
      options: { emailRedirectTo: `${window.location.origin}/home`, data: { full_name: form.name } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
    nav("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-gradient-to-b from-accent/40 to-background">
      <div className="w-full max-w-md space-y-6">
        <Logo />
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">Join the StudyBuddy community</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field icon={<User className="h-4 w-4" />} label="Full Name">
            <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Danah Alshehri" className="pl-10 h-12 rounded-2xl" />
          </Field>
          <Field icon={<Mail className="h-4 w-4" />} label="University Email">
            <Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@university.edu" className="pl-10 h-12 rounded-2xl" />
          </Field>
          <Field icon={<Lock className="h-4 w-4" />} label="Password">
            <Input required type="password" value={form.pw} onChange={e => setForm({ ...form, pw: e.target.value })} placeholder="••••••••" className="pl-10 h-12 rounded-2xl" />
          </Field>
          <Field icon={<ShieldCheck className="h-4 w-4" />} label="Confirm Password">
            <Input required type="password" value={form.cpw} onChange={e => setForm({ ...form, cpw: e.target.value })} placeholder="••••••••" className="pl-10 h-12 rounded-2xl" />
          </Field>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl text-base">
            {loading ? "Creating..." : <>Sign Up <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-semibold">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

const Field = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
      {children}
    </div>
  </div>
);

export default Signup;