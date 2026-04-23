import { Dumbbell, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-amber-400 text-white shadow-glow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_35%)]" />
        <Dumbbell className="relative h-5 w-5" />
      </div>
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          ReelFit AI
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <p className="text-sm text-muted-foreground">Instagram Reel Idea Generator for fitness coaches</p>
      </div>
    </div>
  );
}
