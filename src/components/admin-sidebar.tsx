import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type NavItem = {
  to: "/admin" | "/admin/members" | "/admin/assessments" | "/admin/workouts" | "/admin/attendance" | "/admin/analytics";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};
const items: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
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
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white px-5 py-6 md:flex">
      <div>
        <Link to="/admin" className="flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-soft">
            <Dumbbell className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <div className="text-display text-base font-bold text-slate-900">FitForge</div>
            <div className="text-[11px] font-medium text-slate-500">Admin Portal</div>
          </div>
        </Link>

        <nav className="mt-10 flex flex-col gap-1">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Workspace
          </div>
          {items.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn("sidebar-link", active && "sidebar-link-active")}
              >
                <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[12px] font-semibold text-emerald-900">Practice Verified</div>
              <div className="text-[10px] text-emerald-700/80">All systems operational</div>
            </div>
          </div>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
