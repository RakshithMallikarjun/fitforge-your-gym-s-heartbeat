import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/assessments", label: "Assessments", icon: Activity },
  { to: "/admin/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
          <Dumbbell className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight">FitForge</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Admin Portal
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Button variant="ghost" className="justify-start" onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>
    </aside>
  );
}
