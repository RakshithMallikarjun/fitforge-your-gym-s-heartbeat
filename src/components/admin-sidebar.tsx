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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type NavItem = {
  to: "/admin" | "/admin/members" | "/admin/assessments" | "/admin/workouts" | "/admin/attendance" | "/admin/analytics";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};
const items: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/assessments", label: "Assess", icon: Activity },
  { to: "/admin/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/admin/attendance", label: "Attend", icon: CalendarCheck },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user } = useAuth();

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  const initials = (user?.email ?? "F")[0]?.toUpperCase() ?? "F";

  return (
    <aside
      className="sticky top-0 hidden h-screen w-24 shrink-0 flex-col items-center justify-between border-r border-white/40 py-6 md:flex"
      style={{
        backgroundColor: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(20px) saturate(160%)",
      }}
    >
      <Link to="/admin" className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg animate-float-gentle" style={{ backgroundImage: "linear-gradient(135deg,#4f46e2,#7c3aed)", boxShadow: "0 12px 32px -8px rgba(79,70,226,0.55)" }}>
        <Dumbbell className="h-6 w-6" />
      </Link>

      <nav className="flex flex-col items-center gap-3">
        {items.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              className={cn(
                "group relative grid h-12 w-12 place-items-center rounded-2xl transition-all duration-300",
                active
                  ? "text-white shadow-lg"
                  : "text-slate-400 hover:bg-white/60 hover:text-slate-700",
              )}
              style={active ? { backgroundImage: "linear-gradient(135deg,#4f46e2,#7c3aed)", boxShadow: "0 10px 28px -10px rgba(79,70,226,0.55)" } : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={signOut}
          title="Sign out"
          className="grid h-12 w-12 place-items-center rounded-2xl text-slate-400 transition-all hover:bg-white/60 hover:text-rose-500"
        >
          <LogOut className="h-5 w-5" />
        </button>
        <div className="rounded-full p-[2px]" style={{ backgroundImage: "linear-gradient(135deg,#4f46e2,#ec4899)" }}>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold text-slate-900">
            {initials}
          </div>
        </div>
      </div>
    </aside>
  );
}
