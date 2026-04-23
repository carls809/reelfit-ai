import type { DurationValue, GoalValue, SelectOption, StyleValue } from "@/lib/types";

export const APP_NAME = "ReelFit AI";
export const FREE_DAILY_LIMIT = 3;
export const PREMIUM_PRICE = "$9/mo";

export const GOAL_OPTIONS: SelectOption<GoalValue>[] = [
  {
    value: "weight-loss",
    label: "Weight Loss",
    description: "Fat-loss hooks that feel achievable and coach-led."
  },
  {
    value: "abs",
    label: "Abs",
    description: "Core-focused content that busts myths and drives saves."
  },
  {
    value: "home-workouts",
    label: "Home Workouts",
    description: "Zero-gym setups for busy followers and apartment training."
  },
  {
    value: "strength",
    label: "Strength",
    description: "Technique-first clips for lifting confidence and progress."
  },
  {
    value: "mobility",
    label: "Mobility",
    description: "Feel-better routines for desk workers and athletes alike."
  },
  {
    value: "glutes",
    label: "Glutes",
    description: "Form cues and activation ideas that convert on social."
  }
];

export const STYLE_OPTIONS: SelectOption<StyleValue>[] = [
  {
    value: "motivational",
    label: "Motivational",
    description: "Coach energy, progress mindset, clean CTA."
  },
  {
    value: "funny",
    label: "Funny",
    description: "Light humor, relatable gym pain, high shareability."
  },
  {
    value: "challenge",
    label: "Challenge",
    description: "Simple formats people want to try and tag friends in."
  }
];

export const DURATION_OPTIONS: SelectOption<DurationValue>[] = [
  {
    value: "15s",
    label: "15 seconds",
    description: "Fast hook-first structure built for completion rate."
  },
  {
    value: "30s",
    label: "30 seconds",
    description: "A little more coaching context and story payoff."
  }
];

export const TESTIMONIALS = [
  {
    quote: "Feels like having a social strategist and performance coach in one tab.",
    name: "Ava R.",
    role: "Online Fitness Coach"
  },
  {
    quote: "My content pipeline went from blank page stress to five postable hooks in seconds.",
    name: "Marcus D.",
    role: "Hybrid Strength Coach"
  },
  {
    quote: "The format is so simple my team actually uses it every day.",
    name: "Sofia K.",
    role: "Studio Founder"
  }
];

export const PRICING_BULLETS = [
  "3 free generations every day",
  "Unlimited idea generation for active members",
  "Saved history, favorites, and instant copy blocks",
  "Stripe checkout + customer portal ready"
];
