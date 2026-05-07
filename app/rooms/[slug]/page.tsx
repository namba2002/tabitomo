import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { RoomView } from "@/components/ItemList";
import { ShareButton } from "@/components/ShareButton";
import { Item } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RoomPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  // ルーム取得
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, slug, name, created_at")
    .eq("slug", slug)
    .single();

  if (roomError || !room) {
    notFound();
  }

  // アイテム取得
  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("room_id", room.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col h-svh max-w-lg mx-auto bg-white shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <header className="flex-shrink-0 px-4 pt-3 pb-3 border-b border-gray-100 bg-white">
        <div className="relative flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-bold text-blue-500 tracking-[0.2em] uppercase">tabitomo</p>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{room.name}</h1>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <ShareButton roomName={room.name} />
          </div>
        </div>
      </header>

      {/* メインコンテンツ（スクロール可能 + 下部固定フォーム） */}
      <RoomView
        initialItems={(items ?? []) as Item[]}
        roomId={room.id}
      />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const { data: room } = await supabase
    .from("rooms")
    .select("name")
    .eq("slug", slug)
    .single();

  const title = room?.name ? `${room.name} | tabitomo` : "行きたい場所リスト | tabitomo";
  const description = room?.name
    ? `${room.name}の行きたい場所リスト`
    : "みんなで行きたい場所を共有しよう";

  return {
    title,
    openGraph: {
      title,
      description,
      siteName: "tabitomo",
      locale: "ja_JP",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
