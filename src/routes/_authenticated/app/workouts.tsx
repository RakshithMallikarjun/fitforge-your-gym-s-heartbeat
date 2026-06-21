import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/workouts")({
  component: MyWorkouts,
});

function MyWorkouts() {
  const { data } = useQuery({
    queryKey: ["my-plans"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      const { data } = await supabase
        .from("workout_plans")
        .select("id, name, description, start_date, end_date, workout_plan_exercises(count)")
        .eq("member_id", user.user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-md px-5 pt-10">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Programming</p>
        <h1 className="text-3xl font-bold tracking-tight">My workouts</h1>
      </header>

      {data?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          <Dumbbell className="mx-auto mb-3 h-8 w-8 opacity-40" />
          No plans assigned yet. Your trainer will build one for you.
        </div>
      )}

      <div className="space-y-3">
        {data?.map((p) => {
          const count = Array.isArray(p.workout_plan_exercises)
            ? (p.workout_plan_exercises[0]?.count ?? 0)
            : 0;
          return (
            <button
              key={p.id}
              className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-gradient-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-glow"
            >
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{count} exercises</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
