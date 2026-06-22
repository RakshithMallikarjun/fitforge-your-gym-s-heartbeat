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

type NavItem = {
  to: "/admin" | "/admin/members" | "/admin/assessments" | "/admin/workouts" | "/admin/attendance" | "/admin/analytics";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};
const items: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/assessments", label: "Assessments", icon: Activity },
  { to: "/admin/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 md:flex">
      <div className="mb-10 flex items-center gap-3 px-1">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-foreground text-background shadow-soft">
          <Dumbbell className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-bold tracking-tight">FitForge</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
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
                "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-foreground text-background shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Button variant="ghost" className="justify-start rounded-full" onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>
    </aside>
  );
}
