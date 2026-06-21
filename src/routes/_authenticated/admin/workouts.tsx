import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Dumbbell, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/workouts")({
  component: WorkoutsPage,
});

function WorkoutsPage() {
  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await supabase
        .from("workout_plans")
        .select("id, name, description, start_date, end_date, is_template, member_id")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="p-6 md:p-10">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Programming</p>
          <h1 className="text-3xl font-bold tracking-tight">Workout plans</h1>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> New plan</Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans?.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
            No workout plans yet.
          </div>
        )}
        {plans?.map((p) => (
          <div key={p.id} className="group rounded-2xl border border-border/60 bg-gradient-card p-5 transition-all hover:border-primary/40 hover:shadow-glow">
            <div className="mb-4 flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                <Dumbbell className="h-5 w-5" />
              </div>
              {p.is_template && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                  Template
                </span>
              )}
            </div>
            <h3 className="font-semibold">{p.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {p.description ?? "No description"}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {p.start_date ?? "—"} → {p.end_date ?? "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
