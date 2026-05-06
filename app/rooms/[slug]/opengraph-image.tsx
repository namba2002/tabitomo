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
          padding: "60px 80px",
        }}
      >
        <div style={{ fontSize: 36, color: "#3b82f6", marginBottom: 24, fontWeight: 600 }}>
          tabitomo ✈️
        </div>
        <div
          style={{
            fontSize: name.length > 20 ? 56 : 72,
            fontWeight: 700,
            color: "#1e3a5f",
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: 24,
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 28, color: "#4b7ab0" }}>
          みんなで行きたい場所を共有しよう
        </div>
      </div>
    ),
    size
  );
}
