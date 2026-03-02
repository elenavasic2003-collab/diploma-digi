import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye } from "lucide-react";

export default function InstitutionBusinessRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [reason, setReason] = useState("");

  const { data: institution } = useQuery({
    queryKey: ["my-institution", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("institutions").select("*").eq("owner_user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["institution-biz-requests", institution?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_verification_requests")
        .select("*, businesses(name), profiles!business_verification_requests_student_user_id_fkey(full_name)")
        .eq("institution_id", institution!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!institution,
  });

  const decideMutation = useMutation({
    mutationFn: async ({ id, status, studentUserId }: { id: string; status: "approved" | "rejected"; studentUserId: string }) => {
      const { error } = await supabase.from("business_verification_requests").update({
        status,
        decided_at: new Date().toISOString(),
        decision_reason: reason || null,
      }).eq("id", id);
      if (error) throw error;

      if (status === "approved" && institution) {
        // Find student's active diploma at this institution
        const { data: diploma } = await supabase
          .from("diplomas")
          .select("id")
          .eq("student_user_id", studentUserId)
          .eq("institution_id", institution.id)
          .eq("status", "active")
          .limit(1)
          .single();

        if (diploma) {
          const { error: gErr } = await supabase.from("access_grants").insert({
            business_request_id: id,
            diploma_id: diploma.id,
            approved_by_institution_id: institution.id,
            expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          });
          if (gErr) throw gErr;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution-biz-requests"] });
      setSelected(null);
      setReason("");
      toast({ title: "Odluka sačuvana" });
    },
    onError: (e: Error) => toast({ title: "Greška", description: e.message, variant: "destructive" }),
  });

  if (error) return <ErrorBanner message={(error as Error).message} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Zahtevi kompanija</h1>
      {isLoading ? <LoadingState /> : !requests?.length ? <EmptyState title="Nema zahteva kompanija" /> : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kompanija</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Svrha</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{(r.businesses as any)?.name ?? "—"}</TableCell>
                    <TableCell>{(r.profiles as any)?.full_name ?? "—"}</TableCell>
                    <TableCell>{r.purpose ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={r.status ?? "submitted"} /></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(r); setReason(""); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalji zahteva kompanije</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Kompanija:</span> {(selected.businesses as any)?.name}</div>
                <div><span className="text-muted-foreground">Student:</span> {(selected.profiles as any)?.full_name}</div>
                <div><span className="text-muted-foreground">Svrha:</span> {selected.purpose ?? "—"}</div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={selected.status} /></div>
              </div>

              {selected.status === "submitted" && (
                <div className="space-y-3 pt-2 border-t">
                  <Textarea placeholder="Razlog odluke (opciono)" value={reason} onChange={(e) => setReason(e.target.value)} />
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => decideMutation.mutate({ id: selected.id, status: "approved", studentUserId: selected.student_user_id })} disabled={decideMutation.isPending}>
                      <CheckCircle className="h-4 w-4 mr-2" /> Odobri
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => decideMutation.mutate({ id: selected.id, status: "rejected", studentUserId: selected.student_user_id })} disabled={decideMutation.isPending}>
                      <XCircle className="h-4 w-4 mr-2" /> Odbij
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
