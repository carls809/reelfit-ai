"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CopyCheck,
  CreditCard,
  Loader2,
  LogOut,
  Sparkles,
  WandSparkles
} from "lucide-react";
import { toast } from "sonner";

import { AuthDialog } from "@/components/auth-dialog";
import { BrandMark } from "@/components/brand-mark";
import { HistorySidebar } from "@/components/history-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { PricingPill } from "@/components/pricing-pill";
import { ReelCard } from "@/components/reel-card";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DURATION_OPTIONS, FREE_DAILY_LIMIT, GOAL_OPTIONS, PREMIUM_PRICE, STYLE_OPTIONS } from "@/lib/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  DurationValue,
  GenerateIdeasResponse,
  GenerationPayload,
  GenerationRecord,
  GoalValue,
  ReelIdea,
  SubscriptionStatus,
  StyleValue,
  UserProfile
} from "@/lib/types";
import { buildCopyBlock, getInitials, getTodayKey, isUnlimitedPlan } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";

const EMPTY_HISTORY: GenerationRecord[] = [];

const SUGGESTED_GENERATIONS: Array<{
  label: string;
  goal: GoalValue;
  style: StyleValue;
  duration: DurationValue;
}> = [
  {
    label: "Weight Loss • Motivational • 15s",
    goal: "weight-loss",
    style: "motivational",
    duration: "15s"
  },
  {
    label: "Home Workouts • Funny • 30s",
    goal: "home-workouts",
    style: "funny",
    duration: "30s"
  },
  {
    label: "Abs • Challenge • 15s",
    goal: "abs",
    style: "challenge",
    duration: "15s"
  }
];

function mapPayloadToRecord(row: {
  id: string;
  goal: GoalValue;
  style: StyleValue;
  duration: DurationValue;
  payload: GenerationPayload;
  created_at: string;
}): GenerationRecord {
  return {
    id: row.id,
    goal: row.goal ?? row.payload.goal,
    style: row.style ?? row.payload.style,
    duration: row.duration ?? row.payload.duration,
    ideas: row.payload.ideas,
    createdAt: row.created_at ?? row.payload.generatedAt,
    summary: `${GOAL_OPTIONS.find((option) => option.value === row.goal)?.label ?? row.goal} • ${
      STYLE_OPTIONS.find((option) => option.value === row.style)?.label ?? row.style
    } • ${row.duration}`,
    saved: true,
    source: "supabase"
  };
}

function normalizeLocalHistory(records: GenerationRecord[]) {
  return records.filter((record) => !record.id.startsWith("sample-history-"));
}

function buildProfilePayload(user: User) {
  return {
    user_id: user.id,
    email: user.email ?? null,
    full_name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "Coach",
    avatar_url: user.user_metadata?.avatar_url ?? null
  };
}

