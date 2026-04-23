import type { GoalValue, StyleValue } from "@/lib/types";

const goalPalette: Record<GoalValue, [string, string]> = {
  "weight-loss": ["#10B981", "#34D399"],
  abs: ["#0EA5E9", "#10B981"],
  "home-workouts": ["#F59E0B", "#FDBA74"],
  strength: ["#111827", "#10B981"],
  mobility: ["#06B6D4", "#60A5FA"],
  glutes: ["#EC4899", "#F59E0B"]
};

const styleAccent: Record<StyleValue, string> = {
  motivational: "#10B981",
  funny: "#F59E0B",
  challenge: "#0EA5E9"
};

export function ThumbnailMockup({
  goal,
  style,
  label
}: {
  goal: GoalValue;
  style: StyleValue;
  label: string;
}) {
  const [start, end] = goalPalette[goal];
  const accent = styleAccent[style];

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/60 bg-slate-950/95 shadow-card dark:border-white/10">
      <svg
        aria-hidden="true"
        className="h-full w-full"
        viewBox="0 0 320 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`reelfit-${goal}-${style}`} x1="0" y1="0" x2="320" y2="220">
            <stop stopColor={start} />
            <stop offset="1" stopColor={end} />
          </linearGradient>
        </defs>
        <rect width="320" height="220" rx="24" fill="#0B1020" />
        <circle cx="54" cy="54" r="80" fill={accent} opacity="0.18" />
        <circle cx="264" cy="182" r="70" fill={end} opacity="0.2" />
        <rect x="24" y="26" width="74" height="10" rx="5" fill="white" fillOpacity="0.34" />
        <rect x="24" y="48" width="150" height="78" rx="18" fill={`url(#reelfit-${goal}-${style})`} />
        <rect x="185" y="50" width="111" height="12" rx="6" fill="white" fillOpacity="0.86" />
        <rect x="185" y="72" width="88" height="10" rx="5" fill="white" fillOpacity="0.6" />
        <rect x="24" y="148" width="168" height="12" rx="6" fill="white" fillOpacity="0.9" />
        <rect x="24" y="170" width="112" height="10" rx="5" fill="white" fillOpacity="0.44" />
        <rect x="24" y="190" width="82" height="8" rx="4" fill={accent} fillOpacity="0.9" />
        <foreignObject x="34" y="58" width="130" height="54">
          <div
            className="flex h-full items-end text-balance text-xl font-bold leading-tight text-white"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {label}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
