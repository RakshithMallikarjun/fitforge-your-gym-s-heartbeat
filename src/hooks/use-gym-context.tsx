import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface Gym {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  subscription_plan: string;
  is_active: boolean;
}

interface GymContextValue {
  activeGymId: string | null;
  activeGym: Gym | null;
  availableGyms: Gym[];
  canSwitchGym: boolean;
  loading: boolean;
  setActiveGymId: (id: string | null) => void;
}

const STORAGE_KEY = "fitforge.activeGymId";

const Ctx = createContext<GymContextValue | null>(null);

export function GymProvider({ children }: { children: ReactNode }) {
  const { user, isSuperAdmin, primaryGymId, loading: authLoading } = useAuth();
  const [override, setOverride] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEY);
  });

  const { data: gyms = [], isLoading } = useQuery({
    queryKey: ["gyms-available", user?.id, isSuperAdmin],
    enabled: !!user,
    queryFn: async (): Promise<Gym[]> => {
      // RLS handles scoping: super_admin -> all, others -> their gym only
      const { data, error } = await supabase
        .from("gyms")
        .select(
          "id, name, slug, logo_url, primary_color, subscription_plan, is_active",
        )
        .order("name");
      if (error) throw error;
      return (data ?? []) as Gym[];
    },
  });

  const setActiveGymId = useCallback((id: string | null) => {
    setOverride(id);
    if (typeof window !== "undefined") {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const activeGymId = useMemo(() => {
    if (isSuperAdmin) {
      if (override && gyms.some((g) => g.id === override)) return override;
      return gyms[0]?.id ?? null;
    }
    return primaryGymId;
  }, [isSuperAdmin, override, gyms, primaryGymId]);

  const activeGym = useMemo(
    () => gyms.find((g) => g.id === activeGymId) ?? null,
    [gyms, activeGymId],
  );

  useEffect(() => {
    if (!isSuperAdmin && override) setOverride(null);
  }, [isSuperAdmin, override]);

  const value: GymContextValue = {
    activeGymId,
    activeGym,
    availableGyms: gyms,
    canSwitchGym: isSuperAdmin,
    loading: authLoading || isLoading,
    setActiveGymId,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGymContext(): GymContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGymContext must be used within <GymProvider>");
  return v;
}
