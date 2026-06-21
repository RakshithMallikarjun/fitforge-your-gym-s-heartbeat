import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Activity, Dumbbell, LineChart, Smartphone, Users, Zap } from "lucide-react";
import { useAuth, pickHome } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitForge — White-label Gym Management Platform" },
      { name: "description", content: "Run your gym, train your members. FitForge combines an admin portal for owners and trainers with a beautiful member PWA." },
      { property: "og:title", content: "FitForge" },
      { property: "og:description", content: "White-label gym management & member experience platform." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, roles, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to={pickHome(roles)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">FitForge</span>
        </div>
        <Button asChild variant="default" size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-12 md:px-12 md:pt-24">
        <section className="text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Zap className="h-3 w-3 text-primary" /> White-label gym OS
          </div>
          <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight md:text-7xl">
            Forge stronger members,
            <span className="bg-gradient-energy bg-clip-text text-transparent"> run a smarter gym.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Manage members, assessments, workouts, and attendance. Members get a beautiful installable app to train, track, and watch exercise videos — online or off.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#features">See features</a>
            </Button>
          </div>
        </section>

        <section id="features" className="mt-24 grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elevated"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <footer className="mt-32 border-t border-border/50 py-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} FitForge. Built for modern gyms.
        </footer>
      </main>
    </div>
  );
}

const features = [
  {
    icon: Users,
    title: "Member Management",
    body: "Roster, profiles, fitness history and trainer assignments — all in one place.",
  },
  {
    icon: Activity,
    title: "Assessments & Plans",
    body: "Capture body composition, build periodized plans, and watch members progress.",
  },
  {
    icon: LineChart,
    title: "Attendance & Analytics",
    body: "Real-time check-ins and dashboards that show how your gym is performing.",
  },
  {
    icon: Smartphone,
    title: "Member PWA",
    body: "Installable, mobile-first app with offline workouts and exercise videos.",
  },
  {
    icon: Dumbbell,
    title: "Exercise Library",
    body: "Curate your own library of exercises with demo videos and equipment notes.",
  },
  {
    icon: Zap,
    title: "Built for white-label",
    body: "Brand it as your own — logo, colors, and member experience.",
  },
];
