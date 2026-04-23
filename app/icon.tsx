import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 512,
  height: 512
};

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #10B981 0%, #34D399 45%, #F59E0B 100%)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
          borderRadius: "96px"
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 180,
            fontWeight: 800,
            letterSpacing: "-0.06em"
          }}
        >
          RF
        </div>
      </div>
    ),
    size
  );
}
