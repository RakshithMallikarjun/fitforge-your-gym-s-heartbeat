import { Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth, type AppRole } from "@/hooks/use-auth";

interface RoleGuardProps {
  roles: AppRole[];
  /** Where to send the user if they don't have any of the required roles. */
  fallback?: string;
  /** What to render in the unauthorized branch instead of redirecting. */
  unauthorized?: ReactNode;
  children: ReactNode;
}

/**
 * Client-side role gate. Pairs with the server-side RLS policies — never the
 * only line of defense, but keeps unauthorized UI from flashing.
 */
export function RoleGuard({
  roles,
  fallback = "/app",
  unauthorized,
  children,
}: RoleGuardProps) {
  const { loading, hasAnyRole } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAnyRole(roles)) {
    if (unauthorized) return <>{unauthorized}</>;
    return <Navigate to={fallback} />;
  }

  return <>{children}</>;
}
