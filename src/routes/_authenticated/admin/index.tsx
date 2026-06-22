import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  CalendarCheck,
  Dumbbell,
  Flame,
  Play,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [members, plans, assessments, todayAtt] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("workout_plans").select("id", { count: "exact", head: true }),
        supabase.from("fitness_assessments").select("id", { count: "exact", head: true }),
        supabase
          .from("attendance")
          .select("id", { count: "exact", head: true })
          .gte("checked_in_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      ]);
      return {
        members: members.count ?? 0,
        plans: plans.count ?? 0,
        assessments: assessments.count ?? 0,
        todayAtt: todayAtt.count ?? 0,
      };
    },
  });

  return (
    <div className="px-6 py-8 md:px-10 md:py-10">
      {/* HEADER */}
      <header className="mb-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-display text-4xl text-slate-900 md:text-5xl">Dashboard Overview</h1>
          <p className="mt-2 text-sm text-slate-500">Welcome back — here's how your gym is moving today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search members, plans…"
              className="h-12 w-80 rounded-2xl border border-white/60 bg-white/70 pl-11 pr-4 text-sm text-slate-700 outline-none backdrop-blur-md placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <button className="grid h-12 w-12 place-items-center rounded-2xl border border-white/60 bg-white/70 text-slate-600 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:text-indigo-600">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* TOP BENTO: project tracker + 3 KPI cards */}
      <div className="grid grid-cols-12 gap-6">
        {/* Project Tracker — col-span-5 on lg */}
        <section className="widget-card widget-card-hover col-span-12 p-7 lg:col-span-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-display text-2xl text-slate-900">Active Programs</h3>
              <p className="text-xs text-slate-500">In progress this week</p>
            </div>
            <button className="text-xs font-medium text-indigo-600 hover:underline">View all</button>
          </div>
          <ul className="space-y-4">
            {programs.map((p) => (
              <li key={p.name} className="group">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: p.icon }}>
                    <p.Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                      <span className="shrink-0 text-xs font-bold tabular-nums text-slate-500">{p.pct}%</span>
                    </div>
                    <p className="text-xs text-slate-500">{p.sub}</p>
                  </div>
                </div>
                <div className="ml-13 mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/60" style={{ marginLeft: 52 }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${p.pct}%`,
                      backgroundImage: p.bar,
                      boxShadow: `0 0 16px ${p.glow}`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* KPI card 1: bar chart */}
        <section className="widget-card widget-card-hover col-span-12 p-6 md:col-span-4 lg:col-span-3">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Members</p>
          <p className="mt-1 text-display text-4xl text-slate-900">{stats?.members ?? "–"}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp className="h-3 w-3" /> +12% this week
          </p>
          <div className="mt-5 space-y-2">
            {[78, 62, 88, 45, 70].map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 text-[10px] font-medium text-slate-400">{["Mo", "Tu", "We", "Th", "Fr"][i]}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-indigo-100/50">
                  <div className="h-full rounded-full bg-indigo-600 transition-all duration-700" style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* KPI card 2: smooth line chart */}
        <section className="widget-card widget-card-hover col-span-12 overflow-hidden p-6 md:col-span-4 lg:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Check-ins</p>
          <p className="mt-1 text-display text-4xl text-slate-900">{stats?.todayAtt ?? "–"}</p>
          <p className="mt-1 text-xs font-medium text-rose-500">Today</p>
          <div className="-mx-6 mt-4 relative">
            <div className="absolute inset-0 bg-rose-400/20 blur-2xl" aria-hidden />
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="relative h-24 w-full">
              <defs>
                <linearGradient id="rose-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,30 C20,10 40,32 60,18 S80,8 100,22 L100,40 L0,40 Z" fill="url(#rose-grad)" />
              <path d="M0,30 C20,10 40,32 60,18 S80,8 100,22" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </section>

        {/* KPI card 3: circular gauge */}
        <section className="widget-card widget-card-hover col-span-12 p-6 md:col-span-4 lg:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Retention</p>
          <div className="mt-3 grid place-items-center">
            <div className="relative h-28 w-28">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#fef3c7" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="#f59e0b" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.78)}`}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-display text-2xl text-slate-900">78%</p>
                  <p className="text-[10px] text-slate-500">30-day</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EARNINGS — full width */}
        <section className="widget-card widget-card-hover col-span-12 p-7">
          <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
            <div className="grid grid-cols-2 gap-4">
              <Kpi icon={Wallet} label="Revenue" value="$24,580" delta="+18%" tint="#4f46e2" />
              <Kpi icon={Users} label="New members" value={String(stats?.members ?? "–")} delta="+12%" tint="#ec4899" />
              <Kpi icon={Dumbbell} label="Active plans" value={String(stats?.plans ?? "–")} delta="+6%" tint="#10b981" />
              <Kpi icon={Flame} label="Sessions" value="1,240" delta="+22%" tint="#f59e0b" />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-display text-2xl text-slate-900">Earning Reports</h3>
                  <p className="text-xs text-slate-500">Last 7 days</p>
                </div>
                <button className="btn-gradient px-4 py-2 text-xs font-medium">Export</button>
              </div>
              <div className="flex h-44 items-end justify-between gap-3">
                {weekDays.map((d) => {
                  const active = d.label === "Fri";
                  return (
                    <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-full transition-all duration-500"
                        style={{
                          height: `${d.h}%`,
                          maxWidth: active ? 40 : 22,
                          background: active ? "linear-gradient(180deg,#4f46e2,#7c3aed)" : "rgba(99,102,241,0.18)",
                          boxShadow: active ? "0 16px 32px -8px rgba(79,70,226,0.55)" : undefined,
                        }}
                      />
                      <span className={"text-[10px] font-medium " + (active ? "text-indigo-600" : "text-slate-400")}>{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* HERO PROMO */}
        <section className="col-span-12 overflow-hidden rounded-[2rem] shadow-xl lg:col-span-7">
          <div className="relative px-8 pt-8 pb-12 text-white" style={{ backgroundImage: "linear-gradient(120deg,#4f46e2,#6366f1 45%,#7c3aed)" }}>
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">Featured event</p>
            <h3 className="mt-2 text-display text-3xl md:text-4xl">Spring Strength Challenge</h3>
            <p className="mt-2 max-w-md text-sm text-white/80">8 weeks. 60 members. One leaderboard. Launch the program to your community in one click.</p>
            <div className="mt-6 flex items-center gap-4">
              <button className="grid h-20 w-20 place-items-center rounded-full border border-white/40 bg-white/20 backdrop-blur-md transition-transform hover:scale-105">
                <Play className="h-7 w-7 fill-white text-white" />
              </button>
              <button className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition-transform hover:-translate-y-0.5">
                Launch program
              </button>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="widget-card widget-card-hover col-span-12 p-7 lg:col-span-5">
          <h3 className="text-display text-2xl text-slate-900">Quick actions</h3>
          <p className="mt-1 text-xs text-slate-500">Common workflows for your team</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <button key={a.label} className="group flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:bg-white">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white transition-transform group-hover:scale-110" style={{ background: a.tint }}>
                  <a.Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{a.label}</p>
                  <p className="truncate text-xs text-slate-500">{a.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, delta, tint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; delta: string; tint: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-4">
      <div className="grid h-14 w-14 place-items-center rounded-2xl text-white" style={{ background: tint, boxShadow: `0 10px 24px -8px ${tint}80` }}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-display text-2xl text-slate-900">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[11px] font-medium text-emerald-600">{delta}</span>
        <svg viewBox="0 0 60 16" className="h-4 flex-1">
          <path d="M0,12 C10,4 20,14 30,6 S50,2 60,8" fill="none" stroke={tint} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

const programs = [
  { name: "HIIT Foundations", sub: "Coach Maya · 24 members", pct: 82, Icon: Flame, icon: "linear-gradient(135deg,#f97316,#ef4444)", bar: "linear-gradient(90deg,#fb923c,#f97316)", glow: "rgba(249,115,22,0.45)" },
  { name: "Powerlifting 101", sub: "Coach Jordan · 18 members", pct: 64, Icon: Dumbbell, icon: "linear-gradient(135deg,#4f46e2,#7c3aed)", bar: "linear-gradient(90deg,#6366f1,#7c3aed)", glow: "rgba(99,102,241,0.45)" },
  { name: "Mobility & Recovery", sub: "Coach Sam · 31 members", pct: 48, Icon: Activity, icon: "linear-gradient(135deg,#10b981,#059669)", bar: "linear-gradient(90deg,#34d399,#10b981)", glow: "rgba(16,185,129,0.45)" },
  { name: "Pre-natal Strength", sub: "Coach Priya · 12 members", pct: 93, Icon: Flame, icon: "linear-gradient(135deg,#ec4899,#db2777)", bar: "linear-gradient(90deg,#f472b6,#ec4899)", glow: "rgba(236,72,153,0.45)" },
];

const weekDays = [
  { label: "Mo", h: 48 }, { label: "Tu", h: 62 }, { label: "We", h: 40 },
  { label: "Th", h: 78 }, { label: "Fr", h: 96 }, { label: "Sa", h: 56 }, { label: "Su", h: 34 },
];

const quickActions = [
  { label: "Add member", sub: "Onboard a new athlete", Icon: Users, tint: "linear-gradient(135deg,#4f46e2,#7c3aed)" },
  { label: "Build plan", sub: "Create a workout program", Icon: Dumbbell, tint: "linear-gradient(135deg,#f97316,#ef4444)" },
  { label: "Record assessment", sub: "Capture body metrics", Icon: Activity, tint: "linear-gradient(135deg,#10b981,#059669)" },
  { label: "Check-in", sub: "Mark today's attendance", Icon: CalendarCheck, tint: "linear-gradient(135deg,#ec4899,#db2777)" },
];

import { Activity } from "lucide-react";
