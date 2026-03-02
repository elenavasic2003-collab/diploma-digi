import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export default function BusinessRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_email: "", institution_id: "", purpose: "" });

  const { data: business } = useQuery({
    queryKey: ["my-business", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*").eq("owner_user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["business-requests", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_verification_requests")
        .select("*, institutions(name), profiles!business_verification_requests_student_user_id_fkey(full_name, email)")
        .eq("business_id", business!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const { data: institutions } = useQuery({
    queryKey: ["institutions-list"],
    queryFn: async () => {
      const { data } = await supabase.from("institutions").select("id, name");
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      // Look up student by email using an edge function or RPC
      // For now we'll use a workaround: find the profile id
      // Since businesses can't read profiles, we use a simple approach
      const { data: fn, error: fnErr } = await supabase.rpc("get_user_role", { _user_id: "00000000-0000-0000-0000-000000000000" });
      
      // We need to find the student_user_id from email
      // Let's create the request directly - the student_user_id needs to be known
      // For the MVP, we'll search by the student email in a different way
      throw new Error("Potrebno je uneti ID studenta. Kontaktirajte studenta za njihov ID.");
    },
    onError: (e: Error) => toast({ title: "Info", description: e.message, variant: "destructive" }),
  });

  // Simplified: create with student_user_id directly
  const [studentId, setStudentId] = useState("");

  const createDirectMutation = useMutation({
    mutationFn: async () => {
      if (!business) throw new Error("Nema poslovnog naloga");
      const { error } = await supabase.from("business_verification_requests").insert({
        business_id: business.id,
        student_user_id: studentId,
        institution_id: form.institution_id,
        purpose: form.purpose || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-requests"] });
      setOpen(false);
      setForm({ student_email: "", institution_id: "", purpose: "" });
      setStudentId("");
      toast({ title: "Zahtev kreiran" });
    },
    onError: (e: Error) => toast({ title: "Greška", description: e.message, variant: "destructive" }),
  });

  if (error) return <ErrorBanner message={(error as Error).message} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Moji zahtevi za proveru</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novi zahtev</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novi zahtev za proveru diplome</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createDirectMutation.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>ID studenta (UUID)</Label>
                <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="UUID korisnika studenta" required />
              </div>
              <div className="space-y-2">
                <Label>Institucija</Label>
                <Select value={form.institution_id} onValueChange={(v) => setForm({ ...form, institution_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Izaberite instituciju" /></SelectTrigger>
                  <SelectContent>
                    {institutions?.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Svrha provere</Label>
                <Textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Npr. provera za zaposlenje" />
              </div>
              <Button type="submit" className="w-full" disabled={createDirectMutation.isPending}>
                {createDirectMutation.isPending ? "Slanje..." : "Podnesi zahtev"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <LoadingState /> : !requests?.length ? <EmptyState title="Nema zahteva" description="Kreirajte prvi zahtev za proveru diplome." /> : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Institucija</TableHead>
                  <TableHead>Svrha</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Podneto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{(r.profiles as any)?.full_name ?? "—"}</TableCell>
                    <TableCell>{(r.institutions as any)?.name ?? "—"}</TableCell>
                    <TableCell>{r.purpose ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={r.status ?? "submitted"} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.submitted_at ? format(new Date(r.submitted_at), "dd.MM.yyyy") : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
