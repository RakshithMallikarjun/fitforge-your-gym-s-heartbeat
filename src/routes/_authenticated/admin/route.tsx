import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin-sidebar";
import { RoleGuard } from "@/components/role-guard";
import { GymProvider } from "@/hooks/use-gym-context";
import { GymSwitcher } from "@/components/gym-switcher";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RoleGuard roles={["super_admin", "gym_owner", "trainer"]} fallback="/app">
      <GymProvider>
        <div className="mesh-bg flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 overflow-x-hidden">
            <div className="flex items-center justify-end gap-3 px-6 pt-6">
              <GymSwitcher />
            </div>
            <Outlet />
          </main>
        </div>
      </GymProvider>
    </RoleGuard>
  );
}
