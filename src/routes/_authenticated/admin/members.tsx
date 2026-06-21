import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/admin/members")({
  component: MembersPage,
});

function MembersPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["members", q],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, full_name, avatar_url, phone, weight_kg, height_cm, goals, gym_id, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (q) query = query.ilike("full_name", `%${q}%`);
      const { data } = await query;
      return data ?? [];
    },
  });

  return (
    <div className="p-6 md:p-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">People</p>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Invite member
        </Button>
      </header>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search members…"
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Member</th>
              <th className="px-5 py-3">Goals</th>
              <th className="px-5 py-3">Weight</th>
              <th className="px-5 py-3">Phone</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                  No members yet.
                </td>
              </tr>
            ) : (
              data?.map((m) => (
                <tr key={m.id} className="border-t border-border/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={m.avatar_url ?? undefined} />
                        <AvatarFallback>{(m.full_name ?? "M")[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{m.full_name ?? "Unnamed"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{m.goals ?? "—"}</td>
                  <td className="px-5 py-3 tabular-nums">{m.weight_kg ? `${m.weight_kg} kg` : "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.phone ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
