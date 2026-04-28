import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CampusMap } from "@/components/CampusMap";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const MapConfirm = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [loc, setLoc] = useState(params.get("loc") || "Library");

  const confirm = async () => {
    if (user) await supabase.from("profiles").update({ current_location: loc }).eq("id", user.id);
    toast.success("Location confirmed");
    nav("/home");
  };

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4 flex items-center gap-3">
        <button onClick={() => nav(-1)} className="p-2 rounded-full bg-card"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-xl font-bold">Confirm on Map</h1>
      </div>
      <div className="px-5 space-y-5">
        <CampusMap height="340px" selected={loc} onSelect={setLoc} />
        <div className="bg-card rounded-3xl p-5">
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Selected Location · PINNED</p>
          <p className="font-semibold text-lg">{loc}</p>
        </div>
        <Button onClick={confirm} className="w-full h-12 rounded-2xl">
          <Check className="mr-2 h-5 w-5" /> Confirm Location
        </Button>
      </div>
    </AppShell>
  );
};
export default MapConfirm;
