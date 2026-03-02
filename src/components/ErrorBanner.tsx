import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ErrorBanner({ message = "Došlo je do greške." }: { message?: string }) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Greška</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
