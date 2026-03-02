import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Nacrt", className: "bg-muted text-muted-foreground" },
  submitted: { label: "Podneto", className: "bg-warning text-warning-foreground" },
  approved: { label: "Odobreno", className: "bg-success text-success-foreground" },
  rejected: { label: "Odbijeno", className: "bg-destructive text-destructive-foreground" },
  active: { label: "Aktivno", className: "bg-success text-success-foreground" },
  expired: { label: "Isteklo", className: "bg-muted text-muted-foreground" },
  revoked: { label: "Poništeno", className: "bg-destructive text-destructive-foreground" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return <Badge className={cn("font-medium", config.className)}>{config.label}</Badge>;
}
