import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, Dumbbell, Heart, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/")({
  component: MemberHome,
});

function MemberHome() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, gym_id, weight_kg, goals")
        .eq("id", user.user.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: todayCheckin } = useQuery({
    queryKey: ["today-checkin"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("attendance")
        .select("id, checked_in_at")
        .eq("member_id", user.user.id)
        .gte("checked_in_at", start.toISOString())
        .order("checked_in_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const checkIn = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || !profile?.gym_id) throw new Error("No gym assigned. Ask your gym admin to assign you.");
      const { error } = await supabase.from("attendance").insert({
        member_id: user.user.id,
        gym_id: profile.gym_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Checked in. Let's go.");
      qc.invalidateQueries({ queryKey: ["today-checkin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-md px-5 pt-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Welcome back</p>
        <h1 className="text-3xl font-bold tracking-tight">
          {profile?.full_name?.split(" ")[0] ?? "Athlete"} 👋
        </h1>
      </header>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-energy p-6 shadow-elevated">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <p className="text-xs uppercase tracking-wider text-white/80">Today</p>
        <p className="mt-1 text-2xl font-bold text-white">
          {todayCheckin ? "You're in 💪" : "Ready to train?"}
        </p>
        <p className="mt-2 text-sm text-white/85">
          {profile?.goals ?? "Set goals with your trainer to personalize your sessions."}
        </p>
        {todayCheckin ? (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur">
            <CheckCircle2 className="h-4 w-4" /> Checked in at{" "}
            {new Date(todayCheckin.checked_in_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        ) : (
          <Button
            className="mt-5 bg-white text-foreground hover:bg-white/90"
            onClick={() => checkIn.mutate()}
            disabled={checkIn.isPending}
          >
            <Flame className="mr-2 h-4 w-4" /> Check in
          </Button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Tile icon={Dumbbell} label="Workouts" value="0" />
        <Tile icon={Zap} label="Streak" value="0" />
        <Tile icon={Heart} label="Weight" value={profile?.weight_kg ? `${profile.weight_kg}kg` : "—"} />
      </div>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
