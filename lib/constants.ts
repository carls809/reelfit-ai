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
  },
  {
    quote: "I used to overthink every Reel. Now I hit generate, tweak one line, and post.",
    name: "Jade T.",
    role: "Women's Fitness Coach"
  },
  {
    quote: "The funny hooks feel native to Instagram instead of sounding like generic AI copy.",
    name: "Chris V.",
    role: "Strength Creator"
  },
  {
    quote: "The save-to-history flow is perfect when I want to batch a week of ideas at once.",
    name: "Leila M.",
    role: "Pilates Coach"
  },
  {
    quote: "I finally have a repeatable content system my assistant can use without asking me questions all day.",
    name: "Ben H.",
    role: "Gym Owner"
  },
  {
    quote: "The hooks are short, scroll-stopping, and actually relevant to the niche I picked.",
    name: "Mia C.",
    role: "Mobility Specialist"
  },
  {
    quote: "This shaved hours off my weekly planning and made my captions sound more coach-led.",
    name: "Daniel P.",
    role: "Transformation Coach"
  },
  {
    quote: "I like that it stays simple. No giant dashboard, just ideas I can use immediately.",
    name: "Nina W.",
    role: "Online Trainer"
  },
  {
    quote: "The challenge format ideas give me way more comments than my old talking-head videos.",
    name: "Troy S.",
    role: "Functional Fitness Coach"
  },
  {
    quote: "The whole app feels like it was built by someone who understands how fitness creators actually work.",
    name: "Ella J.",
    role: "Glute Growth Coach"
  },
  {
    quote: "It turns one coaching niche into multiple strong angles fast, which is exactly what I needed.",
    name: "Rafael G.",
    role: "Body Recomp Coach"
  }
];

export const PRICING_BULLETS = [
  "3 free generations every day",
  "Unlimited idea generation for active members",
  "Saved history, favorites, and instant copy blocks",
  "Stripe checkout + customer portal ready"
];
