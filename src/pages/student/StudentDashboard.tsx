import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Award, Clock } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: requests } = useQuery({
    queryKey: ["student-requests-count", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("verification_requests").select("id, status").eq("student_user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: diplomas } = useQuery({
    queryKey: ["student-diplomas-count", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("diplomas").select("id").eq("student_user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const total = requests?.length ?? 0;
  const pending = requests?.filter((r) => r.status === "submitted").length ?? 0;
  const approved = requests?.filter((r) => r.status === "approved").length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dobrodošli</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ukupno zahteva</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Diplome</CardTitle>
            <Award className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{diplomas?.length ?? 0}</div></CardContent>
        </Card>
      </div>
    </div>
  );
}
