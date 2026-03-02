import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Award, Building2 } from "lucide-react";

export default function InstitutionDashboard() {
  const { user } = useAuth();

  const { data: institution } = useQuery({
    queryKey: ["my-institution", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("institutions").select("*").eq("owner_user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: requests } = useQuery({
    queryKey: ["institution-requests-count", institution?.id],
    queryFn: async () => {
      const { data } = await supabase.from("verification_requests").select("id, status").eq("institution_id", institution!.id);
      return data ?? [];
    },
    enabled: !!institution,
  });

  const { data: bizRequests } = useQuery({
    queryKey: ["institution-biz-requests-count", institution?.id],
    queryFn: async () => {
      const { data } = await supabase.from("business_verification_requests").select("id, status").eq("institution_id", institution!.id);
      return data ?? [];
    },
    enabled: !!institution,
  });

  const pending = requests?.filter((r) => r.status === "submitted").length ?? 0;
  const bizPending = bizRequests?.filter((r) => r.status === "submitted").length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{institution?.name ?? "Institucija"}</h1>
      <p className="text-muted-foreground mb-6">{institution?.city}, {institution?.country}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Zahtevi na čekanju</CardTitle>
            <FileText className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pending}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Izdate diplome</CardTitle>
            <Award className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{requests?.filter((r) => r.status === "approved").length ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Zahtevi kompanija</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{bizPending}</div></CardContent>
        </Card>
      </div>
    </div>
  );
}
