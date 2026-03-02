import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export default function StudentRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ institution_id: "", program_name: "", degree_level: "Osnovne studije", graduation_date: "", notes: "" });

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["student-requests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verification_requests")
        .select("*, institutions(name)")
        .eq("student_user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
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
      const { error } = await supabase.from("verification_requests").insert({
        student_user_id: user!.id,
        institution_id: form.institution_id,
        program_name: form.program_name,
        degree_level: form.degree_level,
        graduation_date: form.graduation_date,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-requests"] });
      setOpen(false);
      setForm({ institution_id: "", program_name: "", degree_level: "Osnovne studije", graduation_date: "", notes: "" });
      toast({ title: "Zahtev kreiran", description: "Vaš zahtev je uspešno podnet." });
    },
    onError: (e: Error) => toast({ title: "Greška", description: e.message, variant: "destructive" }),
  });

  if (error) return <ErrorBanner message={(error as Error).message} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Moji zahtevi</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novi zahtev</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novi zahtev za verifikaciju</DialogTitle></DialogHeader>
            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
              className="space-y-4"
            >
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
                <Label>Program</Label>
                <Input value={form.program_name} onChange={(e) => setForm({ ...form, program_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Nivo studija</Label>
                <Select value={form.degree_level} onValueChange={(v) => setForm({ ...form, degree_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Osnovne studije">Osnovne studije</SelectItem>
                    <SelectItem value="Master studije">Master studije</SelectItem>
                    <SelectItem value="Doktorske studije">Doktorske studije</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Datum diplomiranja</Label>
                <Input type="date" value={form.graduation_date} onChange={(e) => setForm({ ...form, graduation_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Napomene (opciono)</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Slanje..." : "Podnesi zahtev"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <LoadingState /> : !requests?.length ? <EmptyState title="Nema zahteva" description="Kreirajte prvi zahtev za verifikaciju diplome." /> : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institucija</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Nivo</TableHead>
                  <TableHead>Datum diplomiranja</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Podneto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{(r.institutions as any)?.name ?? "—"}</TableCell>
                    <TableCell>{r.program_name}</TableCell>
                    <TableCell>{r.degree_level}</TableCell>
                    <TableCell>{r.graduation_date}</TableCell>
                    <TableCell><StatusBadge status={r.status ?? "submitted"} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{r.submitted_at ? format(new Date(r.submitted_at), "dd.MM.yyyy") : "—"}</TableCell>
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
