import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ReelFit AI";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630
};

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background:
            "radial-gradient(circle at top left, rgba(16,185,129,0.26), transparent 34%), radial-gradient(circle at top right, rgba(245,158,11,0.26), transparent 28%), #0B1020",
          color: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "56px",
          width: "100%"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: "999px",
            padding: "10px 18px",
            fontSize: 24
          }}
        >
          ReelFit AI
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 900 }}>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.06em" }}>
            Generate Viral Fitness Reels in Seconds
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 34, lineHeight: 1.25 }}>
            Hooks, captions, hashtags, saved history, Supabase auth, and Stripe billing in one premium SaaS flow.
          </div>
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          {["1-click generator", "3 free / day", "$9/mo unlimited"].map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "28px",
                padding: "18px 24px",
                background: "rgba(255,255,255,0.06)",
                fontSize: 28
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