export function ReelFitApp() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const reduceMotion = useReducedMotion();
  const outputRef = useRef<HTMLDivElement | null>(null);
  const upgradeIntentRef = useRef<() => Promise<void>>(async () => undefined);
  const saveIntentRef = useRef<(record: GenerationRecord) => Promise<void>>(async () => undefined);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<{
    goal: GoalValue;
    style: StyleValue;
    duration: DurationValue;
  }>({
    goal: "weight-loss",
    style: "motivational",
    duration: "15s"
  });
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState<"upgrade" | "save" | null>(null);
  const [pendingRecordToSave, setPendingRecordToSave] = useState<GenerationRecord | null>(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<GenerationRecord | null>(null);
  const [history, setHistory] = useState<GenerationRecord[]>(EMPTY_HISTORY);
  const [checkoutState, setCheckoutState] = useState<"success" | "canceled" | null>(null);

  const guestHistoryState = useLocalStorage<GenerationRecord[]>("reelfit-guest-history", EMPTY_HISTORY);
  const guestUsageState = useLocalStorage<{ date: string; count: number }>("reelfit-guest-usage", {
    date: getTodayKey(),
    count: 0
  });

  const authEnabled = Boolean(supabase);
  const guestHistory = normalizeLocalHistory(guestHistoryState.value);
  const guestUsageDate = guestUsageState.value.date;
  const guestUsageCount = guestUsageDate === getTodayKey() ? guestUsageState.value.count : 0;
  const isUnlimited = isUnlimitedPlan(profile?.subscription_status);
  const remaining = isUnlimited
    ? null
    : Math.max(0, FREE_DAILY_LIMIT - (user ? profile?.generation_count ?? 0 : guestUsageCount));
  const generationLocked = !isUnlimited && remaining === 0;
  const lowCredit = !isUnlimited && remaining !== null && remaining <= 1;

  const goalLabel = GOAL_OPTIONS.find((option) => option.value === form.goal)?.label ?? "your goal";
  const styleLabel = STYLE_OPTIONS.find((option) => option.value === form.style)?.label ?? "motivational";

  const saveLabel = !authEnabled
    ? "Auth Required"
    : saveLoading
      ? "Saving..."
      : currentRecord?.source === "supabase"
        ? "History Synced"
        : user
          ? "Save to History"
          : "Save with Account";

  function scrollToOutput() {
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateRecordCollections(nextRecord: GenerationRecord, previousIds: string[] = [nextRecord.id]) {
    startTransition(() => {
      setCurrentRecord(nextRecord);
      setHistory((previous) => [nextRecord, ...previous.filter((item) => !previousIds.includes(item.id) && item.id !== nextRecord.id)].slice(0, 10));
    });
  }

  useEffect(() => {
    if (guestUsageDate !== getTodayKey()) {
      guestUsageState.setValue({ date: getTodayKey(), count: 0 });
    }
  }, [guestUsageDate, guestUsageState]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (user || !guestHistoryState.ready) return;

    startTransition(() => {
      setHistory(guestHistory);
      setCurrentRecord((previous) => {
        if (previous && guestHistory.some((item) => item.id === previous.id)) {
          return previous;
        }
        return guestHistory[0] ?? null;
      });
    });
  }, [guestHistory, guestHistoryState.ready, user]);

  useEffect(() => {
    if (!supabase || !user) return;
    const activeUser = user;
    const activeSupabase = supabase;

    let active = true;

    async function loadUserData() {
      const bootstrapProfile = buildProfilePayload(activeUser);

      const [{ data: profileRow, error: profileError }, { data: historyRows, error: historyError }] =
        await Promise.all([
          activeSupabase.from("users").upsert(bootstrapProfile, { onConflict: "user_id" }).select().single(),
          activeSupabase
            .from("ideas")
            .select("id, goal, style, duration, payload, created_at")
            .order("created_at", { ascending: false })
            .limit(10)
        ]);

      if (!active) return;

      if (profileError) {
        toast.error(profileError.message);
      } else {
        setProfile(profileRow as UserProfile);
      }

      if (historyError) {
        toast.error(historyError.message);
      } else {
        const mapped =
          historyRows?.map((row) =>
            mapPayloadToRecord(
              row as {
                id: string;
                goal: GoalValue;
                style: StyleValue;
                duration: DurationValue;
                payload: GenerationPayload;
                created_at: string;
              }
            )
          ) ?? [];

        startTransition(() => {
          setHistory(mapped);
          setCurrentRecord((previous) => {
            if (previous && mapped.some((item) => item.id === previous.id)) {
              return previous;
            }
            return mapped[0] ?? previous ?? null;
          });
        });
      }
    }

    void loadUserData();

    return () => {
      active = false;
    };
  }, [supabase, user]);

  useEffect(() => {
    if (!user || !authIntent) return;

    if (authIntent === "upgrade") {
      setAuthIntent(null);
      void upgradeIntentRef.current();
      return;
    }

    if (authIntent === "save" && pendingRecordToSave) {
      const record = pendingRecordToSave;
      setAuthIntent(null);
      void saveIntentRef.current(record);
    }
  }, [authIntent, pendingRecordToSave, user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutState = params.get("checkout");
    if (checkoutState !== "success" && checkoutState !== "canceled") return;

    setCheckoutState(checkoutState);

    if (checkoutState === "success") {
      toast.message("Payment received. Finalizing your subscription...");
    } else if (checkoutState === "canceled") {
      toast.message("Checkout canceled. Your free plan is still active.");
    }

    params.delete("checkout");
    const nextQuery = params.toString();
    window.history.replaceState({}, "", nextQuery ? `/?${nextQuery}` : "/");
  }, []);

  useEffect(() => {
    if (checkoutState !== "success" || !user || !supabase) return;

    let active = true;
    const activeUser = user;
    const activeSupabase = supabase;

    async function syncStripeSubscription() {
      try {
        const accessToken = (await activeSupabase.auth.getSession()).data.session?.access_token;
        const response = await fetch("/api/stripe/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
          },
          body: JSON.stringify({
            userId: activeUser.id
          })
        });

        const payload = (await response.json()) as {
          message?: string;
          subscriptionStatus?: SubscriptionStatus;
        };

        if (!active) return;

        if (!response.ok || !payload.subscriptionStatus) {
          toast.message(payload.message ?? "Payment received. Subscription sync may take a moment.");
          return;
        }

        const nextStatus = payload.subscriptionStatus;

        setProfile((previous) =>
          previous
            ? {
                ...previous,
                subscription_status: nextStatus
              }
            : previous
        );

        if (isUnlimitedPlan(nextStatus)) {
          toast.success("Subscription updated. Your unlimited plan is ready.");
        } else {
          toast.message("Payment received. Subscription sync may take a moment.");
        }
      } catch (error) {
        if (!active) return;
        toast.message(error instanceof Error ? error.message : "Subscription sync may take a moment.");
      } finally {
        if (active) {
          setCheckoutState(null);
        }
      }
    }

    void syncStripeSubscription();

    return () => {
      active = false;
    };
  }, [checkoutState, supabase, user]);

  async function requestGenerate(nextForm = form) {
    setGenerationError(null);
    setLimitReached(false);
    scrollToOutput();

    if (generationLocked) {
      setLimitReached(true);
      setGenerationError("You’ve used today’s free generations. Upgrade to keep creating new Reel packs.");
      toast.error("You’ve used all 3 free generations today. Upgrade for unlimited.");
      return;
    }

    setLoadingGenerate(true);

    try {
      const accessToken = user && supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify(nextForm)
      });

      const payload = (await response.json()) as GenerateIdeasResponse & { message?: string };

      if (!response.ok) {
        const message =
          payload.message ??
          (payload.limitReached
            ? "You’ve reached today’s free generation cap."
            : "Unable to generate ideas right now.");
        setGenerationError(message);
        setLimitReached(Boolean(payload.limitReached));

        if (payload.limitReached) {
          toast.error("You’ve hit today’s free limit. Upgrade for unlimited generations.");
        } else {
          toast.error(message);
        }
        return;
      }

      updateRecordCollections(payload.record, [payload.record.id]);

      if (user) {
        setProfile((previous) =>
          previous
            ? {
                ...previous,
                subscription_status: payload.subscriptionStatus,
                generation_count: payload.remaining === null ? previous.generation_count : FREE_DAILY_LIMIT - payload.remaining,
                generation_date: getTodayKey()
              }
            : previous
        );
      } else {
        guestUsageState.setValue({ date: getTodayKey(), count: guestUsageCount + 1 });
        guestHistoryState.setValue([
          payload.record,
          ...guestHistory.filter((item) => item.id !== payload.record.id)
        ].slice(0, 10));
      }

      toast.success("Fresh Reel ideas are ready.");
      requestAnimationFrame(() => scrollToOutput());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setGenerationError(message);
      toast.error(message);
    } finally {
      setLoadingGenerate(false);
    }
  }

  async function saveRecordToHistory(record: GenerationRecord) {
    if (!authEnabled) {
      toast.error("Add Supabase env vars to enable saved history.");
      return;
    }

    if (!user || !supabase) {
      setPendingRecordToSave(record);
      setAuthIntent("save");
      setAuthDialogOpen(true);
      toast.message("Create a free account to save this Reel pack to history.");
      return;
    }

    if (record.source === "supabase") {
      toast.success("This Reel pack is already synced to history.");
      return;
    }

    setSaveLoading(true);

    try {
      const profilePayload = buildProfilePayload(user);
      const generationPayload: GenerationPayload = {
        goal: record.goal,
        style: record.style,
        duration: record.duration,
        ideas: record.ideas,
        generatedAt: record.createdAt
      };

      const [{ error: profileError }, { data: savedIdea, error: saveError }] = await Promise.all([
        supabase.from("users").upsert(profilePayload, { onConflict: "user_id" }),
        supabase
          .from("ideas")
          .insert({
            user_id: user.id,
            summary: record.summary,
            goal: record.goal,
            style: record.style,
            duration: record.duration,
            payload: generationPayload
          })
          .select("id, created_at")
          .single()
      ]);

      if (profileError) throw profileError;
      if (saveError || !savedIdea) throw saveError ?? new Error("Unable to save generation.");

      const savedRecord: GenerationRecord = {
        ...record,
        id: savedIdea.id,
        createdAt: savedIdea.created_at,
        saved: true,
        source: "supabase"
      };

      updateRecordCollections(savedRecord, [record.id, savedRecord.id]);
      guestHistoryState.setValue(guestHistory.filter((item) => item.id !== record.id));
      setPendingRecordToSave(null);
      toast.success("Saved to your Supabase history.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save this Reel pack.");
    } finally {
      setSaveLoading(false);
    }
  }

  async function persistFavorite(nextRecord: GenerationRecord) {
    if (!user || !supabase || nextRecord.source !== "supabase") return;

    const { error } = await supabase
      .from("ideas")
      .update({
        payload: {
          goal: nextRecord.goal,
          style: nextRecord.style,
          duration: nextRecord.duration,
          ideas: nextRecord.ideas,
          generatedAt: nextRecord.createdAt
        }
      })
      .eq("id", nextRecord.id);

    if (error) {
      toast.error("Favorite sync failed.");
    }
  }

  function handleToggleFavorite(ideaId: string) {
    if (!currentRecord) return;

    const nextIdeas = currentRecord.ideas.map((idea) =>
      idea.id === ideaId ? { ...idea, favorite: !idea.favorite } : idea
    );
    const nextRecord = { ...currentRecord, ideas: nextIdeas };

    setCurrentRecord(nextRecord);
    setHistory((previous) => previous.map((item) => (item.id === nextRecord.id ? nextRecord : item)));

    if (!user) {
      guestHistoryState.setValue(
        guestHistory.map((item) => (item.id === nextRecord.id ? nextRecord : item))
      );
    } else {
      void persistFavorite(nextRecord);
    }
  }

  function handleSelectHistory(record: GenerationRecord) {
    setForm({
      goal: record.goal,
      style: record.style,
      duration: record.duration
    });
    setCurrentRecord(record);
    setGenerationError(null);
    setLimitReached(false);
    scrollToOutput();
  }

  async function handleCopyIdea(idea: ReelIdea) {
    try {
      await navigator.clipboard.writeText(buildCopyBlock(idea));
      toast.success("Copied Reel package to clipboard.");
    } catch {
      toast.error("Clipboard access failed. Try again from a secure browser tab.");
    }
  }

  function handleSaveCurrentRecord() {
    if (!currentRecord) return;
    void saveRecordToHistory(currentRecord);
  }

  async function handleUpgrade() {
    if (!authEnabled) {
      toast.error("Add Supabase env vars before enabling accounts and Stripe billing.");
      return;
    }

    if (!user) {
      setAuthIntent("upgrade");
      setAuthDialogOpen(true);
      toast.message("Create a free account first so billing can attach to your profile.");
      return;
    }

    if (isUnlimited) {
      await handleManageBilling();
      return;
    }

    setBillingLoading(true);

    try {
      const accessToken = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email
        })
      });

      const payload = (await response.json()) as { url?: string; message?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.message ?? "Stripe checkout is not configured.");
      }

      window.location.href = payload.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open checkout.");
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleManageBilling() {
    if (!authEnabled) {
      toast.error("Add Supabase env vars before enabling accounts and billing.");
      return;
    }

    if (!user) {
      setAuthIntent("upgrade");
      setAuthDialogOpen(true);
      return;
    }

    setBillingLoading(true);

    try {
      const accessToken = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      const payload = (await response.json()) as { url?: string; message?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.message ?? "Stripe customer portal is not ready yet.");
      }

      window.location.href = payload.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open billing portal.");
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setHistory(guestHistory);
    setCurrentRecord(guestHistory[0] ?? null);
    toast.success("Signed out. Guest mode is still available.");
  }

  function handleAuthDialogChange(open: boolean) {
    setAuthDialogOpen(open);
    if (!open && !user) {
      setAuthIntent(null);
      setPendingRecordToSave(null);
    }
  }

  const heroPreview = `Enter your goal → Get 5 ${goalLabel.toLowerCase()} ${styleLabel.toLowerCase()} ideas instantly`;
  const generateLabel = generationLocked
    ? "Upgrade for Unlimited"
    : loadingGenerate
      ? "Generating ideas..."
      : `Generate 5 ${goalLabel.toLowerCase()} ideas`;

  upgradeIntentRef.current = handleUpgrade;
  saveIntentRef.current = saveRecordToHistory;

  return (
    <div className="relative">
      <PricingPill
        isUnlimited={isUnlimited}
        remaining={remaining}
        onUpgrade={handleUpgrade}
        onManageBilling={handleManageBilling}
      />

      <AuthDialog open={authDialogOpen} onOpenChange={handleAuthDialogChange} />

      <div className="container space-y-8 pb-10 pt-5 md:pt-8">
        <header className="flex items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-2">
            <ModeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full px-3">
                    <span className="mr-3 grid h-8 w-8 place-items-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                      {getInitials(profile?.full_name ?? user.email)}
                    </span>
                    <span className="hidden sm:inline">{profile?.full_name ?? user.email?.split("@")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Signed in as {user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleManageBilling}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing portal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={() => (authEnabled ? setAuthDialogOpen(true) : toast.error("Add Supabase env vars to enable auth."))}>
                Sign in
              </Button>
            )}
          </div>
        </header>

        <section className="section-shell overflow-hidden px-6 py-8 md:px-10 md:py-12">
          <div className="absolute inset-0 bg-grid-fade bg-grid opacity-60" />
          <div className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="space-y-6"
            >
              <Badge className="w-fit">Built for fitness coaches</Badge>
              <div className="space-y-4">
                <h1 className="max-w-4xl balance font-hero text-[4rem] font-semibold leading-[0.95] text-shadow-soft lg:text-[6rem]">
                  Generate Viral Fitness Reels in Seconds
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
                  AI crafts hooks, captions, and hashtags for your niche so you can go from blank page to post-ready in one click.
                </p>
              </div>

              <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-primary/20 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary shadow-sm dark:bg-primary/15">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="truncate">{heroPreview}</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Flow", value: "1-click" },
                  { label: "Free tier", value: "3 / day" },
                  { label: "Plan", value: PREMIUM_PRICE }
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-white/60 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/55">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="grid gap-4 sm:grid-cols-2"
            >
              <Card className="sm:col-span-2 bg-background/80">
                <CardHeader className="pb-4">
                  <Badge className="w-fit">One-screen workflow</Badge>
                  <CardTitle className="text-3xl">Dial in goal, tone, and length.</CardTitle>
                  <CardDescription>Everything stays on the same page for fast ideation on mobile and desktop.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-background/80">
                <CardContent className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Output</p>
                  <p className="mt-2 text-xl font-semibold">Lean copy packs</p>
                  <p className="mt-2 text-sm text-muted-foreground">Hooks, reel flow, CTA, hashtags, and copy-ready structure without text overload.</p>
                </CardContent>
              </Card>
              <Card className="bg-background/80">
                <CardContent className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Retention</p>
                  <p className="mt-2 text-xl font-semibold">History + upgrade path</p>
                  <p className="mt-2 text-sm text-muted-foreground">Free users stay moving, then upgrade the moment the daily cap hits.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <HistorySidebar
            history={history}
            activeId={currentRecord?.id ?? null}
            remaining={remaining}
            isUnlimited={isUnlimited}
            isSignedIn={Boolean(user)}
            onSelect={handleSelectHistory}
            onRegenerate={(record) => {
              const nextForm = { goal: record.goal, style: record.style, duration: record.duration };
              setForm(nextForm);
              void requestGenerate(nextForm);
            }}
            onUpgrade={handleUpgrade}
            onManageBilling={handleManageBilling}
          />

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Generator</p>
                    <CardTitle className="mt-2 text-3xl">Enter your goal and generate instantly</CardTitle>
                  </div>
                  <Badge variant={isUnlimited ? "default" : "secondary"}>
                    {isUnlimited ? "Unlimited active" : `${remaining ?? 0} free generations left today`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="mx-auto grid max-w-[500px] gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="goal-select">
                      Goal
                    </label>
                    <Select
                      value={form.goal}
                      onValueChange={(value) => setForm((previous) => ({ ...previous, goal: value as GoalValue }))}
                    >
                      <SelectTrigger id="goal-select" aria-label="Choose your content goal">
                        <SelectValue placeholder="Choose a goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="style-select">
                      Style
                    </label>
                    <Select
                      value={form.style}
                      onValueChange={(value) => setForm((previous) => ({ ...previous, style: value as StyleValue }))}
                    >
                      <SelectTrigger id="style-select" aria-label="Choose the Reel style">
                        <SelectValue placeholder="Choose a style" />
                      </SelectTrigger>
                      <SelectContent>
                        {STYLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="duration-select">
                      Duration
                    </label>
                    <Select
                      value={form.duration}
                      onValueChange={(value) => setForm((previous) => ({ ...previous, duration: value as DurationValue }))}
                    >
                      <SelectTrigger id="duration-select" aria-label="Choose the Reel duration">
                        <SelectValue placeholder="Choose a duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="h-14 rounded-2xl text-base"
                    onClick={() => (generationLocked ? void handleUpgrade() : void requestGenerate())}
                    disabled={loadingGenerate || billingLoading}
                  >
                    {loadingGenerate ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading ideas
                      </>
                    ) : generationLocked ? (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        {generateLabel}
                      </>
                    ) : (
                      <>
                        <WandSparkles className="mr-2 h-5 w-5" />
                        {generateLabel}
                      </>
                    )}
                  </Button>
                </div>

                {!authEnabled ? (
                  <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4" />
                    Add Supabase env vars to enable account sync and Stripe billing. Guest generation still works in the meantime.
                  </div>
                ) : !isUnlimited && generationLocked ? (
                  <div className="rounded-[1.5rem] border border-secondary/30 bg-secondary/10 p-4 text-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-amber-700 dark:text-amber-300">Upgrade for Unlimited</p>
                        <p className="mt-1 text-muted-foreground">
                          You’ve used today’s 3 free generations. Activate the {PREMIUM_PRICE} plan to keep ideating without a cap.
                        </p>
                      </div>
                      <Button variant="secondary" className="rounded-2xl" onClick={handleUpgrade} disabled={billingLoading}>
                        {billingLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                        Upgrade now
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary dark:bg-primary/15">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {user
                        ? "Signed-in generations auto-save to Supabase. Favorites sync with your dashboard."
                        : "Guest mode is active. Sign in any time to save a Reel pack and unlock billing."}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <section ref={outputRef} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Output</p>
                  <h2 className="mt-2 text-3xl font-semibold">
                    {currentRecord ? currentRecord.summary : "Your next Reel pack will appear here"}
                  </h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground">
                  <CopyCheck className="h-4 w-4 text-primary" />
                  One-click copy with hooks, reel flow, and hashtags
                </div>
              </div>

              {loadingGenerate ? (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="flex items-center gap-3 p-5 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating five fresh Reel ideas for {goalLabel.toLowerCase()} in a {styleLabel.toLowerCase()} style.
                  </CardContent>
                </Card>
              ) : null}

              {generationError ? (
                <Card className={limitReached ? "border-secondary/30 bg-secondary/10" : "border-destructive/25 bg-destructive/5"}>
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`mt-0.5 h-5 w-5 ${limitReached ? "text-amber-500" : "text-destructive"}`} />
                      <div>
                        <p className="font-semibold">{limitReached ? "Daily free cap reached" : "Something went wrong"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{generationError}</p>
                      </div>
                    </div>
                    <Button variant={limitReached ? "secondary" : "outline"} className="rounded-2xl" onClick={limitReached ? handleUpgrade : () => void requestGenerate()} disabled={billingLoading || loadingGenerate}>
                      {limitReached ? "Upgrade now" : "Try again"}
                    </Button>
                  </CardContent>
                </Card>
              ) : null}

              {currentRecord && !loadingGenerate ? (
                <>
                  {currentRecord.source === "local" ? (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">Save this Reel pack to your history</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {user
                              ? "This draft is local right now. Save it to Supabase so it stays in your dashboard."
                              : "Create a free account to sync this generation, then upgrade whenever you’re ready."}
                          </p>
                        </div>
                        <Button variant="default" className="rounded-2xl" onClick={handleSaveCurrentRecord} disabled={saveLoading || !authEnabled}>
                          {saveLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                          {saveLabel}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : null}

                  {lowCredit ? (
                    <Card className="border-secondary/20 bg-secondary/10">
                      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">
                            {generationLocked ? "You’re out of free generations today" : "You’re down to your final free generation"}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Upgrade to {PREMIUM_PRICE} for unlimited Reel packs, billing portal access, and a smoother client-content workflow.
                          </p>
                        </div>
                        <Button variant="secondary" className="rounded-2xl" onClick={handleUpgrade} disabled={billingLoading}>
                          {billingLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                          Upgrade for Unlimited
                        </Button>
                      </CardContent>
                    </Card>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {currentRecord.ideas.map((idea, index) => (
                      <ReelCard
                        key={idea.id}
                        idea={idea}
                        index={index}
                        goal={currentRecord.goal}
                        style={currentRecord.style}
                        saveLabel={saveLabel}
                        saving={saveLoading || !authEnabled || currentRecord.source === "supabase"}
                        onCopy={() => void handleCopyIdea(idea)}
                        onSave={handleSaveCurrentRecord}
                        onToggleFavorite={() => handleToggleFavorite(idea.id)}
                      />
                    ))}
                  </div>
                </>
              ) : null}

              {!currentRecord && !loadingGenerate ? (
                <Card className="overflow-hidden border-dashed">
                  <CardHeader className="space-y-3">
                    <Badge className="w-fit">Empty state</Badge>
                    <CardTitle className="text-3xl">Generate once, then reuse your best angles fast.</CardTitle>
                    <CardDescription className="max-w-2xl">
                      Pick a goal, choose the tone, and ReelFit AI will give you five lean content packs built for fitness coaches.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-3">
                      {SUGGESTED_GENERATIONS.map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => {
                            const nextForm = {
                              goal: option.goal,
                              style: option.style,
                              duration: option.duration
                            };
                            setForm(nextForm);
                            void requestGenerate(nextForm);
                          }}
                          className="rounded-[1.5rem] border border-border bg-background/70 p-4 text-left transition hover:border-primary/40 hover:bg-accent/40"
                        >
                          <p className="text-sm font-semibold">{option.label}</p>
                          <p className="mt-2 text-sm text-muted-foreground">Tap to generate this starter pack instantly.</p>
                        </button>
                      ))}
                    </div>

                    <div className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                      {authEnabled
                        ? "Signed-in users get auto-saved history. Guest users can still generate and save the pack later."
                        : "Guest generation is available now. Add Supabase env vars to turn on account sync and billing."}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {loadingGenerate && !currentRecord ? (
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={`loading-card-${index}`} className="overflow-hidden">
                      <CardContent className="space-y-4 p-6 animate-pulse">
                        <div className="h-6 w-24 rounded-full bg-muted" />
                        <div className="h-20 rounded-[1.5rem] bg-muted" />
                        <div className="space-y-2">
                          <div className="h-4 w-full rounded bg-muted" />
                          <div className="h-4 w-5/6 rounded bg-muted" />
                          <div className="h-4 w-2/3 rounded bg-muted" />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 flex-1 rounded-full bg-muted" />
                          <div className="h-8 flex-1 rounded-full bg-muted" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}
            </section>

            <SiteFooter isUnlimited={isUnlimited} onUpgrade={handleUpgrade} onManageBilling={handleManageBilling} />
          </div>
        </section>
      </div>
    </div>
  );
}
