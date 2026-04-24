"use client";

import { Crown, History, RefreshCw, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GenerationRecord } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";

interface HistorySidebarProps {
  history: GenerationRecord[];
  activeId: string | null;
  remaining: number | null;
  isUnlimited: boolean;
  isSignedIn: boolean;
  onSelect: (record: GenerationRecord) => void;
  onRegenerate: (record: GenerationRecord) => void;
  onUpgrade: () => void;
  onManageBilling: () => void;
}

export function HistorySidebar({
  history,
  activeId,
  remaining,
  isUnlimited,
  isSignedIn,
  onSelect,
  onRegenerate,
  onUpgrade,
  onManageBilling
}: HistorySidebarProps) {
  return (
    <>
      <section className="space-y-4 md:hidden">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recent generations</p>
            <h2 className="text-xl font-semibold">Swipe-ready history</h2>
          </div>
          <Badge className="shrink-0">{isUnlimited ? "Unlimited" : `${remaining ?? 0} left`}</Badge>
        </div>
        {history.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border bg-background/60 p-5 text-sm text-muted-foreground">
            Your last 10 generations will appear here after the first run.
          </div>
        ) : null}
        <div className="flex snap-x gap-3 overflow-x-auto pb-2">
          {history.map((item) => (
            <div
              key={item.id}
              className={`w-[85vw] max-w-[320px] snap-start rounded-[1.5rem] border p-4 text-left shadow-sm transition ${
                activeId === item.id
                  ? "border-primary bg-primary/8"
                  : "border-border bg-background/70 hover:bg-accent/50"
              }`}
            >
              <button type="button" onClick={() => onSelect(item)} className="w-full text-left">
                <div className="flex flex-col items-start gap-2">
                  <p className="min-w-0 text-sm font-semibold">{item.summary}</p>
                  <Badge variant="outline" className="max-w-full">
                    {formatRelativeDate(item.createdAt)}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{item.ideas[0]?.hook}</p>
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 h-8 rounded-full px-0 text-primary hover:bg-transparent hover:text-primary/80"
                onClick={() => onRegenerate(item)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          ))}
        </div>
      </section>

      <aside className="sticky top-24 hidden h-fit md:block">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Dashboard</p>
                <CardTitle className="mt-2 text-2xl">Last 10 generations</CardTitle>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary dark:bg-primary/15">
                <History className="h-5 w-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Plan</p>
                <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
                  {isUnlimited ? <Crown className="h-4 w-4 text-amber-500" /> : <Sparkles className="h-4 w-4 text-primary" />}
                  {isUnlimited ? "Unlimited" : "Free"}
                </div>
              </div>
              <div className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Today</p>
                <div className="mt-2 text-lg font-semibold">
                  {isUnlimited ? "No cap" : `${remaining ?? 0} left`}
                </div>
              </div>
            </div>

            <Button
              variant={isUnlimited ? "outline" : "default"}
              className="h-12 rounded-2xl"
              onClick={isUnlimited ? onManageBilling : onUpgrade}
            >
              {isUnlimited ? "Manage billing" : isSignedIn ? "Upgrade for Unlimited" : "Sign in to upgrade"}
            </Button>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-3 pt-6">
            {history.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-border bg-background/60 p-5">
                <p className="text-sm font-semibold">No history yet</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Generate your first Reel pack and the latest 10 idea batches will stay here for quick reuse.
                </p>
              </div>
            ) : null}
            {history.map((item) => (
              <div
                key={item.id}
                className={`rounded-[1.5rem] border p-4 transition ${
                  activeId === item.id
                    ? "border-primary bg-primary/8"
                    : "border-border bg-background/60 hover:border-primary/40 hover:bg-accent/40"
                }`}
              >
                <button type="button" onClick={() => onSelect(item)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{item.summary}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {formatRelativeDate(item.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline">{item.ideas.length} ideas</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.ideas[0]?.hook}</p>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 h-9 rounded-full px-0 text-primary hover:bg-transparent hover:text-primary/80"
                  onClick={() => onRegenerate(item)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </>
  );
}
