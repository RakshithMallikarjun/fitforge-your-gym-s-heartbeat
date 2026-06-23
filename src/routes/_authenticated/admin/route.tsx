import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { RoleGuard } from "@/components/role-guard";
import { GymProvider } from "@/hooks/use-gym-context";
import { GymSwitcher } from "@/components/gym-switcher";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RoleGuard roles={["super_admin", "gym_owner", "trainer"]} fallback="/app">
      <GymProvider>
        <div className="flex min-h-screen bg-slate-50">
          <AdminSidebar />
          <main className="flex-1 overflow-x-hidden">
            <StickyHeader />
            <div className="mx-auto w-full max-w-[1280px]">
              <Outlet />
            </div>
          </main>
        </div>
      </GymProvider>
    </RoleGuard>
  );
}

function StickyHeader() {
  const { user } = useAuth();
  const initial = (user?.email ?? "F")[0]?.toUpperCase() ?? "F";
  return (
    <header className="glass-header sticky top-0 z-40 flex h-[72px] items-center justify-between px-8">
      <div>
        <h1 className="text-display text-[18px] font-bold text-slate-900">FitForge Admin</h1>
        <p className="text-[12px] text-slate-500">Operations, members, and performance — at a glance.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search members, plans…"
            className="h-10 w-72 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
          />
        </div>
        <div className="hidden md:block"><GymSwitcher /></div>
        <button className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-slate-900">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-sm font-bold text-white">
          {initial}
        </div>
      </div>
    </header>
  );
}
