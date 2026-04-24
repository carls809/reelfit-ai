import type { ReelIdea } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(date));
}

export function isUnlimitedPlan(status?: string | null) {
  return status === "active" || status === "trialing";
}

export function truncateText(text: string, length = 120) {
  if (text.length <= length) return text;

  const clipped = text.slice(0, length);
  const sentenceMatches = [...clipped.matchAll(/[.!?](?=\s|$)/g)];
  const lastSentenceEnd = sentenceMatches.at(-1)?.index;

  if (typeof lastSentenceEnd === "number" && lastSentenceEnd >= Math.floor(length * 0.55)) {
    return clipped.slice(0, lastSentenceEnd + 1).trimEnd();
  }

  const lastWordBreak = clipped.lastIndexOf(" ");
  if (lastWordBreak > 0) {
    return `${clipped.slice(0, lastWordBreak).trimEnd()}...`;
  }

  return `${clipped.trimEnd()}...`;
}

export function getCaptionBeats(idea: ReelIdea, max = 3) {
  if (idea.beats?.length) {
    return idea.beats.slice(0, max);
  }

  return idea.caption
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, max);
}

export function buildCopyBlock(idea: ReelIdea) {
  const beats = getCaptionBeats(idea);

  return [
    idea.hook,
    idea.caption,
    beats.length ? `Reel flow:\n${beats.map((beat, index) => `${index + 1}. ${beat}`).join("\n")}` : "",
    idea.cta ? `CTA: ${idea.cta}` : "",
    idea.hashtags.join(" ")
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function getInitials(name?: string | null) {
  if (!name) return "RF";
  return name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}
