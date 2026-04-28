import { Home, Heart, MessageCircle, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/matches", icon: Heart, label: "Matches" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/profile", icon: User, label: "Profile" },
];

export const BottomNav = () => {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 mx-auto max-w-md bg-background/95 backdrop-blur border-t border-border">
      <div className="grid grid-cols-4 px-2 py-2">
        {items.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} className={cn(
              "flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}>
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};