import { DURATION_OPTIONS, GOAL_OPTIONS, STYLE_OPTIONS } from "@/lib/constants";
import type {
  DurationValue,
  GenerationPayload,
  GenerationRecord,
  GoalValue,
  ReelIdea,
  StyleValue
} from "@/lib/types";

type GoalConcept = {
  angle: string;
  focus: string;
  thumbnail: string;
  pain: string;
  myth: string;
  demo: string;
  cue: string;
  payoff: string;
  hashtag: string;
};

type HookBuilderInput = {
  concept: GoalConcept;
  durationLabel: string;
  goalLabel: string;
  opener: string;
};

const styleOpeners: Record<StyleValue, string[]> = {
  motivational: ["Coach reminder:", "Your sign to post this:", "Use this if your audience needs momentum:"],
  funny: ["Too real:", "GymTok truth:", "Post this when you want the comments section moving:"],
  challenge: ["Challenge idea:", "Try this format:", "This one gets followers involved fast:"]
};

const styleClosers: Record<StyleValue, string[]> = {
  motivational: [
    "End with a save CTA and invite followers to message you the word START.",
    "Close with a calm confidence line that sounds like a coach, not a hype page.",
    "Keep the final frame steady so the message feels premium, not pushy."
  ],
  funny: [
    "Keep the last frame playful, then pivot into a smart coaching takeaway.",
    "Finish with a wink to the audience so the humor still feels brand-safe.",
    "Let the joke earn the watch time, then land the coaching point cleanly."
  ],
  challenge: [
    "Ask viewers to tag a friend and report back after day one.",
    "Make the final frame feel like a challenge card people want to screenshot.",
    "Use the final beat as a scorecard so comments feel natural."
  ]
};

