import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarCheck, Dumbbell, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [members, plans, assessments, todayAtt] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("workout_plans").select("id", { count: "exact", head: true }),
        supabase.from("fitness_assessments").select("id", { count: "exact", head: true }),
        supabase
          .from("attendance")
          .select("id", { count: "exact", head: true })
          .gte("checked_in_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      ]);
      return {
        members: members.count ?? 0,
        plans: plans.count ?? 0,
        assessments: assessments.count ?? 0,
        todayAtt: todayAtt.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Members", value: stats?.members ?? "–", icon: Users, color: "text-primary" },
    { label: "Active plans", value: stats?.plans ?? "–", icon: Dumbbell, color: "text-accent" },
    { label: "Assessments", value: stats?.assessments ?? "–", icon: Activity, color: "text-success" },
    { label: "Today's check-ins", value: stats?.todayAtt ?? "–", icon: CalendarCheck, color: "text-chart-4" },
  ];

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Overview</p>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">A snapshot of your gym today.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elevated"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums">{c.value}</p>
              </div>
              <div className={`grid h-10 w-10 place-items-center rounded-lg bg-card/60 ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border/60 bg-card p-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Welcome to FitForge</h3>
            <p className="text-sm text-muted-foreground">
              Start by adding members, building workout plans, and recording fitness assessments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
