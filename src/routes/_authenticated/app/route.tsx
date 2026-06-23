import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MemberBottomNav } from "@/components/member-bottom-nav";
import { RoleGuard } from "@/components/role-guard";
import { GymProvider } from "@/hooks/use-gym-context";

export const Route = createFileRoute("/_authenticated/app")({
  component: MemberLayout,
});

function MemberLayout() {
  return (
    <RoleGuard roles={["member", "trainer", "gym_owner", "super_admin"]}>
      <GymProvider>
        <div className="min-h-screen bg-background pb-24">
          <Outlet />
          <MemberBottomNav />
        </div>
      </GymProvider>
    </RoleGuard>
  );
}
