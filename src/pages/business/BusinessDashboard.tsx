import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShieldCheck, Clock } from "lucide-react";

export default function BusinessDashboard() {
  const { user } = useAuth();

  const { data: business } = useQuery({
    queryKey: ["my-business", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*").eq("owner_user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: requests } = useQuery({
    queryKey: ["business-requests-count", business?.id],
    queryFn: async () => {
      const { data } = await supabase.from("business_verification_requests").select("id, status").eq("business_id", business!.id);
      return data ?? [];
    },
    enabled: !!business,
  });

  const pending = requests?.filter((r) => r.status === "submitted").length ?? 0;
  const approved = requests?.filter((r) => r.status === "approved").length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{business?.name ?? "Kompanija"}</h1>
      <p className="text-muted-foreground mb-6">{business?.industry}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ukupno zahteva</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{requests?.length ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Na čekanju</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pending}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Odobreni uvidi</CardTitle>
            <ShieldCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{approved}</div></CardContent>
        </Card>
      </div>
    </div>
  );
}
