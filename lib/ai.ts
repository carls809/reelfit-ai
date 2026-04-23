import { DURATION_OPTIONS, GOAL_OPTIONS, STYLE_OPTIONS } from "@/lib/constants";
import { SAMPLE_IDEA_BANK } from "@/lib/mock-data";
import type {
  DurationValue,
  GenerationPayload,
  GenerationRecord,
  GoalValue,
  ReelIdea,
  StyleValue
} from "@/lib/types";

const styleOpeners: Record<StyleValue, string[]> = {
  motivational: ["Coach reminder:", "Your sign to post this:", "Use this if your audience needs momentum:"],
  funny: ["Too real:", "GymTok truth:", "Post this when you want the comments section moving:"],
  challenge: ["Challenge idea:", "Try this format:", "This one gets followers involved fast:"]
};

const styleClosers: Record<StyleValue, string[]> = {
  motivational: [
    "End with a save CTA and invite followers to message you the word START.",
    "Close with a calm confidence line that sounds like a coach, not a hype page."
  ],
  funny: [
    "Keep the last frame playful, then pivot into a smart coaching takeaway.",
    "Finish with a wink to the audience so the humor still feels brand-safe."
  ],
  challenge: [
    "Ask viewers to tag a friend and report back after day one.",
    "Make the final frame feel like a challenge card people want to screenshot."
  ]
};

const styleCtas: Record<StyleValue, string[]> = {
  motivational: [
    "save this and DM me START for the full plan",
    "save this before your next session and send it to your training partner"
  ],
  funny: [
    "comment the most relatable gym habit and send this to your funniest client",
    "tag the friend who does this every week and save it for your next Reel"
  ],
  challenge: [
    "tag a friend and comment day one when you finish the challenge",
    "save this, try it tonight, and challenge your audience to do the same"
  ]
};

const goalAngles: Record<GoalValue, string[]> = {
  "weight-loss": [
    "simple calorie-burn sequencing",
    "habits that make fat loss sustainable",
    "beginner confidence around consistency"
  ],
  abs: ["anti-rotation core work", "lower-ab control", "what actually makes abs visible"],
  "home-workouts": ["small-space efficiency", "bodyweight progressions", "no-excuses setup"],
  strength: ["technique-first lifting", "confidence under load", "plateau fixes"],
  mobility: ["desk-body relief", "hips and thoracic spine", "feel-better daily movement"],
  glutes: ["activation that transfers", "stronger lower-body setup", "glute-focused form"]
};

const goalHashtagMap: Record<GoalValue, string[]> = {
  "weight-loss": ["#WeightLossCoach", "#FatLossTips"],
  abs: ["#AbsWorkout", "#CoreTraining"],
  "home-workouts": ["#HomeWorkout", "#NoGymNeeded"],
  strength: ["#StrengthCoach", "#LiftSmarter"],
  mobility: ["#MobilityFlow", "#MoveBetter"],
  glutes: ["#GluteWorkout", "#LowerBodyDay"]
};

const styleHashtagMap: Record<StyleValue, string[]> = {
  motivational: ["#CoachMindset", "#FitnessMotivation"],
  funny: ["#FunnyFitness", "#GymHumor"],
  challenge: ["#FitnessChallenge", "#CoachCommunity"]
};

function hashString(value: string) {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function rotate<T>(array: T[], offset: number) {
  return array.map((_, index) => array[(index + offset) % array.length]);
}

export function buildSummary(goal: GoalValue, style: StyleValue, duration: DurationValue) {
  const goalLabel = GOAL_OPTIONS.find((option) => option.value === goal)?.label ?? goal;
  const styleLabel = STYLE_OPTIONS.find((option) => option.value === style)?.label ?? style;
  return `${goalLabel} • ${styleLabel} • ${duration}`;
}

export function createIdeas(goal: GoalValue, style: StyleValue, duration: DurationValue): ReelIdea[] {
  const goalLabel = GOAL_OPTIONS.find((option) => option.value === goal)?.label ?? goal;
  const durationLabel = DURATION_OPTIONS.find((option) => option.value === duration)?.label ?? duration;
  const rotation = hashString(`${goal}-${style}-${duration}`) % SAMPLE_IDEA_BANK.length;
  const stylePrefix = styleOpeners[style];
  const styleEnding = styleClosers[style];
  const picked = rotate(SAMPLE_IDEA_BANK, rotation).slice(0, 5);

  return picked.map((template, index) => {
    const opener = stylePrefix[index % stylePrefix.length];
    const closer = styleEnding[index % styleEnding.length];
    const cta = styleCtas[style][index % styleCtas[style].length];
    const angle = goalAngles[goal][index % goalAngles[goal].length];
    const hashtags = [
      ...goalHashtagMap[goal],
      ...styleHashtagMap[style],
      "#ReelFitAI"
    ].slice(0, 5);
    const captionLead = template.caption.split(/(?<=[.!?])\s+/)[0] ?? template.caption;
    const beats = [
      `Open with the pain point behind ${goalLabel.toLowerCase()} so viewers stop scrolling.`,
      `Demo ${angle} with quick cuts and one coach cue inside ${durationLabel.toLowerCase()}.`,
      `Close with a clear CTA that feels easy to act on.`
    ];

    return {
      ...template,
      id: `${goal}-${style}-${duration}-${index}`,
      hook: `${opener} ${template.hook.replace("weight-loss", goalLabel.toLowerCase())}`,
      caption: `${captionLead} Tailor the middle beat to ${goalLabel.toLowerCase()} and end with ${cta}. ${closer}`,
      hashtags,
      thumbnailLabel: `${goalLabel}\n${duration.toUpperCase()}`,
      angle,
      beats,
      cta
    };
  });
}

export function createGenerationPayload(
  goal: GoalValue,
  style: StyleValue,
  duration: DurationValue,
  options?: {
    generatedAt?: string;
  }
): GenerationPayload {
  return {
    goal,
    style,
    duration,
    ideas: createIdeas(goal, style, duration),
    generatedAt: options?.generatedAt ?? new Date().toISOString()
  };
}

export function createGenerationRecord(
  payload: GenerationPayload,
  options?: Partial<Pick<GenerationRecord, "id" | "saved" | "source">>
): GenerationRecord {
  return {
    id: options?.id ?? crypto.randomUUID(),
    goal: payload.goal,
    style: payload.style,
    duration: payload.duration,
    summary: buildSummary(payload.goal, payload.style, payload.duration),
    createdAt: payload.generatedAt,
    ideas: payload.ideas,
    saved: options?.saved ?? true,
    source: options?.source ?? "local"
  };
}
