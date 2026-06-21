import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: attendance } = useQuery({
    queryKey: ["attendance-week"],
    queryFn: async () => {
      const start = new Date();
      start.setDate(start.getDate() - 13);
      start.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("attendance")
        .select("checked_in_at")
        .gte("checked_in_at", start.toISOString());
      const buckets: Record<string, number> = {};
      for (let i = 0; i < 14; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        buckets[d.toISOString().slice(0, 10)] = 0;
      }
      (data ?? []).forEach((r) => {
        const k = new Date(r.checked_in_at).toISOString().slice(0, 10);
        if (k in buckets) buckets[k]++;
      });
      return Object.entries(buckets).map(([date, count]) => ({
        date: date.slice(5),
        count,
      }));
    },
  });

  return (
    <div className="p-6 md:p-10">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Insights</p>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      </header>

      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <h3 className="mb-4 font-semibold">Check-ins · last 14 days</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendance ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.36 0.03 257)" />
              <XAxis dataKey="date" stroke="oklch(0.68 0.02 257)" fontSize={12} />
              <YAxis stroke="oklch(0.68 0.02 257)" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.28 0.04 257)",
                  border: "1px solid oklch(0.36 0.03 257)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="count" fill="oklch(0.71 0.18 38)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
