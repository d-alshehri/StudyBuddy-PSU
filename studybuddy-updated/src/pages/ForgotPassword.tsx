import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Reset link sent to ${email}`);
  };
  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 bg-gradient-to-b from-accent/40 to-background">
      <div className="w-full max-w-md space-y-8 mt-6">
        <Logo />
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">We'll send you a reset link</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>University Email</Label>
            <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12 rounded-2xl" />
          </div>
          <Button type="submit" className="w-full h-12 rounded-2xl">Send reset link</Button>
        </form>
        <p className="text-center text-sm">
          <Link to="/login" className="text-primary font-semibold">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};
export default ForgotPassword;