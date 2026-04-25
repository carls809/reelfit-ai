"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getAuthRedirectUrl, hasSupabaseClientEnv, isGoogleAuthEnabled } from "@/lib/app-env";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const authReady = hasSupabaseClientEnv();
  const showGoogleAuth = authReady && isGoogleAuthEnabled();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authFeedback, setAuthFeedback] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setAuthFeedback(null);
    }
  }, [open]);

  async function handleEmailAuth(targetMode: "signin" | "signup") {
    if (!supabase) {
      const message = "Add Supabase env vars to enable sign-in.";
      setAuthFeedback({ tone: "error", text: message });
      toast.error(message);
      return;
    }

    setLoading(true);
    setAuthFeedback(null);

    try {
      if (targetMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in. Your history will sync automatically.");
        onOpenChange(false);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getAuthRedirectUrl()
          }
        });
        if (error) throw error;

        if (data.session) {
          toast.success("Account created. You’re signed in and ready to generate.");
          onOpenChange(false);
        } else {
          setAuthFeedback({
            tone: "success",
            text: "Account created. Check your inbox to confirm your email, then sign in to continue."
          });
          setMode("signin");
          setPassword("");
          toast.success("Account created. Check your inbox to confirm your email.");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      setAuthFeedback({ tone: "error", text: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    if (!supabase) {
      const message = "Add Supabase env vars to enable Google sign-in.";
      setAuthFeedback({ tone: "error", text: message });
      toast.error(message);
      return;
    }

    setLoading(true);
    setAuthFeedback(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthRedirectUrl()
        }
      });

      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign-in failed.";
      setAuthFeedback({ tone: "error", text: message });
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-balance">Unlock saved history, favorites, and billing</DialogTitle>
          <DialogDescription>
            {showGoogleAuth
              ? "Sign in with email or Google to sync generations in Supabase and manage your ReelFit AI plan."
            : "Sign in with email to sync generations in Supabase and manage your ReelFit AI plan."}
          </DialogDescription>
        </DialogHeader>

        {!authReady ? (
          <div className="rounded-[1.25rem] border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable sign-in.
          </div>
        ) : null}

        {authFeedback ? (
          <div
            className={cn(
              "rounded-[1.25rem] border px-4 py-3 text-sm",
              authFeedback.tone === "error"
                ? "border-destructive/25 bg-destructive/5 text-destructive"
                : "border-primary/20 bg-primary/10 text-primary dark:bg-primary/15"
            )}
          >
            {authFeedback.text}
          </div>
        ) : null}

        {showGoogleAuth ? (
          <Button
            variant="outline"
            className="h-12 justify-start gap-3 rounded-2xl"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
            Continue with Google
          </Button>
        ) : null}

        <Tabs
          value={mode}
          onValueChange={(value) => {
            setMode(value as "signin" | "signup");
            setAuthFeedback(null);
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="signin-email">
                Email
              </label>
              <Input
                id="signin-email"
                type="email"
                autoComplete="email"
                placeholder="coach@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="signin-password">
                Password
              </label>
              <Input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button className="w-full h-12 rounded-2xl" onClick={() => handleEmailAuth("signin")} disabled={!authReady || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Sign in to ReelFit AI
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="signup-email">
                Email
              </label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="coach@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="signup-password">
                Password
              </label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a secure password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button className="w-full h-12 rounded-2xl" onClick={() => handleEmailAuth("signup")} disabled={!authReady || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Create free account
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
