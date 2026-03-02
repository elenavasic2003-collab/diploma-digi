import { useAuth } from "@/hooks/useAuth";
import StudentDashboard from "./student/StudentDashboard";
import InstitutionDashboard from "./institution/InstitutionDashboard";
import BusinessDashboard from "./business/BusinessDashboard";

export default function Dashboard() {
  const { profile } = useAuth();
  if (!profile) return null;

  switch (profile.role) {
    case "student": return <StudentDashboard />;
    case "institution": return <InstitutionDashboard />;
    case "business": return <BusinessDashboard />;
    default: return <div>Nepoznata uloga</div>;
  }
}
