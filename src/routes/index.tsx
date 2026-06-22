import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  Dumbbell,
  LineChart,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useAuth, pickHome } from "@/hooks/use-auth";
import { FloatingBlobs, WaveDivider } from "@/components/floating-blobs";
import { FloatingDock } from "@/components/floating-dock";

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
  if (!loading && user) return <Navigate to={pickHome(roles)} />;

  return (
    <div className="min-h-screen bg-background text-foreground" id="top">
      <FloatingDock />

      {/* HERO */}
      <section className="relative overflow-hidden pb-32 pt-44">
        <FloatingBlobs />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.03), transparent 60%)" }} />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center animate-rise">
            <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-4 py-1.5 text-xs font-medium tracking-wide text-foreground/70 backdrop-blur">
              <span className="grid h-1.5 w-1.5 place-items-center rounded-full bg-foreground" />
              The white-label gym OS · v2026
            </div>

            <h1 className="text-display text-[clamp(64px,12vw,148px)]">
              Train smarter.
              <br />
              <span className="italic font-light tracking-tight">Run quieter.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-2xl">
              FitForge is a calm, considered platform for gym owners, trainers, and members. One admin portal, one installable mobile app, every workout in flow.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-sm font-medium text-background transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                Get started free
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-white/60 px-7 py-4 text-sm font-medium text-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/80"
              >
                Tour the platform
              </a>
            </div>
          </div>

          {/* STATS */}
          <div className="relative mx-auto mt-28 grid max-w-5xl gap-5 md:grid-cols-3">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="glass-strong shadow-floating hover-lift rounded-[32px] p-8 animate-rise"
                style={{ animationDelay: `${0.1 * i + 0.2}s` }}
              >
                <div className="text-display text-5xl md:text-6xl">{s.value}</div>
                <div className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fill="#ffffff" />

      {/* FEATURES BENTO */}
      <section id="features" className="bg-white pb-32 pt-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Built for the floor
            </div>
            <h2 className="text-display text-5xl md:text-7xl">
              Every tool a coach needs. Nothing they don't.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-[40px] border border-neutral-100 bg-white p-8 shadow-soft transition-shadow duration-300 hover:shadow-floating"
              >
                <div className="mb-6 grid h-16 w-16 place-items-center rounded-[20px] bg-secondary text-foreground transition-transform duration-300 group-hover:scale-110">
                  <f.icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{f.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider flip fill="#ffffff" />

      {/* PLATFORM SPLIT */}
      <section id="platform" className="relative overflow-hidden bg-background pb-32 pt-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-[40px] bg-foreground p-12 text-background shadow-floating">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-background/70">
                Admin Portal
              </div>
              <h3 className="text-display text-5xl md:text-6xl">For owners & trainers.</h3>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-background/70">
                Roster, assessments, periodized plans, attendance, analytics — all in one calm command center.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-3">
                {["Members", "Assessments", "Workouts", "Attendance"].map((t) => (
                  <div key={t} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div id="members" className="rounded-[40px] bg-cream-warm p-12 shadow-floating" style={{ backgroundColor: "var(--color-cream-warm)" }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-white/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
                Member PWA
              </div>
              <h3 className="text-display text-5xl md:text-6xl">For the people who show up.</h3>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                Installable on home screen, works offline. Workouts, progress, exercise videos — in flow, on the floor.
              </p>
              <div className="mt-10 flex flex-wrap gap-2">
                {["Check-in", "Workouts", "Progress", "Library", "Offline"].map((t) => (
                  <div key={t} className="rounded-full border border-foreground/15 bg-white/70 px-4 py-2 text-sm backdrop-blur">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-white pb-32 pt-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-display text-6xl md:text-8xl">
            Make your gym
            <br />
            <span className="italic font-light">feel inevitable.</span>
          </h2>
          <div className="mt-12">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-5 text-base font-medium text-background transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              Start free trial
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background">
              <Dumbbell className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium text-foreground">FitForge</span>
          </div>
          <div>© {new Date().getFullYear()} FitForge. Crafted for modern gyms.</div>
        </div>
      </footer>
    </div>
  );
}

const stats = [
  { value: "12k+", label: "Sessions tracked daily" },
  { value: "98%", label: "Member retention" },
  { value: "<200ms", label: "Median check-in" },
];

const features = [
  { icon: Users, title: "Member Management", body: "Rosters, profiles, fitness history, and trainer assignments — all in one calm place." },
  { icon: Activity, title: "Assessments & Plans", body: "Capture body composition, build periodized plans, watch members progress in real time." },
  { icon: LineChart, title: "Attendance & Analytics", body: "Real-time check-ins and dashboards showing how your gym is actually performing." },
  { icon: Smartphone, title: "Installable PWA", body: "Mobile-first member app with offline workouts and exercise videos. No app store required." },
  { icon: Dumbbell, title: "Exercise Library", body: "Curate your own library with demo videos, cues, and equipment notes." },
  { icon: Zap, title: "Truly White-label", body: "Brand it as your own — logo, colors, member experience. Built for studios that care." },
];
