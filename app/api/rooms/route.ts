import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { nameToSlug } from "@/lib/slug";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = body.name?.trim() || "";

  if (!name || name.length > 50) {
    return NextResponse.json({ error: "グループ名が無効です" }, { status: 400 });
  }

  const baseSlug = nameToSlug(name);

  // 同パターンのslugを1回のクエリで取得
  const { data: existing } = await supabase
    .from("rooms")
    .select("slug")
    .or(`slug.eq.${baseSlug},slug.like.${baseSlug}-%`);

  const slugSet = new Set(existing?.map((r: { slug: string }) => r.slug) ?? []);

  let slug = baseSlug;
  let suffix = 2;
  while (slugSet.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
    if (suffix > 99) {
      return NextResponse.json({ error: "同名のグループが多すぎます" }, { status: 409 });
    }
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert({ slug, name })
    .select()
    .single();

  // unique制約違反（レースコンディション）はタイムスタンプサフィックスでリトライ
  if (error) {
    if (error.code === "23505") {
      const fallbackSlug = `${baseSlug}-${Date.now()}`;
      const { data: retryData, error: retryError } = await supabase
        .from("rooms")
        .insert({ slug: fallbackSlug, name })
        .select()
        .single();
      if (retryError) {
        return NextResponse.json({ error: "ルームの作成に失敗しました" }, { status: 500 });
      }
      return NextResponse.json({ slug: retryData.slug, name: retryData.name }, { status: 201 });
    }
    return NextResponse.json({ error: "ルームの作成に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ slug: data.slug, name: data.name }, { status: 201 });
}