const styleCtas: Record<StyleValue, string[]> = {
  motivational: [
    "save this and DM me START for the full plan",
    "save this before your next session and send it to your training partner",
    "save this for your next workout and message me when you try it"
  ],
  funny: [
    "comment the most relatable gym habit and send this to your funniest client",
    "tag the friend who does this every week and save it for your next Reel",
    "drop the most honest excuse you hear from clients and save this for later"
  ],
  challenge: [
    "tag a friend and comment day one when you finish the challenge",
    "save this, try it tonight, and challenge your audience to do the same",
    "comment your score and tag the friend who is doing this with you"
  ]
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

const goalConcepts: Record<GoalValue, GoalConcept[]> = {
  "weight-loss": [
    {
      angle: "protein-first breakfast setup",
      focus: "protein-first mornings",
      thumbnail: "Morning Reset",
      pain: "followers think fat loss starts with willpower instead of structure",
      myth: "skipping breakfast automatically fixes fat loss",
      demo: "one protein-heavy breakfast swap and one easy prep shot",
      cue: "build the first meal before the cravings hit",
      payoff: "their day feels easier to stay on track with",
      hashtag: "#ProteinBreakfast"
    },
    {
      angle: "step target layering",
      focus: "step anchors",
      thumbnail: "Step Boost",
      pain: "clients keep chasing hard workouts while their daily movement stays flat",
      myth: "fat loss only counts when the workout is intense",
      demo: "three moments where you stack extra steps into a normal day",
      cue: "attach movement to routines you already do",
      payoff: "fat-loss habits feel automatic instead of dramatic",
      hashtag: "#DailySteps"
    },
    {
      angle: "calorie-friendly food volume",
      focus: "volume meals",
      thumbnail: "Fuller Longer",
      pain: "your audience is hungry by 3pm and thinks discipline is the problem",
      myth: "eating less always means feeling miserable",
      demo: "a high-volume lunch plate with one visual calorie swap",
      cue: "make the plate look abundant before you make it perfect",
      payoff: "followers see how fullness can support fat loss",
      hashtag: "#VolumeEating"
    },
    {
      angle: "weekend damage control",
      focus: "weekend recovery",
      thumbnail: "Weekend Fix",
      pain: "people undo five solid weekdays with one unplanned weekend spiral",
      myth: "one off-plan meal ruins the whole week",
      demo: "your three-step reset after a heavy meal or social event",
      cue: "reset the next choice, not your self-worth",
      payoff: "the audience feels back in control fast",
      hashtag: "#WeekendReset"
    },
    {
      angle: "strength plus cardio balance",
      focus: "burn smarter",
      thumbnail: "Smart Burn",
      pain: "clients think more sweat is always the answer when progress slows",
      myth: "endless cardio beats smart programming",
      demo: "one lift, one interval, and one recovery beat in the same Reel",
      cue: "keep strength in the plan so the body changes actually last",
      payoff: "fat-loss coaching looks more strategic and credible",
      hashtag: "#BurnSmarter"
    },
    {
      angle: "appetite management habits",
      focus: "craving control",
      thumbnail: "Craving Fix",
      pain: "late-night snacking keeps wiping out otherwise solid days",
      myth: "cravings mean you are just not disciplined enough",
      demo: "a simple evening routine that reduces random snacking",
      cue: "solve the trigger before you fight the craving",
      payoff: "followers feel like fat loss is finally manageable",
      hashtag: "#CravingControl"
    }
  ],
  abs: [
    {
      angle: "anti-rotation brace work",
      focus: "brace better",
      thumbnail: "Brace Better",
      pain: "followers feel abs work in the neck and hips instead of the core",
      myth: "more crunches automatically mean better abs",
      demo: "an anti-rotation drill with a side-view brace setup",
      cue: "lock the ribs down before you move the limbs",
      payoff: "their core work finally looks controlled and coach-led",
      hashtag: "#BraceTraining"
    },
    {
      angle: "lower-ab control",
      focus: "lower-ab control",
      thumbnail: "Lower Abs",
      pain: "clients think the lower abs are impossible when the setup is the real issue",
      myth: "lower abs need a totally different workout category",
      demo: "a slow lower-ab progression with one regression and one upgrade",
      cue: "flatten the low back before the legs travel",
      payoff: "the movement feels cleaner and more achievable right away",
      hashtag: "#LowerAbs"
    },
    {
      angle: "visible abs habits",
      focus: "visible abs",
      thumbnail: "Visible Abs",
      pain: "your audience chases ab burnout instead of the habits that reveal definition",
      myth: "ab definition comes from one magic routine",
      demo: "one core move, one nutrition cue, and one recovery habit in sequence",
      cue: "train the core, but sell the full system",
      payoff: "your Reel sounds smarter than generic abs content",
      hashtag: "#VisibleAbs"
    },
    {
      angle: "rib and pelvis stacking",
      focus: "stack first",
      thumbnail: "Stack First",
      pain: "people arch hard and call it core tension when it is really compensation",
      myth: "a bigger arch means a stronger core position",
      demo: "a stacked versus flared comparison before the rep starts",
      cue: "bring ribs over hips before you chase tension",
      payoff: "the audience can see the difference instantly",
      hashtag: "#CorePosition"
    },
    {
      angle: "dead-bug progressions",
      focus: "dead bug fix",
      thumbnail: "Dead Bug",
      pain: "dead bugs look easy until clients start losing position halfway through",
      myth: "dead bugs are too basic to matter",
      demo: "a dead-bug ladder from beginner to coached progression",
      cue: "move slow enough to keep the low back honest",
      payoff: "followers understand why basics still work",
      hashtag: "#DeadBug"
    },
    {
      angle: "breathing and bracing sequence",
      focus: "breathing reset",
      thumbnail: "Breathing Reset",
      pain: "clients rush into abs work without creating tension first",
      myth: "breathing drills are fluff before the real workout",
      demo: "one breath cycle into one brace drill before the set begins",
      cue: "exhale fully, then build tension into the rep",
      payoff: "your coaching looks sharper and more premium",
      hashtag: "#BreathAndBrace"
    }
  ],
  "home-workouts": [
    {
      angle: "backpack loading tricks",
      focus: "backpack load",
      thumbnail: "Backpack Load",
      pain: "followers think home training stops working as soon as dumbbells feel light",
      myth: "you need fancy gear for real home progress",
      demo: "a loaded backpack setup and one movement pairing that scales fast",
      cue: "make the resistance smarter before you make it heavier",
      payoff: "the room suddenly feels like a real training space",
      hashtag: "#BackpackWorkout"
    },
    {
      angle: "apartment-friendly cardio",
      focus: "no-jump burn",
      thumbnail: "No Jump Burn",
      pain: "people skip cardio at home because they do not want to wake the whole building",
      myth: "home cardio only works if it is loud and chaotic",
      demo: "three low-impact cardio swaps with a timer overlay",
      cue: "quiet does not mean easy when the structure is right",
      payoff: "the audience sees a no-excuses home option",
      hashtag: "#ApartmentWorkout"
    },
    {
      angle: "couch-to-floor circuits",
      focus: "living-room flow",
      thumbnail: "Living Room",
      pain: "home workouts feel messy when every exercise needs a full reset",
      myth: "at-home circuits have to feel random to stay efficient",
      demo: "a couch-to-floor flow that keeps the camera and workout moving",
      cue: "organize the room once, then let the flow do the work",
      payoff: "the session looks smoother and easier to repeat",
      hashtag: "#LivingRoomWorkout"
    },
    {
      angle: "single-side bodyweight progressions",
      focus: "single-side work",
      thumbnail: "One Side",
      pain: "bodyweight workouts stall when every rep gets too comfortable",
      myth: "home progress means endless reps and no progression",
      demo: "one unilateral lower-body move and one upper-body progression",
      cue: "make one side work harder before you add more reps",
      payoff: "the workout suddenly feels advanced without more gear",
      hashtag: "#BodyweightProgress"
    },
    {
      angle: "timer-based density blocks",
      focus: "density blocks",
      thumbnail: "Timer Block",
      pain: "clients lose intensity at home because the workout has no urgency",
      myth: "home training needs longer sessions to be effective",
      demo: "a 15-minute density block with one simple score to beat",
      cue: "give the session a scoreboard so the effort rises naturally",
      payoff: "followers feel challenged without feeling overwhelmed",
      hashtag: "#WorkoutTimer"
    },
    {
      angle: "minimal-equipment upper body work",
      focus: "doorway rows",
      thumbnail: "Upper Fix",
      pain: "upper-body home days feel limited when people only think push-ups",
      myth: "home upper-body training is basically just push-ups and hope",
      demo: "a row variation, a press, and one carry-style finisher",
      cue: "show the pull first so the plan looks balanced",
      payoff: "home programming feels more complete and coach-worthy",
      hashtag: "#HomeGymIdeas"
    }
  ],
  strength: [
    {
      angle: "deadlift setup fixes",
      focus: "deadlift fix",
      thumbnail: "Deadlift Fix",
      pain: "followers keep adding plates before they fix the starting position",
      myth: "strength stalls always mean you need more volume",
      demo: "a side-view deadlift setup with the exact setup checklist on screen",
      cue: "build tension before the bar leaves the floor",
      payoff: "the lift instantly looks cleaner and stronger",
      hashtag: "#DeadliftTips"
    },
    {
      angle: "squat bracing",
      focus: "squat brace",
      thumbnail: "Squat Brace",
      pain: "people collapse under the squat because they never create pressure first",
      myth: "squat depth is the only thing that matters",
      demo: "brace setup, unrack, and first rep with one cue at each stage",
      cue: "own the brace before you chase the depth",
      payoff: "your coaching sounds specific and high-trust",
      hashtag: "#SquatForm"
    },
    {
      angle: "bench press leg drive",
      focus: "bench drive",
      thumbnail: "Bench Drive",
      pain: "bench press feels stuck because the lower body is doing nothing",
      myth: "bench is all chest and arms anyway",
      demo: "a leg-drive comparison between a loose setup and a locked-in setup",
      cue: "push the floor away before the bar moves",
      payoff: "followers see free strength without fancy programming",
      hashtag: "#BenchPress"
    },
    {
      angle: "rest-time honesty",
      focus: "rest timing",
      thumbnail: "Rest Timer",
      pain: "clients call a set hard but cut the rest too short to actually progress",
      myth: "shorter rest always means a better workout",
      demo: "two identical sets with different rest times and different outcomes",
      cue: "rest long enough to make the next set count",
      payoff: "your audience understands why stronger beats sweatier",
      hashtag: "#LiftSmarter"
    },
    {
      angle: "plateau-breaking accessories",
      focus: "plateau fix",
      thumbnail: "Plateau Fix",
      pain: "main lifts stall because the weak link is hiding in the accessory work",
      myth: "you only need to do the main lift more often",
      demo: "one main lift, one weak-point accessory, and one simple progression note",
      cue: "train the leak, not just the symptom",
      payoff: "your content sounds like a real coach diagnosis",
      hashtag: "#StrengthProgress"
    },
    {
      angle: "logbook progression",
      focus: "logbook wins",
      thumbnail: "Logbook",
      pain: "followers guess their way through strength blocks and wonder why nothing changes",
      myth: "consistency is enough even if you never track anything",
      demo: "a quick logbook check-in before the working sets begin",
      cue: "give every set a reason to exist",
      payoff: "progress looks measurable instead of motivational",
      hashtag: "#StrengthTraining"
    }
  ],
  mobility: [
    {
      angle: "thoracic desk reset",
      focus: "desk reset",
      thumbnail: "Desk Reset",
      pain: "desk-bound followers feel stiff all day and assume they need a full mobility class",
      myth: "mobility only works if you spend 30 minutes stretching",
      demo: "one thoracic opener against a wall and one breathing reset",
      cue: "open the upper back before you chase shoulder range",
      payoff: "the relief looks immediate and shareable",
      hashtag: "#DeskMobility"
    },
    {
      angle: "hip flexor release sequence",
      focus: "hip opener",
      thumbnail: "Hip Opener",
      pain: "tight hips keep making squats and walks feel worse than they should",
      myth: "just hold a lunge longer and mobility is solved",
      demo: "a hip flexor sequence with one active squeeze and one reach",
      cue: "create space with position, not just time",
      payoff: "mobility stops looking fluffy and starts looking useful",
      hashtag: "#HipMobility"
    },
    {
      angle: "ankle range for squats",
      focus: "ankle fix",
      thumbnail: "Ankle Fix",
      pain: "ankle stiffness keeps stealing squat depth and landing mechanics",
      myth: "bad squat depth always means the hips are the issue",
      demo: "a before-and-after ankle drill next to the squat pattern",
      cue: "earn the ankle range where you actually need it",
      payoff: "the audience sees why mobility can improve performance fast",
      hashtag: "#AnkleMobility"
    },
    {
      angle: "hamstring flossing",
      focus: "hamstring flow",
      thumbnail: "Hamstring Flow",
      pain: "people stretch hamstrings aggressively but never feel a lasting change",
      myth: "harder stretching always means better mobility",
      demo: "a hamstring floss with one controlled rep pattern",
      cue: "chase control first, then range",
      payoff: "the stretch looks smoother and more repeatable",
      hashtag: "#HamstringMobility"
    },
    {
      angle: "shoulder range upkeep",
      focus: "shoulder cars",
      thumbnail: "Shoulder CARs",
      pain: "upper-body sessions feel sticky because shoulder range is ignored until it hurts",
      myth: "shoulder mobility is only for rehab pages",
      demo: "a controlled shoulder CAR and one overhead comparison",
      cue: "move slow enough to actually own the path",
      payoff: "mobility looks athletic instead of passive",
      hashtag: "#ShoulderMobility"
    },
    {
      angle: "morning movement snack",
      focus: "morning flow",
      thumbnail: "Morning Flow",
      pain: "followers wake up stiff and wait until pain shows up to move",
      myth: "mobility has to happen after the workout or not at all",
      demo: "a 60-second morning sequence from floor to standing",
      cue: "make movement the first win of the day",
      payoff: "the routine feels easy to copy tomorrow morning",
      hashtag: "#MorningMobility"
    }
  ],
  glutes: [
    {
      angle: "activation before squats",
      focus: "glute primer",
      thumbnail: "Glute Primer",
      pain: "clients feel quads and low back before they ever feel the glutes switch on",
      myth: "glute activation means doing the burniest band move you can find",
      demo: "one primer drill, one squat, and one comparison rep",
      cue: "turn the glutes on before you ask them to drive",
      payoff: "the squat suddenly looks stronger and smoother",
      hashtag: "#GluteActivation"
    },
    {
      angle: "hip hinge patterning",
      focus: "hinge clean-up",
      thumbnail: "Hinge Fix",
      pain: "RDLs turn into a low-back grind when the hinge pattern is rushed",
      myth: "glutes only grow if the weight feels brutally heavy",
      demo: "a hinge pattern breakdown with one wall-tap drill",
      cue: "send hips back before you chase the stretch",
      payoff: "glute training looks more technical and effective",
      hashtag: "#HingePattern"
    },
    {
      angle: "split squat glute bias",
      focus: "split squat",
      thumbnail: "Split Squat",
      pain: "split squats keep becoming quad-only because the setup is off",
      myth: "all split squats hit glutes the same way",
      demo: "a standard split squat next to a glute-biased version",
      cue: "lean slightly and let the hip travel back",
      payoff: "followers feel the difference immediately",
      hashtag: "#SplitSquat"
    },
    {
      angle: "pelvis position",
      focus: "pelvis reset",
      thumbnail: "Pelvis Reset",
      pain: "glute bridges stop working when people live in a big arch the whole time",
      myth: "more arch means more glute contraction",
      demo: "bridge setup with rib position and pelvis cues on screen",
      cue: "stack the ribs before you drive the hips",
      payoff: "the contraction looks cleaner and more intentional",
      hashtag: "#GluteBridge"
    },
    {
      angle: "glute med strength",
      focus: "side-glute work",
      thumbnail: "Side Glute",
      pain: "knees cave and hips wobble because side-glute work gets skipped",
      myth: "glutes are only about hip thrusts and kickbacks",
      demo: "a side-glute drill paired with a single-leg stability shot",
      cue: "train the glute that keeps the pelvis honest",
      payoff: "the audience sees why glutes matter beyond aesthetics",
      hashtag: "#GluteMeds"
    },
    {
      angle: "hip thrust lockout",
      focus: "lockout cue",
      thumbnail: "Lockout Cue",
      pain: "hip thrusts look strong until the top position turns into back extension",
      myth: "higher thrusts always mean better glute work",
      demo: "a lockout comparison with one simple top-position cue",
      cue: "finish through the glutes, not the low back",
      payoff: "the movement looks safer and more coach-led",
      hashtag: "#HipThrust"
    }
  ]
};

const hookBuilders: Record<StyleValue, Array<(input: HookBuilderInput) => string>> = {
  motivational: [
    ({ concept, goalLabel, opener }) =>
      `${opener} ${concept.focus} is usually the missing link in ${goalLabel.toLowerCase()} content that actually converts`,
    ({ concept, goalLabel }) =>
      `If your audience wants better ${goalLabel.toLowerCase()} results, start with ${concept.focus.toLowerCase()} before adding more volume`,
    ({ concept, opener }) =>
      `${opener} ${concept.focus} makes your coaching look instantly more actionable on camera`,
    ({ goalLabel }) =>
      `Post this instead of another generic ${goalLabel.toLowerCase()} montage if you want more trust and saves`
  ],
  funny: [
    ({ concept, opener }) => `${opener} ${concept.myth}`,
    ({ concept, goalLabel }) =>
      `GymTok truth: ${concept.focus} is where most ${goalLabel.toLowerCase()} progress quietly disappears`,
    ({ concept, opener }) =>
      `${opener} your clients do not need another random hack, they need ${concept.focus.toLowerCase()}`,
    ({ concept }) =>
      `Post this when your audience keeps turning ${concept.focus.toLowerCase()} into a full personality trait`
  ],
  challenge: [
    ({ concept, durationLabel, opener }) =>
      `${opener} test your ${concept.focus.toLowerCase()} for ${durationLabel.toLowerCase()} a day this week`,
    ({ concept }) =>
      `Challenge idea: post this ${concept.focus.toLowerCase()} check-in and tell followers to tag you on day one`,
    ({ concept }) =>
      `This one gets followers involved fast: ${concept.focus} for 7 days with one score to track`,
    ({ concept, goalLabel, opener }) =>
      `${opener} use ${concept.focus.toLowerCase()} as this week's ${goalLabel.toLowerCase()} accountability challenge`
  ]
};

function shuffle<T>(items: T[]) {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

function uniqueHashtags(goal: GoalValue, style: StyleValue, concept: GoalConcept) {
  const tags = shuffle([...goalHashtagMap[goal], ...styleHashtagMap[style], concept.hashtag]).slice(0, 4);
  return [...new Set([...tags, "#ReelFitAI"])].slice(0, 5);
}

export function buildSummary(goal: GoalValue, style: StyleValue, duration: DurationValue) {
  const goalLabel = GOAL_OPTIONS.find((option) => option.value === goal)?.label ?? goal;
  const styleLabel = STYLE_OPTIONS.find((option) => option.value === style)?.label ?? style;
  return `${goalLabel} • ${styleLabel} • ${duration}`;
}

export function createIdeas(
  goal: GoalValue,
  style: StyleValue,
  duration: DurationValue,
  batchId = crypto.randomUUID()
): ReelIdea[] {
  const goalLabel = GOAL_OPTIONS.find((option) => option.value === goal)?.label ?? goal;
  const durationLabel = DURATION_OPTIONS.find((option) => option.value === duration)?.label ?? duration;
  const concepts = shuffle(goalConcepts[goal]).slice(0, 5);
  const openers = shuffle(styleOpeners[style]);
  const closers = shuffle(styleClosers[style]);
  const ctas = shuffle(styleCtas[style]);
  const builders = shuffle(hookBuilders[style]);

  return concepts.map((concept, index) => {
    const opener = openers[index % openers.length];
    const closer = closers[index % closers.length];
    const cta = ctas[index % ctas.length];
    const hook = builders[index % builders.length]({
      concept,
      durationLabel,
      goalLabel,
      opener
    });
    const beats = [
      `Open on ${concept.pain}.`,
      `Demo ${concept.demo} and coach "${concept.cue}."`,
      `Close on ${concept.payoff} and ${cta}.`
    ];

    return {
      id: `${batchId}-${index}`,
      hook,
      caption: `Lead with ${concept.pain}. Then show ${concept.demo} while you coach "${concept.cue}." Make the payoff ${concept.payoff}, then ${cta}. ${closer}`,
      hashtags: uniqueHashtags(goal, style, concept),
      thumbnailLabel: `${goalLabel}\n${concept.thumbnail}`,
      angle: concept.angle,
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
  const batchId = crypto.randomUUID();

  return {
    goal,
    style,
    duration,
    ideas: createIdeas(goal, style, duration, batchId),
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
