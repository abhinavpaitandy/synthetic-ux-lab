import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ next: safeNext(s["next"]) }),
  head: () => ({
    meta: [
      { title: "Sign in — Synthetic UX Lab" },
      {
        name: "description",
        content:
          "Sign in to Synthetic UX Lab to run and review synthetic UX pre-testing experiments.",
      },
      { property: "og:title", content: "Sign in — Synthetic UX Lab" },
      {
        property: "og:description",
        content: "Access your synthetic UX pre-testing workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const next = Route.useSearch()['next'];
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const returnUrl = new URL(next, window.location.origin).toString();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: returnUrl },
      });
      setBusy(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) window.location.href = returnUrl;
      else setNotice("Check your inbox to confirm your email, then sign in.");
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    if (next.startsWith("/.lovable/")) window.location.href = returnUrl;
    else navigate({ to: next });
  }

  async function onGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: returnUrl });
    if (result.error) {
      setError(result.error.message ?? "Google sign-in failed.");
      return;
    }
    if (result.redirected) return;
    window.location.href = returnUrl;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Synthetic UX Lab
        </p>
        <h1 className="mt-2 text-xl font-semibold text-foreground">
          {mode === "signin" ? "Sign in" : "Create an account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Internal workspace for synthetic UX pre-testing.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        <Button variant="outline" className="mt-3 w-full" onClick={onGoogle} disabled={busy}>
          Continue with Google
        </Button>

        <button
          type="button"
          className="mt-4 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
