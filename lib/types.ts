export type GoalValue =
  | "weight-loss"
  | "abs"
  | "home-workouts"
  | "strength"
  | "mobility"
  | "glutes";

export type StyleValue = "motivational" | "funny" | "challenge";

export type DurationValue = "15s" | "30s";

export type SubscriptionStatus =
  | "free"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  description: string;
}

export interface ReelIdea {
  id: string;
  hook: string;
  caption: string;
  hashtags: string[];
  thumbnailLabel: string;
  angle: string;
  beats?: string[];
  cta?: string;
  favorite?: boolean;
}

export interface GenerationPayload {
  goal: GoalValue;
  style: StyleValue;
  duration: DurationValue;
  ideas: ReelIdea[];
  generatedAt: string;
}

export interface GenerationRecord {
  id: string;
  goal: GoalValue;
  style: StyleValue;
  duration: DurationValue;
  summary: string;
  createdAt: string;
  ideas: ReelIdea[];
  saved: boolean;
  source: "local" | "supabase";
}

export interface UserProfile {
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_status: SubscriptionStatus;
  generation_count: number;
  generation_date: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export interface GenerateIdeasResponse {
  ideas: ReelIdea[];
  record: GenerationRecord;
  remaining: number | null;
  limitReached: boolean;
  subscriptionStatus: SubscriptionStatus;
}
