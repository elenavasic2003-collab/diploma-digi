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
import { format } from "date-fns";

export default function InstitutionRequests() {
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
    queryKey: ["institution-requests", institution?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verification_requests")
        .select("*, profiles!verification_requests_student_user_id_fkey(full_name, email)")
        .eq("institution_id", institution!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!institution,
  });

  const decideMutation = useMutation({
    mutationFn: async ({ id, status, studentUserId }: { id: string; status: "approved" | "rejected"; studentUserId: string }) => {
      const { error } = await supabase.from("verification_requests").update({
        status,
        decided_at: new Date().toISOString(),
        decision_reason: reason || null,
      }).eq("id", id);
      if (error) throw error;

      if (status === "approved" && institution) {
        // Create diploma
        const req = requests?.find((r) => r.id === id);
        if (req) {
          const hashStr = `${studentUserId}-${req.program_name}-${req.graduation_date}`;
          const encoder = new TextEncoder();
          const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(hashStr));
          const hash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

          const { error: dErr } = await supabase.from("diplomas").insert({
            student_user_id: studentUserId,
            institution_id: institution.id,
            request_id: id,
            program_name: req.program_name,
            degree_level: req.degree_level,
            graduation_date: req.graduation_date,
            diploma_number: `DIP-${new Date().getFullYear()}-${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}`,
            hash,
          });
          if (dErr) throw dErr;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution-requests"] });
      setSelected(null);
      setReason("");
      toast({ title: "Odluka sačuvana" });
    },
    onError: (e: Error) => toast({ title: "Greška", description: e.message, variant: "destructive" }),
  });

  if (error) return <ErrorBanner message={(error as Error).message} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Zahtevi studenata</h1>
      {isLoading ? <LoadingState /> : !requests?.length ? <EmptyState title="Nema zahteva" /> : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Nivo</TableHead>
                  <TableHead>Datum diplomiranja</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{(r.profiles as any)?.full_name ?? "—"}</TableCell>
                    <TableCell>{r.program_name}</TableCell>
                    <TableCell>{r.degree_level}</TableCell>
                    <TableCell>{r.graduation_date}</TableCell>
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
          <DialogHeader><DialogTitle>Detalji zahteva</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Student:</span> {(selected.profiles as any)?.full_name}</div>
                <div><span className="text-muted-foreground">Email:</span> {(selected.profiles as any)?.email}</div>
                <div><span className="text-muted-foreground">Program:</span> {selected.program_name}</div>
                <div><span className="text-muted-foreground">Nivo:</span> {selected.degree_level}</div>
                <div><span className="text-muted-foreground">Datum:</span> {selected.graduation_date}</div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={selected.status} /></div>
              </div>
              {selected.notes && <div className="text-sm"><span className="text-muted-foreground">Napomene:</span> {selected.notes}</div>}

              {selected.status === "submitted" && (
                <div className="space-y-3 pt-2 border-t">
                  <Textarea placeholder="Razlog odluke (opciono)" value={reason} onChange={(e) => setReason(e.target.value)} />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => decideMutation.mutate({ id: selected.id, status: "approved", studentUserId: selected.student_user_id })}
                      disabled={decideMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Odobri
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => decideMutation.mutate({ id: selected.id, status: "rejected", studentUserId: selected.student_user_id })}
                      disabled={decideMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Odbij
                    </Button>
                  </div>
                </div>
              )}

              {selected.decision_reason && (
                <div className="text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Razlog:</span> {selected.decision_reason}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
