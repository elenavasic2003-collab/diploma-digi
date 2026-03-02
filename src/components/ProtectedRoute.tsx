import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "./LoadingState";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: AppRole[] }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingState text="Provera sesije..." />;
  if (!session) return <Navigate to="/login" replace />;
  if (!profile) return <LoadingState text="Učitavanje profila..." />;
  if (allowedRoles && !allowedRoles.includes(profile.role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
