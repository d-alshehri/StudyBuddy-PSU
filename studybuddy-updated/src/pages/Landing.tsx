import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Landing = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-accent/40 to-background">
      <div className="max-w-md w-full text-center space-y-8">
        <Logo size="lg" />
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Find your perfect study partner</h1>
          <p className="text-muted-foreground">Connect with students nearby and study together — in person.</p>
        </div>
        <div className="space-y-3">
          <Button asChild className="w-full h-12 rounded-2xl text-base">
            <Link to="/signup">Create Account</Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-12 rounded-2xl text-base">
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Landing;