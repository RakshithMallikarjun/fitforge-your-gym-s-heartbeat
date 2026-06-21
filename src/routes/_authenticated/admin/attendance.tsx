import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/attendance")({
  component: AttendancePage,
});

function AttendancePage() {
  const { data } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const { data } = await supabase
        .from("attendance")
        .select("id, member_id, checked_in_at, checked_out_at")
        .order("checked_in_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  return (
    <div className="p-6 md:p-10">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Activity</p>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Member</th>
              <th className="px-5 py-3">Checked in</th>
              <th className="px-5 py-3">Checked out</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">
                  <CalendarCheck className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No check-ins yet.
                </td>
              </tr>
            ) : (
              data?.map((a) => (
                <tr key={a.id} className="border-t border-border/60">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{a.member_id.slice(0, 8)}…</td>
                  <td className="px-5 py-3">{new Date(a.checked_in_at).toLocaleString()}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {a.checked_out_at ? new Date(a.checked_out_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
