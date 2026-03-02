import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Award, Hash, Building2 } from "lucide-react";

export default function BusinessGrants() {
  const { user } = useAuth();

  const { data: business } = useQuery({
    queryKey: ["my-business", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*").eq("owner_user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: grants, isLoading, error } = useQuery({
    queryKey: ["business-grants", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_grants")
        .select("*, diplomas(program_name, degree_level, graduation_date, diploma_number, hash, student_user_id, institutions(name)), business_verification_requests!inner(business_id)")
        .eq("business_verification_requests.business_id", business!.id)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  if (error) return <ErrorBanner message={(error as Error).message} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Odobreni uvidi u diplome</h1>
      {isLoading ? <LoadingState /> : !grants?.length ? <EmptyState title="Nema odobrenih uvida" description="Kada institucija odobri vaš zahtev, diploma će se prikazati ovde." /> : (
        <div className="grid gap-4">
          {grants.map((g) => {
            const diploma = g.diplomas as any;
            return (
              <Card key={g.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-success/10 p-3"><Award className="h-6 w-6 text-success" /></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{diploma?.program_name}</h3>
                      <p className="text-sm text-muted-foreground">{diploma?.institutions?.name} · {diploma?.degree_level}</p>
                      <p className="text-sm text-muted-foreground">Diplomiran: {diploma?.graduation_date}</p>
                      {diploma?.diploma_number && <p className="text-sm text-muted-foreground">Broj: {diploma?.diploma_number}</p>}
                      {g.expires_at && <p className="text-sm text-muted-foreground">Ističe: {new Date(g.expires_at).toLocaleDateString("sr-Latn")}</p>}
                      {diploma?.hash && (
                        <div className="mt-2 flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <code className="text-xs text-muted-foreground break-all">{diploma.hash}</code>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
