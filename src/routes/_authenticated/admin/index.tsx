import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Dumbbell,
  HeartPulse,
  LifeBuoy,
  TrendingUp,
  Users,
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
    <div className="px-8 py-8">
      {/* STATS GRID */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Primary dark card */}
        <div className="med-card-dark hover-lift p-6">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/5" />
          <div className="absolute right-10 top-10 h-16 w-16 rounded-full border border-white/10" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100/80">
            Monthly Revenue
          </p>
          <p className="mt-3 text-display text-[28px] font-bold tabular-nums">$48,290</p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
            <TrendingUp className="h-3 w-3" /> +18.2% vs last month
          </div>
        </div>

        <StatCard label="Active Members" value={stats?.members ?? 0} trend="+12% this week" trendUp />
        <StatCard label="Workout Plans" value={stats?.plans ?? 0} trend={`${stats?.assessments ?? 0} assessments`} />
        <StatCard label="Today's Check-ins" value={stats?.todayAtt ?? 0} trend="Live · updating" />
      </section>

      {/* MAIN GRID: 70/30 */}
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-10">
        {/* Engagement Requests + Payments — 70% */}
        <div className="space-y-6 lg:col-span-7">
          {/* Engagement Requests */}
          <div className="med-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-display text-[18px] font-bold text-slate-900">Engagement Requests</h2>
                <p className="text-[12px] text-slate-500">New onboarding & trainer requests</p>
              </div>
              <button className="text-[12px] font-semibold text-emerald-600 hover:underline">View all</button>
            </div>
            <ul className="space-y-4">
              {requests.map((r) => (
                <li key={r.name} className="med-card med-card-hover flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-slate-100 text-base font-bold text-slate-700">
                      {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-slate-900">{r.name}</p>
                        <span className={r.tag === "New Patient" ? "badge-sky" : "badge-emerald"}>{r.tag}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-slate-500">{r.detail}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-ghost-slate text-[13px]">Decline</button>
                    <button className="btn-emerald text-[13px]">Approve</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment History */}
          <div className="med-card overflow-hidden p-0">
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h2 className="text-display text-[18px] font-bold text-slate-900">Payment History</h2>
                <p className="text-[12px] text-slate-500">Latest disbursements</p>
              </div>
              <button className="text-[12px] font-semibold text-emerald-600 hover:underline">Export CSV</button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-slate-700">
                {payments.map((p, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                    <td className="px-6 py-4 text-slate-500">{p.date}</td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums">{p.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={p.status === "Disbursed" ? "badge-emerald" : "badge-sky"}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side widgets — 30% */}
        <div className="space-y-6 lg:col-span-3">
          {/* Schedule */}
          <div className="med-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-display text-[18px] font-bold text-slate-900">Schedule</h2>
                <p className="text-[12px] text-slate-500">Today, {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
              </div>
              <CalendarCheck className="h-4 w-4 text-slate-400" />
            </div>
            <ul className="space-y-5">
              {schedule.map((s) => (
                <li key={s.time + s.title} className="relative pl-6">
                  <span
                    className="absolute left-0 top-1 h-[calc(100%-4px)] w-[2px] rounded-full"
                    style={{ background: s.kind === "appointment" ? "#10b981" : s.kind === "review" ? "#0ea5e9" : "#cbd5e1" }}
                  />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.time}</p>
                  <p className="mt-1 text-[14px] font-bold text-slate-900">{s.title}</p>
                  <p className="text-[12px] text-slate-500">{s.sub}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Support CTA */}
          <div className="relative overflow-hidden rounded-[32px] bg-sky-900 p-6 text-white">
            <LifeBuoy className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5" strokeWidth={1.5} />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-200">24/7 Support</p>
              <h3 className="text-display mt-2 text-[20px] font-bold leading-tight">Need help running your gym?</h3>
              <p className="mt-2 text-[13px] text-sky-100/80">Talk to a FitForge specialist — onboarding, integrations, and growth playbooks.</p>
              <button className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-sky-900 transition hover:-translate-y-0.5">
                Contact support <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Mini activity */}
          <div className="med-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-emerald-600" />
              <h3 className="text-display text-[15px] font-bold text-slate-900">Member Pulse</h3>
            </div>
            <div className="space-y-3 text-[13px]">
              <PulseRow icon={CheckCircle2} text="42 workouts completed today" tone="emerald" />
              <PulseRow icon={Users} text="3 new sign-ups" tone="sky" />
              <PulseRow icon={Activity} text="12 assessments scheduled" tone="emerald" />
              <PulseRow icon={Dumbbell} text="8 plans updated" tone="slate" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, trend, trendUp }: { label: string; value: number | string; trend: string; trendUp?: boolean }) {
  return (
    <div className="med-card med-card-hover p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-3 text-display text-[28px] font-bold tabular-nums text-slate-900">{value}</p>
      <div className={"mt-3 inline-flex items-center gap-1 text-[12px] font-semibold " + (trendUp ? "text-emerald-600" : "text-slate-500")}>
        {trendUp && <TrendingUp className="h-3.5 w-3.5" />}
        {trend}
      </div>
    </div>
  );
}

function PulseRow({ icon: Icon, text, tone }: { icon: React.ComponentType<{ className?: string }>; text: string; tone: "emerald" | "sky" | "slate" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
    slate: "bg-slate-100 text-slate-500",
  } as const;
  return (
    <div className="flex items-center gap-3">
      <div className={"grid h-8 w-8 place-items-center rounded-full " + tones[tone]}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-slate-700">{text}</span>
    </div>
  );
}

const requests = [
  { name: "Maya Thompson", tag: "New Patient", detail: "Requested onboarding — Personal Training" },
  { name: "Jordan Lee", tag: "Returning", detail: "Plan renewal · Powerlifting" },
  { name: "Priya Shah", tag: "New Patient", detail: "Assessment booked for Friday 9:00 AM" },
];

const payments = [
  { name: "Alex Carter", date: "Mar 18, 2026", amount: "$129.00", status: "Disbursed" },
  { name: "Sam Rivera", date: "Mar 17, 2026", amount: "$249.00", status: "Disbursed" },
  { name: "Nia Okafor", date: "Mar 17, 2026", amount: "$59.00", status: "Pending" },
  { name: "Leo Park", date: "Mar 16, 2026", amount: "$199.00", status: "Disbursed" },
];

const schedule = [
  { time: "09:00 AM", title: "HIIT Group Class", sub: "Studio A · Coach Maya", kind: "appointment" as const },
  { time: "11:30 AM", title: "Quarterly Review", sub: "Operations · Boardroom", kind: "review" as const },
  { time: "02:00 PM", title: "Open block", sub: "No sessions scheduled", kind: "empty" as const },
  { time: "05:30 PM", title: "Strength 101", sub: "Floor 2 · Coach Jordan", kind: "appointment" as const },
];
