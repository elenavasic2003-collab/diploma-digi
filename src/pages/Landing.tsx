import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, ShieldCheck, Building2, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <GraduationCap className="h-5 w-5 text-primary" />
            DigiDiploma Verify
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild><Link to="/login">Prijava</Link></Button>
            <Button asChild><Link to="/register">Registracija</Link></Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="container py-20">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Digitalna verifikacija diploma
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Sigurna platforma za skladištenje, verifikaciju i deljenje akademskih diploma između studenata, institucija i kompanija.
            </p>
            <Button size="lg" asChild>
              <Link to="/register">Započnite <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: GraduationCap, title: "Studenti", desc: "Podnesite zahtev za verifikaciju i pristupite svojoj digitalnoj diplomi." },
              { icon: ShieldCheck, title: "Institucije", desc: "Pregledajte zahteve, izdajte verifikovane diplome i kontrolišite pristup." },
              { icon: Building2, title: "Kompanije", desc: "Zatražite proveru diploma kandidata uz odobrenje institucije." },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border bg-card p-6 text-center">
                <item.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
