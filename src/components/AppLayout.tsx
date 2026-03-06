import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, LayoutDashboard, FileText, Award, Building2, Search, ShieldCheck, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const studentLinks = [
  { to: "/dashboard", label: "Pregled", icon: LayoutDashboard },
  { to: "/student/requests", label: "Moji zahtevi", icon: FileText },
  { to: "/student/diplomas", label: "Moje diplome", icon: Award },
];

const institutionLinks = [
  { to: "/dashboard", label: "Pregled", icon: LayoutDashboard },
  { to: "/institution/requests", label: "Zahtevi studenata", icon: FileText },
  { to: "/institution/diplomas", label: "Izdate diplome", icon: Award },
  { to: "/institution/business-requests", label: "Zahtevi kompanija", icon: Building2 },
];

const businessLinks = [
  { to: "/dashboard", label: "Pregled", icon: LayoutDashboard },
  { to: "/business/requests", label: "Moji zahtevi", icon: Search },
  { to: "/business/grants", label: "Odobreni uvidi", icon: ShieldCheck },
];

export function AppLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isOnDashboard = location.pathname === "/dashboard";
  const links = profile?.role === "student" ? studentLinks : profile?.role === "institution" ? institutionLinks : businessLinks;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-foreground">
            <GraduationCap className="h-5 w-5 text-primary" />
            DigiDiploma
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
                  location.pathname === l.to ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{profile?.full_name}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        {!isOnDashboard && (
          <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Nazad na pregled
          </Button>
        )}
        <Outlet />
      </main>
    </div>
  );
}
