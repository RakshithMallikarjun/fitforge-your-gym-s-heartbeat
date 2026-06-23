import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGymContext } from "@/hooks/use-gym-context";
import { useAuth } from "@/hooks/use-auth";

/** Members visible to the current user within the active gym (RLS-scoped). */
export function useGymMembers() {
  const { activeGymId } = useGymContext();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["gym-members", activeGymId, user?.id],
    enabled: !!activeGymId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, phone, gym_id")
        .eq("gym_id", activeGymId!);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Members assigned to the current trainer. */
export function useAssignedMembers() {
  const { user } = useAuth();
  const { activeGymId } = useGymContext();

  return useQuery({
    queryKey: ["assigned-members", user?.id, activeGymId],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainer_assignments")
        .select(
          "member_id, gym_id, assigned_at, member:profiles!trainer_assignments_member_id_fkey(id, full_name, avatar_url)",
        )
        .eq("trainer_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Workout plans for the active gym (RLS-scoped per role). */
export function useGymWorkoutPlans() {
  const { activeGymId } = useGymContext();

  return useQuery({
    queryKey: ["workout-plans", activeGymId],
    enabled: !!activeGymId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_plans")
        .select("*")
        .eq("gym_id", activeGymId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
