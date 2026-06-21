import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/assessments")({
  component: AssessmentsPage,
});

function AssessmentsPage() {
  const { data } = useQuery({
    queryKey: ["assessments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("fitness_assessments")
        .select("id, assessment_date, weight_kg, body_fat_pct, muscle_mass_kg, member_id")
        .order("assessment_date", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  return (
    <div className="p-6 md:p-10">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Tracking</p>
          <h1 className="text-3xl font-bold tracking-tight">Fitness assessments</h1>
        </div>
        <Button><Activity className="mr-2 h-4 w-4" /> New assessment</Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
            No assessments recorded yet.
          </div>
        )}
        {data?.map((a) => (
          <div key={a.id} className="rounded-2xl border border-border/60 bg-gradient-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {a.assessment_date}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <Stat label="Weight" value={a.weight_kg ? `${a.weight_kg}kg` : "—"} />
              <Stat label="Body fat" value={a.body_fat_pct ? `${a.body_fat_pct}%` : "—"} />
              <Stat label="Muscle" value={a.muscle_mass_kg ? `${a.muscle_mass_kg}kg` : "—"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
