"use client";

import { Crown, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PREMIUM_PRICE } from "@/lib/constants";

interface PricingPillProps {
  isUnlimited: boolean;
  remaining: number | null;
  onUpgrade: () => void;
  onManageBilling: () => void;
}

export function PricingPill({
  isUnlimited,
  remaining,
  onUpgrade,
  onManageBilling
}: PricingPillProps) {
  return (
    <div className="fixed right-6 top-24 z-30 hidden items-center gap-3 rounded-full border border-white/60 bg-white/85 p-2 pr-4 shadow-card backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80 lg:flex xl:top-6">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-amber-400 text-white shadow-glow">
        {isUnlimited ? <Crown className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {isUnlimited ? "Unlimited Active" : `${remaining ?? 0} free left today`}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{isUnlimited ? "Manage your subscription" : `Upgrade to ${PREMIUM_PRICE}`}</p>
          {!isUnlimited ? <Badge variant="secondary">3 free / day</Badge> : null}
        </div>
      </div>
      <Button size="sm" className="rounded-full" onClick={isUnlimited ? onManageBilling : onUpgrade}>
        {isUnlimited ? "Portal" : "Upgrade"}
      </Button>
    </div>
  );
}
