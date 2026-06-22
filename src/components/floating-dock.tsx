import { Link } from "@tanstack/react-router";
import { Dumbbell, Home, LayoutGrid, Sparkles, Users } from "lucide-react";
import type { ComponentType } from "react";

type DockItem = { icon: ComponentType<{ className?: string }>; label: string; href: string };

const items: DockItem[] = [
  { icon: Home, label: "Home", href: "#top" },
  { icon: Sparkles, label: "Features", href: "#features" },
  { icon: LayoutGrid, label: "Platform", href: "#platform" },
  { icon: Users, label: "Members", href: "#members" },
];

export function FloatingDock() {
  return (
    <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
      <div className="glass shadow-floating flex items-center gap-1 rounded-full px-2 py-2">
        <Link to="/" className="ml-2 mr-1 flex items-center gap-2 pr-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-jet text-cream" style={{ background: "#0a0a0a", color: "#fafaf8" }}>
            <Dumbbell className="h-4 w-4" />
          </div>
          <span className="hidden text-sm font-bold tracking-tight sm:block">FitForge</span>
        </Link>

        <div className="hidden items-center gap-1 px-1 md:flex">
          {items.map((it) => (
            <a
              key={it.label}
              href={it.href}
              aria-label={it.label}
              className="grid h-11 w-11 place-items-center rounded-full text-foreground/70 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:text-foreground active:scale-95"
            >
              <it.icon className="h-5 w-5" />
            </a>
          ))}
        </div>

        <Link
          to="/auth"
          className="ml-1 inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
