import { useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "gym_owner" | "trainer" | "member";

export interface RoleRow {
  role: AppRole;
  gym_id: string | null;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  roleRows: RoleRow[];
  primaryGymId: string | null;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  isSuperAdmin: boolean;
  isGymOwner: boolean;
  isTrainer: boolean;
  isMember: boolean;
  isStaff: boolean;
  refresh: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleRows, setRoleRows] = useState<RoleRow[]>([]);

  const fetchRoles = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role, gym_id")
      .eq("user_id", userId);
    setRoleRows((data as RoleRow[] | null) ?? []);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        setTimeout(() => void fetchRoles(s.user.id), 0);
      } else {
        setRoleRows([]);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) void fetchRoles(data.session.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [fetchRoles]);

  const roles = roleRows.map((r) => r.role);
  const hasRole = (role: AppRole) => roles.includes(role);
  const hasAnyRole = (rs: AppRole[]) => rs.some((r) => roles.includes(r));

  const primaryGymId =
    roleRows.find((r) => r.role === "gym_owner" && r.gym_id)?.gym_id ??
    roleRows.find((r) => r.role === "trainer" && r.gym_id)?.gym_id ??
    roleRows.find((r) => r.role === "member" && r.gym_id)?.gym_id ??
    null;

  return {
    user: session?.user ?? null,
    session,
    loading,
    roles,
    roleRows,
    primaryGymId,
    hasRole,
    hasAnyRole,
    isSuperAdmin: hasRole("super_admin"),
    isGymOwner: hasRole("gym_owner"),
    isTrainer: hasRole("trainer"),
    isMember: hasRole("member"),
    isStaff: hasAnyRole(["super_admin", "gym_owner", "trainer"]),
    refresh: async () => {
      if (session?.user) await fetchRoles(session.user.id);
    },
  };
}

export function pickHome(roles: AppRole[]): string {
  if (
    roles.includes("super_admin") ||
    roles.includes("gym_owner") ||
    roles.includes("trainer")
  ) {
    return "/admin";
  }
  return "/app";
}
