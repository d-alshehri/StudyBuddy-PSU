import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { BookOpen, Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Feedback = () => {
  const nav = useNavigate();
  const [rating, setRating] = useState(0);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-accent/40 to-background">
      <div className="w-full max-w-md text-center space-y-6">
        <Logo />
        <div className="bg-primary/10 rounded-full p-5 inline-flex mx-auto"><BookOpen className="h-12 w-12 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Session Complete!</h1>
          <p className="text-muted-foreground mt-1">Great job on your study session today. How did it go?</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Rate Your Experience</p>
          <div className="flex items-center justify-center gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)}>
                <Star className={`h-10 w-10 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Button onClick={() => nav("/thanks")} className="w-full h-12 rounded-2xl">Submit Feedback</Button>
          <Button onClick={() => nav("/home")} variant="ghost" className="w-full">Skip for now</Button>
        </div>
      </div>
    </div>
  );
};
export default Feedback;