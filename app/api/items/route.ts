import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Season } from "@/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { room_id, title, season } = body as {
    room_id: string;
    title: string;
    season: Season;
  };

  const trimmedTitle = title?.trim();
  if (!trimmedTitle || trimmedTitle.length > 50) {
    return NextResponse.json({ error: "タイトルが無効です" }, { status: 400 });
  }

  const validSeasons: Season[] = ["spring", "summer", "autumn", "winter", "undecided"];
  if (!validSeasons.includes(season)) {
    return NextResponse.json({ error: "季節が無効です" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("items")
    .insert({ room_id, title: trimmedTitle, season, is_done: false })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "追加に失敗しました" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
