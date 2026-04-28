import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, BookOpen, Building2, Coffee, Dumbbell, LocateFixed, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { CampusMap, PSU_BUILDINGS, PSU_CENTER } from "@/components/CampusMap";

// Radius covers the PSU campus footprint (Prince Sultan University, Riyadh)
const CAMPUS_RADIUS_M = 800;

function distanceMeters(a: [number, number], b: [number, number]) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const icons: Record<string, any> = {
  "Building N":    Building2,
  "Building W":    Building2,
  "Building S":    Building2,
  "Main Building": Building2,
};

type CheckState = "idle" | "checking" | "on_campus" | "off_campus";

const LocationUpdate = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [current, setCurrent] = useState("Main Building");
  const [selected, setSelected] = useState("Main Building");
  const [checkState, setCheckState] = useState<CheckState>("idle");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("current_location").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.current_location) setCurrent(data.current_location);
    });
  }, [user]);

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported by your browser");
    setCheckState("checking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const dist = distanceMeters(here, PSU_CENTER);
        if (dist <= CAMPUS_RADIUS_M) {
          setCheckState("on_campus");
          toast.success("You're on campus — pick your building below");
        } else {
          setCheckState("off_campus");
        }
      },
      () => {
        setCheckState("idle");
        toast.error("Could not get your location. Please allow location access.");
      }
    );
  };

  const confirm = async () => {
    if (checkState === "off_campus") return;
    await supabase.from("profiles").update({ current_location: selected }).eq("id", user!.id);
    toast.success("Location updated");
    nav("/map-confirm?loc=" + encodeURIComponent(selected));
  };

  // If off campus, show blocking screen
  if (checkState === "off_campus") {
    return (
      <AppShell>
        <div className="px-5 pt-8 pb-4 flex items-center gap-3">
          <button onClick={() => setCheckState("idle")} className="p-2 rounded-full bg-card">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Update Location</h1>
        </div>
        <div className="px-5 flex flex-col items-center justify-center pt-10 gap-6">
          <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-xl font-bold text-destructive">You're off campus</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              StudyBuddy is designed for in-person study sessions on campus only. You need to be physically on campus to use this feature.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Come to campus and try again — we'll be here when you arrive! 📚
            </p>
          </div>
          <Button variant="outline" className="w-full h-12 rounded-2xl" onClick={() => setCheckState("idle")}>
            Go Back
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4 flex items-center gap-3">
        <button onClick={() => nav(-1)} className="p-2 rounded-full bg-card"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-xl font-bold">Update Location</h1>
      </div>
      <div className="px-5 space-y-5">
        {/* Current location */}
        <div className="bg-card rounded-3xl p-5">
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Current Location</p>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-semibold">{current}</span>
          </div>
        </div>

        {/* Detect button */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl flex items-center gap-2"
          onClick={detectLocation}
          disabled={checkState === "checking"}
        >
          <LocateFixed className="h-4 w-4" />
          {checkState === "checking" ? "Detecting your location..." : "Detect My Location"}
        </Button>

        {/* On campus confirmation banner */}
        {checkState === "on_campus" && (
          <div className="bg-primary/10 text-primary rounded-2xl p-4 text-sm font-medium flex items-center gap-2">
            ✓ You're on campus! Select your building below.
          </div>
        )}

        {/* Map (shown only when on campus or idle) */}
        {checkState !== "off_campus" && (
          <CampusMap height="260px" selected={selected} onSelect={setSelected} />
        )}

        {/* Building picker */}
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">
            {checkState === "on_campus" ? "Select Your Building" : "Or Pick a Building Manually"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PSU_BUILDINGS.map(b => {
              const Icon = icons[b.name] || Building2;
              return (
                <button
                  key={b.name}
                  onClick={() => setSelected(b.name)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${
                    selected === b.name ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-center">{b.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 pb-6">
          <Button variant="outline" className="h-12 rounded-2xl" onClick={() => nav(-1)}>Cancel</Button>
          <Button className="h-12 rounded-2xl" onClick={confirm}>Confirm</Button>
        </div>
      </div>
    </AppShell>
  );
};
export default LocationUpdate;
