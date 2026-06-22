import { Link, useRouterState } from "@tanstack/react-router";
import { Dumbbell, Home, LineChart, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: "/app" | "/app/workouts" | "/app/progress" | "/app/exercises";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};
const items: NavItem[] = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/app/progress", label: "Progress", icon: LineChart },
  { to: "/app/exercises", label: "Library", icon: PlayCircle },
];

export function MemberBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 pb-[env(safe-area-inset-bottom)]">
      <ul className="glass-strong shadow-floating mx-auto flex items-center gap-1 rounded-full px-2 py-2">
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-full px-5 py-2 text-[10px] font-medium uppercase tracking-wider transition-all",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <it.icon className="h-5 w-5" />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
