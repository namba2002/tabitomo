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
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* アイコン */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 100,
            height: 100,
            borderRadius: 24,
            background: "#3b82f6",
            marginBottom: 36,
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 22h20" />
            <path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z" />
          </svg>
        </div>

        {/* アプリ名 */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-2px",
            marginBottom: 20,
          }}
        >
          tabitomo
        </div>

        {/* タグライン */}
        <div
          style={{
            fontSize: 30,
            color: "#6b7280",
            fontWeight: 400,
          }}
        >
          みんなで行きたい場所を共有しよう
        </div>
      </div>
    ),
    size
  );
}
