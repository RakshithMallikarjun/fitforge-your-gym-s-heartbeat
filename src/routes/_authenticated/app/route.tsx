import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MemberBottomNav } from "@/components/member-bottom-nav";

export const Route = createFileRoute("/_authenticated/app")({
  component: MemberLayout,
});

function MemberLayout() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Outlet />
      <MemberBottomNav />
    </div>
  );
}
