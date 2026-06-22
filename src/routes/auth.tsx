import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Dumbbell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth, pickHome } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingBlobs } from "@/components/floating-blobs";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — FitForge" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={pickHome(roles)} />;

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Account created. Welcome to FitForge.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
      }
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setBusy(false);
      return;
    }
    if (!result.redirected) navigate({ to: "/" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <FloatingBlobs />

      <Link
        to="/"
        className="glass absolute left-6 top-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground shadow-floating transition-transform hover:-translate-y-0.5"
      >
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>

      <div className="relative w-full max-w-md animate-rise">
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-foreground text-background shadow-floating">
            <Dumbbell className="h-6 w-6" />
          </div>
          <h1 className="text-display text-5xl">FitForge</h1>
          <p className="mt-2 text-sm text-muted-foreground">Train. Track. Transform.</p>
        </div>

        <div className="glass-strong shadow-floating rounded-[32px] p-8">
          <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <TabsList className="mb-6 grid w-full grid-cols-2 rounded-full bg-secondary p-1">
              <TabsTrigger value="signin" className="rounded-full">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">Sign up</TabsTrigger>
            </TabsList>

            <Button
              type="button" variant="outline"
              className="w-full rounded-full border-foreground/15 bg-white/70 py-6 font-medium backdrop-blur hover:bg-white"
              onClick={handleGoogle} disabled={busy}
            >
              <GoogleIcon /> Continue with Google
            </Button>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-4" onSubmit={handleEmail}>
              <TabsContent value="signup" className="m-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Carter" required={mode === "signup"} className="rounded-2xl border-foreground/15 bg-white/60 py-6" />
                </div>
              </TabsContent>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="rounded-2xl border-foreground/15 bg-white/60 py-6" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="rounded-2xl border-foreground/15 bg-white/60 py-6" />
              </div>
              <Button type="submit" className="w-full rounded-full bg-foreground py-6 text-base font-medium text-background hover:bg-foreground/90" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "signup" ? "Create account" : "Sign in"}
              </Button>
            </form>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New accounts start as members. Gym admins can promote roles.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
