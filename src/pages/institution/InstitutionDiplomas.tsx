import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Award, Hash } from "lucide-react";

export default function InstitutionDiplomas() {
  const { user } = useAuth();

  const { data: institution } = useQuery({
    queryKey: ["my-institution", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("institutions").select("*").eq("owner_user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: diplomas, isLoading, error } = useQuery({
    queryKey: ["institution-diplomas", institution?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diplomas")
        .select("*, profiles!diplomas_student_user_id_fkey(full_name)")
        .eq("institution_id", institution!.id)
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!institution,
  });

  if (error) return <ErrorBanner message={(error as Error).message} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Izdate diplome</h1>
      {isLoading ? <LoadingState /> : !diplomas?.length ? <EmptyState title="Nema diploma" /> : (
        <div className="grid gap-4">
          {diplomas.map((d) => (
            <Card key={d.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3"><Award className="h-6 w-6 text-primary" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{(d.profiles as any)?.full_name} — {d.program_name}</h3>
                      <StatusBadge status={d.status ?? "active"} />
                    </div>
                    <p className="text-sm text-muted-foreground">{d.degree_level} · Diplomiran: {d.graduation_date}</p>
                    {d.diploma_number && <p className="text-sm text-muted-foreground">Broj: {d.diploma_number}</p>}
                    {d.hash && (
                      <div className="mt-2 flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <code className="text-xs text-muted-foreground break-all">{d.hash}</code>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
