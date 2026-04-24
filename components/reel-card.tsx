"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CheckCheck, Copy, Star } from "lucide-react";

import { ThumbnailMockup } from "@/components/thumbnail-mockup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { GoalValue, ReelIdea, StyleValue } from "@/lib/types";
import { cn, getCaptionBeats, truncateText } from "@/lib/utils";

interface ReelCardProps {
  idea: ReelIdea;
  index: number;
  goal: GoalValue;
  style: StyleValue;
  saveLabel: string;
  saving?: boolean;
  onCopy: () => void;
  onSave: () => void;
  onToggleFavorite: () => void;
}

export function ReelCard({
  idea,
  index,
  goal,
  style,
  saveLabel,
  saving = false,
  onCopy,
  onSave,
  onToggleFavorite
}: ReelCardProps) {
  const reduceMotion = useReducedMotion();
  const beats = getCaptionBeats(idea);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      className={cn("min-w-0", index === 0 && "md:col-span-2 xl:col-span-1")}
    >
      <Card className="group h-full overflow-hidden">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <Badge variant="outline">Idea {index + 1}</Badge>
              <CardTitle className="text-balance break-words text-2xl leading-tight">{idea.hook}</CardTitle>
            </div>
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={idea.favorite ? "Remove from favorites" : "Add to favorites"}
              className="shrink-0 rounded-full border border-border bg-background/70 p-2 transition hover:scale-[1.02] hover:bg-accent"
            >
              <Star className={cn("h-4 w-4", idea.favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
            </button>
          </div>
          <ThumbnailMockup goal={goal} style={style} label={idea.thumbnailLabel} />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 rounded-[1.25rem] border border-border bg-background/60 p-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge variant="default" className="normal-case tracking-normal">
                Angle
              </Badge>
              <p className="min-w-0 break-words text-sm font-medium text-foreground">{idea.angle}</p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{truncateText(idea.caption, 138)}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reel flow</p>
            <div className="space-y-2">
              {beats.map((beat, beatIndex) => (
                <div key={`${idea.id}-beat-${beatIndex}`} className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {beatIndex + 1}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{beat}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Hashtags</p>
              {idea.cta ? (
                <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                  CTA
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              ) : null}
            </div>
            {idea.cta ? <p className="text-sm text-foreground">{truncateText(idea.cta, 74)}</p> : null}
            <div className="flex flex-wrap gap-2">
              {idea.hashtags.map((hashtag) => (
                <Badge key={hashtag} variant="default" className="normal-case tracking-normal">
                  {hashtag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button variant="default" className="w-full rounded-2xl sm:flex-1" onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Pack
          </Button>
          <Button variant="outline" className="w-full rounded-2xl sm:flex-1" onClick={onSave} disabled={saving}>
            <CheckCheck className="mr-2 h-4 w-4" />
            {saveLabel}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
