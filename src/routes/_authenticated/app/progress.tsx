import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const { data } = useQuery({
    queryKey: ["my-assessments"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      const { data } = await supabase
        .from("fitness_assessments")
        .select("assessment_date, weight_kg, body_fat_pct")
        .eq("member_id", user.user.id)
        .order("assessment_date");
      return (data ?? []).map((r) => ({
        date: r.assessment_date?.slice(5) ?? "",
        weight: r.weight_kg ? Number(r.weight_kg) : null,
        bodyFat: r.body_fat_pct ? Number(r.body_fat_pct) : null,
      }));
    },
  });

  return (
    <div className="mx-auto max-w-md px-5 pt-10">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Tracking</p>
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
      </header>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Weight over time</h3>
        {data?.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Your trainer hasn't recorded an assessment yet.
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.36 0.03 257)" />
                <XAxis dataKey="date" stroke="oklch(0.68 0.02 257)" fontSize={11} />
                <YAxis stroke="oklch(0.68 0.02 257)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.28 0.04 257)",
                    border: "1px solid oklch(0.36 0.03 257)",
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="oklch(0.71 0.18 38)"
                  strokeWidth={2.5}
                  dot={{ fill: "oklch(0.71 0.18 38)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
