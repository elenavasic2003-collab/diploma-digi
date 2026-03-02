import { InboxIcon } from "lucide-react";

export function EmptyState({ title = "Nema podataka", description = "Trenutno nema dostupnih stavki." }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <InboxIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
