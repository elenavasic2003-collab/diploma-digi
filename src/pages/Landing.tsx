import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, ShieldCheck, Building2, ArrowRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import teamHero from "@/assets/team-hero.jpg";
import ivonaImg from "@/assets/ivona.jpg";
import elenaImg from "@/assets/elena.jpg";
import tamaraImg from "@/assets/tamara.jpg";

const teamMembers = [
  { name: "Ivona Ćitić", image: ivonaImg, initials: "IĆ" },
  { name: "Elena Vasić", image: elenaImg, initials: "EV" },
  { name: "Tamara Beatović", image: tamaraImg, initials: "TB" },
];

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

      <main className="flex-1">
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

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
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

          {/* Hero image */}
          <div className="max-w-4xl mx-auto mb-16">
            <img
              src={teamHero}
              alt="Digitalna verifikacija diploma ilustracija"
              className="w-full rounded-xl shadow-lg object-cover max-h-80"
            />
          </div>

          {/* Team section */}
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Naš tim</h2>
            <p className="text-muted-foreground mb-10">Upoznajte ljude iza DigiDiploma Verify platforme.</p>
            <div className="flex justify-center gap-12 flex-wrap">
              {teamMembers.map((member) => (
                <div key={member.name} className="flex flex-col items-center gap-3">
                  <Avatar className="h-24 w-24 border-2 border-primary/20">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback className="text-lg font-semibold">{member.initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
