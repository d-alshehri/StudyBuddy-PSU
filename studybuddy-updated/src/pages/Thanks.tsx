import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Thanks = () => {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-accent/40 to-background">
      <div className="w-full max-w-md text-center space-y-6">
        <Logo />
        <div className="bg-success/15 rounded-full p-5 inline-flex mx-auto"><BookOpen className="h-12 w-12 text-success" /></div>
        <h1 className="text-3xl font-bold">Thank You!</h1>
        <p className="text-muted-foreground">Your feedback helps us make <strong className="text-foreground">StudyBuddy</strong> even better for the entire campus community.</p>
        <Button onClick={() => nav("/home")} className="w-full h-12 rounded-2xl">Back to Dashboard</Button>
      </div>
    </div>
  );
};
export default Thanks;