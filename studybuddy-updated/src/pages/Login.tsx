import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) return toast.error(error.message);
    nav("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-gradient-to-b from-accent/40 to-background">
      <div className="w-full max-w-md space-y-8 mt-6">
        <Logo />
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Login to continue your learning journey</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">University Email</Label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@university.edu" className="pl-10 h-12 rounded-2xl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</Label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input required type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" className="pl-10 h-12 rounded-2xl" />
            </div>
          </div>
          <div className="text-right">
            <Link to="/forgot" className="text-sm text-primary font-medium">Forgot password?</Link>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl text-base">
            {loading ? "Logging in..." : <>Log In <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/signup" className="text-primary font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
};
export default Login;