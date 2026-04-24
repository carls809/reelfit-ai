import { Dumbbell, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-amber-400 text-white shadow-glow sm:h-11 sm:w-11">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_35%)]" />
        <Dumbbell className="relative h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
          ReelFit AI
          <Sparkles className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
        </div>
        <p className="max-w-[11rem] text-xs leading-snug text-muted-foreground sm:hidden">Reel ideas for fitness coaches</p>
        <p className="hidden text-sm text-muted-foreground sm:block">Instagram Reel Idea Generator for fitness coaches</p>
      </div>
    </div>
  );
}
