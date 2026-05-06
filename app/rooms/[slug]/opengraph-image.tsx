import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const { data: room } = await supabase
    .from("rooms")
    .select("name")
    .eq("slug", decoded)
    .single();

  const name = room?.name ?? decoded;
  const fontSize = name.length > 16 ? 60 : name.length > 10 ? 72 : 88;

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
          padding: "0 80px",
        }}
      >
        {/* tabitomo ロゴ行 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#3b82f6",
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 22h20" />
              <path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z" />
            </svg>
          </div>
          <span style={{ fontSize: 28, fontWeight: 600, color: "#6b7280" }}>
            tabitomo
          </span>
        </div>

        {/* グループ名 */}
        <div
          style={{
            fontSize,
            fontWeight: 700,
            color: "#111827",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: 32,
            letterSpacing: "-1px",
          }}
        >
          {name}
        </div>

        {/* タグライン */}
        <div
          style={{
            fontSize: 26,
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          の行きたい場所リスト
        </div>
      </div>
    ),
    size
  );
}
