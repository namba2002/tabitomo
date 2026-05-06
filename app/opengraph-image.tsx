import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "tabitomo - みんなで行きたい場所を共有しよう";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "#3b82f6",
            marginBottom: 32,
            fontSize: 64,
          }}
        >
          ✈️
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, color: "#1e3a5f", marginBottom: 16 }}>
          tabitomo
        </div>
        <div style={{ fontSize: 32, color: "#4b7ab0" }}>
          みんなで行きたい場所を共有しよう
        </div>
      </div>
    ),
    size
  );
}
