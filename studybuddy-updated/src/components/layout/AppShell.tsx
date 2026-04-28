import { ReactNode, useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { seedMockData } from "@/lib/mockSeed";

export const AppShell = ({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) => {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  // Global: when a study request you sent is accepted, jump into the shared session
  useEffect(() => {
    if (!user) return;
    seedMockData(user.id);
    const ch = supabase
      .channel("global-req-" + user.id)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "study_requests", filter: `sender_id=eq.${user.id}` },
        (p) => {
          const r = p.new as any;
          if (r.status === "accepted" && r.session_id && !loc.pathname.startsWith("/session-active")) {
            toast.success("Your study request was accepted!");
            nav(`/session-active?sid=${r.session_id}&pid=${r.receiver_id}`);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, nav, loc.pathname]);

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md relative pb-24">
        {children}
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
};
