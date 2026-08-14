"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export type AuthMode = "signin" | "signup";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: AuthMode;
}

export function AuthDialog({
  open,
  onOpenChange,
  initialMode = "signin",
}: AuthDialogProps) {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function switchMode(next: AuthMode) {
    setMode(next);
    setError("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mode === "signup" && name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const displayName =
      mode === "signup"
        ? name.trim()
        : email
            .split("@")[0]
            .replace(/[._-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    signIn(displayName, email.trim());
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md gap-6 border-white/10 bg-[#111111] p-7 text-white ring-1 ring-white/10 sm:p-8">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-white/55">
            {mode === "signup"
              ? "Join Pugnera to buy tickets, build a watchlist and get fight alerts."
              : "Sign in to pick up where you left off."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label
                htmlFor="auth-name"
                className="text-sm font-medium text-white/80"
              >
                Full name
              </Label>
              <Input
                id="auth-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Diaz"
                className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/35"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="auth-email"
              className="text-sm font-medium text-white/80"
            >
              Email
            </Label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/35"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="auth-password"
              className="text-sm font-medium text-white/80"
            >
              Password
            </Label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/35"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-[#e31b23]/30 bg-[#e31b23]/10 px-4 py-2.5 text-xs font-medium text-[#ff6b6b]">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="h-12 w-full rounded-full bg-[#e31b23] font-display text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#c3161d]"
          >
            {mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        <div className="space-y-4 border-t border-white/10 pt-5">
          <p className="text-sm text-white/55">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="font-semibold text-white underline-offset-4 transition hover:text-[#e31b23] hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to Pugnera?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-semibold text-white underline-offset-4 transition hover:text-[#e31b23] hover:underline"
                >
                  Create an account
                </button>
              </>
            )}
          </p>
          <p className="text-[11px] leading-4 text-white/35">
            Demo site — no real account is created.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
