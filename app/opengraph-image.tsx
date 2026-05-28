import { ImageResponse } from "next/og";

export const alt = "AvenirLux — Quiet luxury hotels";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "linear-gradient(145deg, #0c0c0e 0%, #1a1a1f 42%, #2a2622 100%)",
          color: "#fafaf9",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.72, marginBottom: 16 }}>
          Quiet luxury
        </div>
        <div style={{ fontSize: 72, fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1.05 }}>AvenirLux</div>
        <div style={{ fontSize: 28, marginTop: 20, opacity: 0.78, maxWidth: 720, lineHeight: 1.45 }}>
          Curated cinematic stays across the world&apos;s most considered destinations.
        </div>
      </div>
    ),
    { ...size },
  );
}
